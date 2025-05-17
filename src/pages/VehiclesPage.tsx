
import { DashboardLayout } from "@/components/DashboardLayout";
import { VehiclesManagement } from "@/components/vehicles/VehiclesManagement";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function VehiclesPage() {
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifie si le bucket de stockage pour les images de véhicules existe
  useEffect(() => {
    const checkStorageBucket = async () => {
      try {
        setLoading(true);
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error('Erreur lors de la vérification des buckets:', error);
          toast.error("Erreur lors de la vérification du stockage");
          return;
        }
        
        // Vérifier si le bucket "vehicles" existe dans la liste des buckets
        const vehiclesBucket = buckets.find(bucket => bucket.name === 'vehicles');
        if (vehiclesBucket) {
          console.log('Bucket de stockage "vehicles" existe');
          setBucketExists(true);
        } else {
          console.log('Le bucket "vehicles" n\'existe pas');
          setBucketExists(false);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du stockage:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStorageBucket();
  }, []);

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
                {!loading && bucketExists === false && (
                  <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                    Avertissement: Le bucket de stockage pour les images de véhicules n'est pas correctement configuré.
                  </div>
                )}
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
