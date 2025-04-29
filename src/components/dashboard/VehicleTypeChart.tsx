
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Données mockées
const data = [
  { type: "Berline", valeur: 30 },
  { type: "SUV", valeur: 20 },
  { type: "Utilitaire", valeur: 25 },
  { type: "Minibus", valeur: 15 },
  { type: "Autre", valeur: 10 },
];

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
