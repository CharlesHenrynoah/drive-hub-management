
import { DashboardLayout } from "@/components/DashboardLayout";
import { VehiclesManagement } from "@/components/vehicles/VehiclesManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function VehiclesPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="w-full max-w-full overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold truncate">Gestion des véhicules</h1>
          </div>
          <ScrollArea className="w-full h-[calc(100vh-160px)]">
            <div className="pr-4 pb-8">
              <VehiclesManagement />
            </div>
          </ScrollArea>
        </div>
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
