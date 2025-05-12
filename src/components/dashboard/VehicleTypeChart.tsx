
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Couleurs pour les types de véhicules
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--muted))",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded-md shadow-sm">
        <p className="font-medium">{`${payload[0].name}`}</p>
        <p className="text-sm">{`${payload[0].value} véhicules`}</p>
      </div>
    );
  }
  return null;
};

export function VehicleTypeChart() {
  const [data, setData] = useState<Array<{ type: string; valeur: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      setIsLoading(true);
      try {
        const { data: vehicles, error } = await supabase
          .from('vehicles')
          .select('type');

        if (error) throw error;

        // Regrouper les véhicules par type
        const typeCount: Record<string, number> = {};
        vehicles.forEach(vehicle => {
          const type = vehicle.type || "Autre";
          typeCount[type] = (typeCount[type] || 0) + 1;
        });

        const chartData = Object.entries(typeCount).map(([type, count]) => ({
          type,
          valeur: count
        }));

        setData(chartData);
      } catch (error) {
        console.error("Erreur lors du chargement des types de véhicules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleTypes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          dataKey="valeur"
          nameKey="type"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
