
import { DashboardLayout } from "@/components/DashboardLayout";
import { FleetsManagement } from "@/components/fleets/FleetsManagement";
import { AuthProvider } from "@/hooks/useAuth";

export default function FleetsPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <FleetsManagement />
      </DashboardLayout>
    </AuthProvider>
  );
}
