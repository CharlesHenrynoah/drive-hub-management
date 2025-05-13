
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbStats {
  tableCount: number;
  totalRows: number;
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  lastBackupDate: string;
}

/**
 * Hook pour récupérer les statistiques générales de la base de données
 */
export function useDbStats() {
  return useQuery({
    queryKey: ["db-stats"],
    queryFn: async (): Promise<DbStats> => {
      try {
        // Récupérer la liste des tables principales
        const tables = [
          "vehicles", 
          "drivers", 
          "missions", 
          "companies",
          "fleets",
          "fleet_drivers",
          "fleet_vehicles"
        ] as const; // Define as readonly array
        
        let totalRows = 0;
        let tableCount = tables.length;
        
        // Compter le nombre total d'enregistrements
        for (const tableName of tables) {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
            
          if (error) {
            console.error(`Erreur lors de la récupération des données pour ${tableName}:`, error);
            continue;
          }
          
          totalRows += count || 0;
        }
        
        // Simuler des valeurs pour l'espace disque (pas accessible directement via l'API)
        // Dans une vraie application, ces données pourraient venir d'une fonction backend
        const usedSpace = Math.max(0.5, totalRows * 0.05); // en GB, minimum 0.5GB
        const totalSpace = 20; // 20GB disponible au total
        const usagePercentage = (usedSpace / totalSpace) * 100;
        
        return {
          tableCount,
          totalRows,
          diskUsage: {
            used: parseFloat(usedSpace.toFixed(1)),
            total: totalSpace,
            percentage: parseFloat(usagePercentage.toFixed(1))
          },
          lastBackupDate: new Date().toISOString().split('T')[0] // Date du jour comme dernière sauvegarde
        };
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques de la base de données:", error);
        return {
          tableCount: 0,
          totalRows: 0,
          diskUsage: {
            used: 0,
            total: 20,
            percentage: 0
          },
          lastBackupDate: new Date().toISOString().split('T')[0]
        };
      }
    },
    refetchOnWindowFocus: false
  });
}
