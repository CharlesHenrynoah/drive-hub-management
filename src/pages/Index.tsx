
import { DashboardLayout } from "@/components/DashboardLayout";
import { Overview } from "@/components/dashboard/Overview";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

const Index = () => {
  return (
    <AuthProvider>
      <DashboardLayout>
        <Overview />
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
};

export default Index;
