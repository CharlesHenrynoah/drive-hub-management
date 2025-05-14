
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDriverVehicleTypes(driverId?: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["driver-vehicle-types", driverId],
    queryFn: async () => {
      if (!driverId) return [];
      
      const { data, error } = await supabase
        .from("driver_vehicle_types")
        .select("vehicle_type")
        .eq("driver_id", driverId);
        
      if (error) {
        throw error;
      }
      
      return data?.map(item => item.vehicle_type) || [];
    },
    enabled: !!driverId,
  });

  const updateMutation = useMutation({
    mutationFn: async (vehicleTypes: string[]) => {
      if (!driverId) return null;
      
      // Supprimer les associations existantes
      const { error: deleteError } = await supabase
        .from("driver_vehicle_types")
        .delete()
        .eq("driver_id", driverId);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Créer les nouvelles associations
      if (vehicleTypes.length > 0) {
        const newAssociations = vehicleTypes.map(type => ({
          driver_id: driverId,
          vehicle_type: type
        }));
        
        const { error: insertError } = await supabase
          .from("driver_vehicle_types")
          .insert(newAssociations);
          
        if (insertError) {
          throw insertError;
        }
      }
      
      return vehicleTypes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-vehicle-types", driverId] });
      toast.success("Types de véhicules mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour des types de véhicules:", error);
      toast.error("Erreur lors de la mise à jour des types de véhicules");
    },
  });

  return {
    vehicleTypes: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    updateVehicleTypes: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
}
