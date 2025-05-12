
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

// Composant personnalisé pour le tooltip
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded-md shadow-sm">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-primary">{`Missions : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export function MissionChart() {
  const [data, setData] = useState<Array<{ mois: string; missions: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMissionData = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
        let monthlyData = [];

        // Récupérer les données des 6 derniers mois
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(today, i);
          const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

          const { count, error } = await supabase
            .from('missions')
            .select('*', { count: 'exact', head: false })
            .gte('date', startOfMonth.toISOString())
            .lt('date', endOfMonth.toISOString());

          if (error) throw error;

          monthlyData.push({
            mois: format(monthDate, 'MMMM', { locale: fr }),
            missions: count || 0
          });
        }

        setData(monthlyData);
      } catch (error) {
        console.error("Erreur lors du chargement des données de missions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissionData();
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
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mois" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="missions"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
