
import { Label } from "@/components/ui/label";
import { Gauge, Loader2 } from "lucide-react";

interface EcologicalScoreDisplayProps {
  score: number;
  calculatingScore: boolean;
}

export function EcologicalScoreDisplay({ 
  score, 
  calculatingScore 
}: EcologicalScoreDisplayProps) {
  // Déterminer la couleur de la barre de progression en fonction du score écologique
  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500"; // Très écologique
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-yellow-400";
    if (score >= 20) return "bg-orange-400";
    return "bg-red-500"; // Peu écologique
  };

  return (
    <div className="space-y-2 col-span-1 md:col-span-2">
      <Label htmlFor="ecological_score" className="flex items-center gap-1">
        Score écologique (0-100)
        {calculatingScore && <Loader2 className="h-3 w-3 animate-spin" />}
      </Label>
      
      <div className="flex items-center gap-2 mb-2">
        <Gauge className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium text-lg">{score}</span>
      </div>
      
      <div className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full transition-all duration-500 ease-in-out ${getProgressColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Le score écologique est calculé automatiquement en fonction du type de véhicule, 
        du carburant, de la capacité et de l'année du véhicule
      </p>
    </div>
  );
}
