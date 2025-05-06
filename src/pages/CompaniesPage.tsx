
import { DashboardLayout } from "@/components/DashboardLayout";
import { CompaniesManagement } from "@/components/companies/CompaniesManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export default function CompaniesPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Gestion des entreprises</h1>
          <CompaniesManagement />
        </div>
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
