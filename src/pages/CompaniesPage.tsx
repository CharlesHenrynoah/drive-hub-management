
import { DashboardLayout } from "@/components/DashboardLayout";
import { CompaniesManagement } from "@/components/companies/CompaniesManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export default function CompaniesPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="w-full max-w-full overflow-hidden">
          <h1 className="text-2xl font-bold mb-6 truncate">Gestion des entreprises</h1>
          <div className="overflow-hidden">
            <CompaniesManagement />
          </div>
        </div>
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
