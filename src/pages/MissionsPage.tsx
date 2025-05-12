
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MissionsCalendar } from "@/components/missions/MissionsCalendar";
import { NewMissionModal } from "@/components/missions/NewMissionModal";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MissionsPage() {
  const [isNewMissionModalOpen, setIsNewMissionModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMissionCreated = () => {
    // Trigger a refresh of the missions list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Calendrier des missions</h1>
            <Button onClick={() => setIsNewMissionModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nouvelle mission
            </Button>
          </div>
          <MissionsCalendar key={`missions-calendar-${refreshTrigger}`} />
          
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
