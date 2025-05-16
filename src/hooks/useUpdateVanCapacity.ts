
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useVehicleTypes } from "./useVehicleTypes";

export function useUpdateVanCapacity() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { refetch } = useVehicleTypes();

  const updateVanCapacity = async () => {
    setIsUpdating(true);
    try {
      // Appel à la fonction Edge pour mettre à jour la capacité
      const { error } = await supabase.functions.invoke('update-van-capacity');
      
      if (error) throw error;
      
      // Actualiser les données
      refetch();
      toast.success("La capacité du Van a été mise à jour à 9 passagers");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour de la capacité du Van");
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateVanCapacity, isUpdating };
}
