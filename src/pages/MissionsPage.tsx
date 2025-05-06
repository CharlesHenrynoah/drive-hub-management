
import { DashboardLayout } from "@/components/DashboardLayout";
import { MissionsCalendar } from "@/components/missions/MissionsCalendar";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export default function MissionsPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Calendrier des missions</h1>
          <MissionsCalendar />
        </div>
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
