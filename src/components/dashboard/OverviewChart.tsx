
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface OverviewChartProps {
  hideFinancialData: boolean;
}

interface ChartDataPoint {
  mois: string;
  missions: number;
  revenus: number;
}

const CustomTooltip = ({ active, payload, label, hideFinancialData }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded-md shadow-sm">
        <p className="font-medium">{label}</p>
        <p className="text-primary">{`Missions: ${payload[0].value}`}</p>
        {!hideFinancialData && (
          <p className="text-success">{`Revenus: ${payload[1].value.toLocaleString()} €`}</p>
        )}
      </div>
    );
  }
  return null;
};

export function OverviewChart({ hideFinancialData }: OverviewChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
        let monthlyData: ChartDataPoint[] = [];

        // Récupérer les données des 6 derniers mois
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(today, i);
          const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
          const monthName = format(monthDate, 'MMM', { locale: fr });

          const { count, error } = await supabase
            .from('missions')
            .select('*', { count: 'exact', head: false })
            .gte('date', startOfMonth.toISOString())
            .lt('date', endOfMonth.toISOString());

          if (error) throw error;

          // Simuler des revenus basés sur le nombre de missions
          // Dans une application réelle, vous récupéreriez les données financières réelles
          const revenue = (count || 0) * 400; // Estimation de 400€ par mission en moyenne

          monthlyData.push({
            mois: monthName,
            missions: count || 0,
            revenus: revenue
          });
        }

        setData(monthlyData);
      } catch (error) {
        console.error("Erreur lors du chargement des données d'aperçu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
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
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mois" />
        <YAxis 
          yAxisId="missions" 
          domain={[0, 'auto']}
          allowDecimals={false}
          label={{ value: 'Missions', angle: -90, position: 'insideLeft' }}
        />
        {!hideFinancialData && (
          <YAxis
            yAxisId="revenus"
            orientation="right"
            domain={[0, 'auto']}
            tickFormatter={(value) => `${(value / 1000)}k€`}
            label={{ value: 'Revenus (€)', angle: 90, position: 'insideRight' }}
          />
        )}
        <Tooltip content={(props) => <CustomTooltip {...props} hideFinancialData={hideFinancialData} />} />
        <Legend />
        <Line
          yAxisId="missions"
          type="monotone"
          dataKey="missions"
          name="Missions"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        {!hideFinancialData && (
          <Line
            yAxisId="revenus"
            type="monotone"
            dataKey="revenus"
            name="Revenus"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
