
import { DashboardLayout } from "@/components/DashboardLayout";
import { VehiclesManagement } from "@/components/vehicles/VehiclesManagement";
import { Helmet } from "react-helmet-async";

export default function VehiclesPage() {
  return (
    <>
      <Helmet>
        <title>Véhicules | Hermes</title>
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion des véhicules</h2>
            <p className="text-muted-foreground">
              Gérez votre flotte de véhicules et leurs caractéristiques
            </p>
          </div>
          <div className="border rounded-lg p-4 md:p-6 bg-card">
            <VehiclesManagement />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
