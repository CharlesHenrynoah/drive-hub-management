
import { DashboardLayout } from "@/components/DashboardLayout";
import { DriversManagement } from "@/components/drivers/DriversManagement";
import { AuthProvider } from "@/hooks/useAuth";

export default function DriversPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <DriversManagement />
      </DashboardLayout>
    </AuthProvider>
  );
}
