
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

// Données mockées
const data = [
  { mois: "Janvier", missions: 45 },
  { mois: "Février", missions: 52 },
  { mois: "Mars", missions: 61 },
  { mois: "Avril", missions: 67 },
  { mois: "Mai", missions: 75 },
  { mois: "Juin", missions: 78 },
];

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
