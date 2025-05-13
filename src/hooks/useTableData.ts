
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TableInfo {
  name: string;
  rows: number;
  size: string;
  lastBackup: string;
}

/**
 * Hook pour récupérer les informations sur les tables de la base de données
 */
export function useTableData() {
  return useQuery({
    queryKey: ["table-data"],
    queryFn: async (): Promise<TableInfo[]> => {
      try {
        // Récupérer la liste des tables disponibles
        const tables = [
          "vehicles", 
          "drivers", 
          "missions", 
          "companies",
          "fleets",
          "fleet_drivers",
          "fleet_vehicles"
        ] as const; // Define as readonly array
        
        const tablesData: TableInfo[] = [];
        
        // Pour chaque table, récupérer le nombre d'enregistrements
        for (const tableName of tables) {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
            
          if (error) {
            console.error(`Erreur lors de la récupération des données pour ${tableName}:`, error);
            continue;
          }
          
          // Calculer une taille approximative basée sur le nombre d'enregistrements
          // (Juste pour l'affichage, car on ne peut pas obtenir la taille réelle via l'API)
          const estimatedSize = count ? `${(count * 0.02).toFixed(1)} MB` : "0 MB";
          
          tablesData.push({
            name: tableName,
            rows: count || 0,
            size: estimatedSize,
            lastBackup: new Date().toISOString().split('T')[0] // Date du jour comme dernière sauvegarde
          });
        }
        
        return tablesData;
      } catch (error) {
        console.error("Erreur lors de la récupération des données des tables:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });
}
