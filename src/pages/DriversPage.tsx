
import { DashboardLayout } from "@/components/DashboardLayout";
import { DriversManagement } from "@/components/drivers/DriversManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export default function DriversPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <DriversManagement />
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
