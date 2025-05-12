
import { DashboardLayout } from "@/components/DashboardLayout";
import { FleetsManagement } from "@/components/fleets/FleetsManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export default function FleetsPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="w-full max-w-full overflow-hidden">
          <h1 className="text-2xl font-bold mb-6 truncate">Gestion des flottes</h1>
          <div className="overflow-hidden">
            <FleetsManagement />
          </div>
        </div>
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
