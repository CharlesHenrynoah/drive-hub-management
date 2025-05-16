
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VehicleTypesManagement } from "@/components/vehicles/VehicleTypesManagement";

export default function VehicleTypesPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="w-full max-w-full overflow-hidden">
          <h1 className="text-2xl font-bold mb-6 truncate">Types de véhicules</h1>
          <ScrollArea className="w-full h-[calc(100vh-160px)]">
            <div className="pr-4 pb-8">
              <VehicleTypesManagement />
            </div>
          </ScrollArea>
        </div>
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
