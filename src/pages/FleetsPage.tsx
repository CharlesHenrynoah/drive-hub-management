
import { DashboardLayout } from "@/components/DashboardLayout";
import { FleetsManagement } from "@/components/fleets/FleetsManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export default function FleetsPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Gestion des flottes</h1>
          <FleetsManagement />
        </div>
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
