
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  YAxisProps
} from "recharts";

interface OverviewChartProps {
  hideFinancialData: boolean;
}

// Données mockées
const data = [
  {
    mois: "Jan",
    missions: 32,
    revenus: 12500,
  },
  {
    mois: "Fév",
    missions: 40,
    revenus: 15800,
  },
  {
    mois: "Mar",
    missions: 45,
    revenus: 18000,
  },
  {
    mois: "Avr",
    missions: 55,
    revenus: 22500,
  },
  {
    mois: "Mai",
    missions: 60,
    revenus: 24000,
  },
  {
    mois: "Juin",
    missions: 65,
    revenus: 26300,
  },
];

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
          domain={[0, 100]}
          allowDecimals={false}
          label={{ value: 'Missions', angle: -90, position: 'insideLeft' }}
        />
        {!hideFinancialData && (
          <YAxis
            yAxisId="revenus"
            orientation="right"
            domain={[0, 30000]}
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
