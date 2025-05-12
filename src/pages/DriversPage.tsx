
import { DashboardLayout } from "@/components/DashboardLayout";
import { DriversManagement } from "@/components/drivers/DriversManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DriversPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="w-full max-w-full overflow-hidden">
          <h1 className="text-2xl font-bold mb-6 truncate">Gestion des chauffeurs</h1>
          <ScrollArea className="w-full">
            <DriversManagement />
          </ScrollArea>
        </div>
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
