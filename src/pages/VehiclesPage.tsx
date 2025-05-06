
import { DashboardLayout } from "@/components/DashboardLayout";
import { VehiclesManagement } from "@/components/vehicles/VehiclesManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export default function VehiclesPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <VehiclesManagement />
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
