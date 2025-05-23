
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
      const { data, error } = await supabase
        .from("vehicle_types")
        .select("*")
        .order('capacity_min');
      
      if (error) {
        throw error;
      }
      
      // Si aucun type de véhicule n'est retourné, on ajoute les types par défaut
      if (!data || data.length === 0) {
        console.log("Aucun type de véhicule trouvé, retour des types par défaut");
        return [
          {
            id: 1,
            type: "Minibus",
            description: "Petit bus pour groupes restreints",
            capacity_min: 15,
            capacity_max: 19,
            image_url: null,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            type: "Minicar",
            description: "Bus de taille moyenne",
            capacity_min: 30,
            capacity_max: 38,
            image_url: null,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            type: "Autocar Standard",
            description: "Bus standard pour groupes importants",
            capacity_min: 50,
            capacity_max: 65,
            image_url: null,
            created_at: new Date().toISOString()
          },
          {
            id: 4,
            type: "Autocar Grand Tourisme",
            description: "Bus grand confort à double étage",
            capacity_min: 80,
            capacity_max: 93,
            image_url: null,
            created_at: new Date().toISOString()
          },
          {
            id: 5,
            type: "VTC",
            description: "Voiture de tourisme avec chauffeur",
            capacity_min: 3,
            capacity_max: 4,
            image_url: null,
            created_at: new Date().toISOString()
          },
          {
            id: 6,
            type: "Berline",
            description: "Voiture confortable pour petits groupes",
            capacity_min: 3,
            capacity_max: 4,
            image_url: null,
            created_at: new Date().toISOString()
          },
          {
            id: 7,
            type: "Van",
            description: "Véhicule spacieux avec chauffeur",
            capacity_min: 8,
            capacity_max: 9,
            image_url: null,
            created_at: new Date().toISOString()
          }
        ];
      }
      
      // Strict validation: ensure no empty strings in type field and provide fallbacks
      const validatedTypes = data
        .filter(vt => {
          // Filter out null, undefined or empty type entries
          if (!vt || vt.type === undefined || vt.type === null) return false;
          
          // Ensure proper type data
          return vt.id !== null && 
                 vt.id !== undefined &&
                 typeof vt.type === 'string';
        })
        .map(vt => {
          // Ensure the type value is never an empty string
          let typeValue = (typeof vt.type === 'string') ? vt.type.trim() : `Type ${vt.id}`;
          
          // If somehow type is empty after trimming, provide a fallback using the ID
          if (typeValue === '') {
            typeValue = `Type ${vt.id}`;
          }
          
          return {
            ...vt,
            type: typeValue
          };
        });
      
      console.log("Validated vehicle types:", validatedTypes);
      
      // Extra safety check - if we somehow ended up with empty types, return default types
      if (validatedTypes.length === 0) {
        console.warn("No valid vehicle types found after validation, using defaults");
        return [
          {
            id: 1,
            type: "Minibus",
            description: "Type par défaut",
            capacity_min: 15,
            capacity_max: 19,
            image_url: null,
            created_at: new Date().toISOString()
          }
        ];
      }
      
      return validatedTypes;
    },
  });
}
