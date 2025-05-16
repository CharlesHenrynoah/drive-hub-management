
import { DashboardLayout } from "@/components/DashboardLayout";
import { VehiclesManagement } from "@/components/vehicles/VehiclesManagement";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          
          <Tabs defaultValue="vehicles" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
              <TabsTrigger value="map">Carte</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vehicles" className="w-full">
              <div className="border rounded-lg p-4 md:p-6 bg-card">
                <VehiclesManagement />
              </div>
            </TabsContent>
            
            <TabsContent value="map" className="w-full">
              <div className="border rounded-lg p-4 md:p-6 bg-card flex items-center justify-center h-[500px] text-muted-foreground">
                Carte de localisation des véhicules (fonctionnalité à venir)
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="w-full">
              <div className="border rounded-lg p-4 md:p-6 bg-card flex items-center justify-center h-[500px] text-muted-foreground">
                Statistiques des véhicules (fonctionnalité à venir)
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
