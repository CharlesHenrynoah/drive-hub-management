
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type VehicleType = {
  id: number;
  type: string;
  description: string;
  capacity_min: number;
  capacity_max: number;
  image_url: string | null;
  created_at: string;
};

export function useVehicleTypes() {
  return useQuery({
    queryKey: ["vehicle-types"],
    queryFn: async (): Promise<VehicleType[]> => {
      const { data, error } = await supabase.from("vehicle_types").select("*").order('capacity_min');
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
  });
}
