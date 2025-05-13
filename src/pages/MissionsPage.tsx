
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MissionsCalendar } from "@/components/missions/MissionsCalendar";
import { NewMissionModal } from "@/components/missions/NewMissionModal";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MissionsPage() {
  const [isNewMissionModalOpen, setIsNewMissionModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState<"month" | "week">("month");

  // Fonction pour mettre à jour automatiquement le statut des missions
  const updateMissionsStatus = async () => {
    try {
      // Appel de la fonction edge pour mettre à jour les statuts
      const { data, error } = await supabase.functions.invoke("update-mission-status");
      
      if (error) {
        console.error("Erreur lors de la mise à jour des statuts de mission:", error);
        return;
      }
      
      // Si des missions ont été mises à jour, rafraîchir l'affichage
      if (data && data.updatedMissions && data.updatedMissions.length > 0) {
        setRefreshTrigger(prev => prev + 1);
        toast.info(`${data.updatedMissions.length} mission(s) terminée(s) automatiquement`);
      }
    } catch (e) {
      console.error("Erreur lors de l'appel à la fonction de mise à jour:", e);
    }
  };

  // Mise à jour du statut des missions à l'initialisation et toutes les 5 minutes
  useEffect(() => {
    // Mise à jour au chargement de la page
    updateMissionsStatus();
    
    // Configuration de l'intervalle de mise à jour (toutes les 5 minutes)
    const interval = setInterval(updateMissionsStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMissionCreated = () => {
    // Trigger a refresh of the missions list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="w-full max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold truncate">Calendrier des missions</h1>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "month" | "week")} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="month">Mois</TabsTrigger>
                  <TabsTrigger value="week">Semaine</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button onClick={() => setIsNewMissionModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nouvelle mission
              </Button>
            </div>
          </div>
          
          <ScrollArea className="w-full">
            <div className="missions-container w-full">
              {activeView === "month" ? (
                <MissionsCalendar key={`missions-calendar-${refreshTrigger}`} />
              ) : (
                <MissionsCalendar 
                  key={`missions-weekly-${refreshTrigger}`} 
                  displayMode="week"
                />
              )}
            </div>
          </ScrollArea>
          
          <NewMissionModal
            isOpen={isNewMissionModalOpen}
            onClose={() => setIsNewMissionModalOpen(false)}
            onSuccess={handleMissionCreated}
          />
        </div>
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
