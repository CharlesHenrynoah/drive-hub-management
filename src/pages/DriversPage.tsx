
import { DashboardLayout } from "@/components/DashboardLayout";
import { DriversManagement } from "@/components/drivers/DriversManagement";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function DriversPage() {
  // Créer un bucket pour les photos des chauffeurs s'il n'existe pas déjà
  useEffect(() => {
    const createDriversPhotosBucket = async () => {
      const { data: buckets } = await supabase.storage.listBuckets();
      
      // Vérifier si le bucket existe déjà
      const bucketExists = buckets?.find(bucket => bucket.name === "drivers_photos");
      
      if (!bucketExists) {
        // Créer le bucket s'il n'existe pas
        const { error } = await supabase.storage.createBucket("drivers_photos", {
          public: true,
          allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        });
        
        if (error) {
          console.error("Erreur lors de la création du bucket:", error);
        } else {
          console.log("Bucket drivers_photos créé avec succès");
        }
      }
    };
    
    createDriversPhotosBucket();
  }, []);

  return (
    <AuthProvider>
      <DashboardLayout>
        <DriversManagement />
      </DashboardLayout>
      <Toaster />
    </AuthProvider>
  );
}
