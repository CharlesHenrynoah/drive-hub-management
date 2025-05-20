
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useVehiclePhotoUpload() {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    
    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image doit être inférieure à 5MB");
      return;
    }
    
    setUploadingPhoto(true);
    setPhotoFile(file);
    
    try {
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
      
      toast.success("Photo prête à être téléchargée");
    } catch (error) {
      console.error("Error preparing photo:", error);
      toast.error("Erreur lors de la préparation de la photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const uploadPhotoToStorage = async (file: File): Promise<string | null> => {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `vehicle_photos/${fileName}`;
      
      // Télécharger vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('vehicles')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Construire l'URL publique
      const { data: publicUrl } = supabase.storage
        .from('vehicles')
        .getPublicUrl(filePath);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Error uploading to storage:", error);
      return null;
    }
  };

  return {
    photoPreview,
    uploadingPhoto,
    photoFile,
    handlePhotoUpload,
    removePhoto,
    uploadPhotoToStorage,
    setPhotoPreview
  };
}
