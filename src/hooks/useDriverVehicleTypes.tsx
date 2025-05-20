
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define the type VehicleType based on the database enum
type VehicleType = Database["public"]["Enums"]["vehicle_type"];

export function useDriverVehicleTypes(driverId?: string) {
  return useQuery({
    queryKey: ["driver-vehicle-types", driverId],
    queryFn: async () => {
      if (!driverId) return [];
      
      const { data, error } = await supabase
        .from("driver_vehicle_types")
        .select("vehicle_type")
        .eq("driver_id", driverId);
        
      if (error) {
        console.error("Error fetching driver vehicle types:", error);
        throw error;
      }
      
      return data?.map(item => item.vehicle_type) || [];
    },
    enabled: !!driverId,
  });
}
