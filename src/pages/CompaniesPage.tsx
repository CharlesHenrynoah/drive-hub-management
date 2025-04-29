
import { DashboardLayout } from "@/components/DashboardLayout";
import { CompaniesManagement } from "@/components/companies/CompaniesManagement";
import { AuthProvider } from "@/hooks/useAuth";

export default function CompaniesPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <CompaniesManagement />
      </DashboardLayout>
    </AuthProvider>
  );
}
