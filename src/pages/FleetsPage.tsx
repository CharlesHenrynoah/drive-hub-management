
import { DashboardLayout } from "@/components/DashboardLayout";
import { FleetsManagement } from "@/components/fleets/FleetsManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export default function FleetsPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <FleetsManagement />
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
