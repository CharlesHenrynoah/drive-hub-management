
import { DashboardLayout } from "@/components/DashboardLayout";
import { DriversManagement } from "@/components/drivers/DriversManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet-async";

export default function DriversPage() {
  return (
    <AuthProvider>
      <Helmet>
        <title>Chauffeurs | Hermes</title>
      </Helmet>
      <DashboardLayout>
        <div className="w-full max-w-full overflow-hidden">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion des chauffeurs</h2>
            <p className="text-muted-foreground">
              Gérez vos chauffeurs, leurs qualifications et leurs disponibilités
            </p>
          </div>
          <ScrollArea className="w-full h-[calc(100vh-180px)] mt-6">
            <div className="pr-4 pb-12">
              <DriversManagement />
            </div>
          </ScrollArea>
        </div>
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
