
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
import { useLocation } from "react-router-dom";
import { MissionDetailModal } from "@/components/missions/MissionDetailModal";
import { EditMissionModal } from "@/components/missions/EditMissionModal";
import { QueryProvider } from "@/components/QueryProvider";

export default function MissionsPage() {
  const [isNewMissionModalOpen, setIsNewMissionModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState<"month" | "week">("month");
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [isMissionDetailModalOpen, setIsMissionDetailModalOpen] = useState(false);
  const [isEditMissionModalOpen, setIsEditMissionModalOpen] = useState(false);
  
  const location = useLocation();

  // Check if there's a mission ID from navigation
  useEffect(() => {
    const fetchMissionIfNeeded = async () => {
      if (location.state?.selectedMissionId) {
        try {
          const { data, error } = await supabase
            .from('missions')
            .select(`
              *,
              drivers:driver_id(nom, prenom),
              vehicles:vehicle_id(brand, model)
            `)
            .eq('id', location.state.selectedMissionId)
            .single();
            
          if (error) {
            console.error("Erreur lors de la récupération de la mission:", error);
            toast.error("Impossible de charger les détails de la mission");
            return;
          }
          
          if (data) {
            // Format the data similar to how MissionsCalendar does
            const mission = {
              ...data,
              driver: data.drivers ? `${data.drivers.prenom} ${data.drivers.nom}` : null,
              vehicle: data.vehicles ? `${data.vehicles.brand} ${data.vehicles.model}` : null,
            };
            
            setSelectedMission(mission);
            setIsMissionDetailModalOpen(true);
          }
        } catch (error) {
          console.error("Erreur inattendue:", error);
          toast.error("Une erreur est survenue");
        }
        
        // Clear the state to avoid reopening on refresh
        window.history.replaceState({}, document.title);
      }
    };
    
    fetchMissionIfNeeded();
  }, [location.state]);

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

  // Handle mission selection
  const handleMissionSelected = (mission: any) => {
    setSelectedMission(mission);
    setIsMissionDetailModalOpen(true);
  };

  // Handle mission deletion
  const handleDeleteMission = async () => {
    if (!selectedMission?.id) return;
    
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', selectedMission.id);
        
      if (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression de la mission");
        return;
      }
      
      toast.success("Mission supprimée avec succès");
      setIsMissionDetailModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Erreur inattendue:", err);
      toast.error("Une erreur est survenue");
    }
  };

  // Handle edit button click
  const handleEditMission = () => {
    setIsMissionDetailModalOpen(false);
    setIsEditMissionModalOpen(true);
  };

  // Mise à jour du statut des missions à l'initialisation et toutes les 5 minutes
  useEffect(() => {
    // Mise à jour au chargement de la page
    updateMissionsStatus();
    
    // Configuration de l'intervalle de mise à jour (toutes les 5 minutes)
    const interval = setInterval(updateMissionsStatus, 5 * 60 * 1000);
    
    // Appel initial à companies-with-resources pour préchauffer la fonction
    const warmupFunction = async () => {
      try {
        console.log("Préchauffage de la fonction companies-with-resources...");
        await supabase.functions.invoke("companies-with-resources", {
          body: { city: "Paris" }
        });
      } catch (e) {
        console.log("Fonction préchauffée ou erreur:", e);
      }
    };
    warmupFunction();
    
    return () => clearInterval(interval);
  }, []);

  const handleMissionCreated = () => {
    // Trigger a refresh of the missions list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AuthProvider>
      <QueryProvider>
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
                  <MissionsCalendar 
                    key={`missions-calendar-${refreshTrigger}`} 
                    onMissionSelected={handleMissionSelected}
                  />
                ) : (
                  <MissionsCalendar 
                    key={`missions-weekly-${refreshTrigger}`} 
                    displayMode="week"
                    onMissionSelected={handleMissionSelected}
                  />
                )}
              </div>
            </ScrollArea>
            
            <NewMissionModal
              isOpen={isNewMissionModalOpen}
              onClose={() => setIsNewMissionModalOpen(false)}
              onSuccess={handleMissionCreated}
            />

            {selectedMission && (
              <>
                <MissionDetailModal
                  mission={selectedMission}
                  isOpen={isMissionDetailModalOpen}
                  onClose={() => setIsMissionDetailModalOpen(false)}
                  onEdit={handleEditMission}
                  onDelete={handleDeleteMission}
                />
                
                <EditMissionModal
                  mission={selectedMission}
                  isOpen={isEditMissionModalOpen}
                  onClose={() => setIsEditMissionModalOpen(false)}
                  onSuccess={() => {
                    setRefreshTrigger(prev => prev + 1);
                  }}
                />
              </>
            )}
          </div>
        </DashboardLayout>
      </QueryProvider>
      <Toaster />
    </AuthProvider>
  );
}
