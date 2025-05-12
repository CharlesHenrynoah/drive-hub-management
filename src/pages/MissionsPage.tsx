
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MissionsCalendar } from "@/components/missions/MissionsCalendar";
import { WeeklyMissionsView } from "@/components/missions/WeeklyMissionsView";
import { NewMissionModal } from "@/components/missions/NewMissionModal";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MissionsPage() {
  const [isNewMissionModalOpen, setIsNewMissionModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState<"month" | "week">("month");

  const handleMissionCreated = () => {
    // Trigger a refresh of the missions list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold">Calendrier des missions</h1>
            
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
          
          <div className="w-full overflow-x-hidden">
            {activeView === "month" ? (
              <MissionsCalendar key={`missions-calendar-${refreshTrigger}`} />
            ) : (
              <MissionsCalendar 
                key={`missions-weekly-${refreshTrigger}`} 
                displayMode="week"
              />
            )}
          </div>
          
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
