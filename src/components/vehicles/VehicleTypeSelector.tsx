
import { useState, useEffect } from "react";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { CheckIcon, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface VehicleTypeSelectorProps {
  selectedTypes: string[];
  onChange: (selectedTypes: string[]) => void;
  maxSelections?: number;
}

export function VehicleTypeSelector({
  selectedTypes,
  onChange,
  maxSelections = 6,
}: VehicleTypeSelectorProps) {
  const { data: vehicleTypes, isLoading } = useVehicleTypes();
  const [error, setError] = useState<string | null>(null);

  const handleTypeClick = (type: string) => {
    const isSelected = selectedTypes.includes(type);
    
    if (isSelected) {
      // Retirer le type
      onChange(selectedTypes.filter(t => t !== type));
      setError(null);
    } else {
      // Ajouter le type s'il n'y a pas trop de sélections
      if (selectedTypes.length >= maxSelections) {
        setError(`Vous pouvez sélectionner maximum ${maxSelections} types de véhicules`);
        return;
      }
      
      onChange([...selectedTypes, type]);
      setError(null);
    }
  };

  if (isLoading) {
    return <div>Chargement des types de véhicules...</div>;
  }

  if (!vehicleTypes || vehicleTypes.length === 0) {
    return <div>Aucun type de véhicule disponible</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTypes.length > 0 ? (
          selectedTypes.map((type) => (
            <Badge key={type} variant="outline" className="bg-primary/10">
              {type}
            </Badge>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">Aucun type sélectionné</div>
        )}
      </div>
      
      <ScrollArea className="h-[220px] pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {vehicleTypes.map((vehicleType) => (
            <Button
              key={vehicleType.id}
              type="button"
              variant="outline"
              onClick={() => handleTypeClick(vehicleType.type)}
              className={cn(
                "flex items-start justify-between p-3 h-auto",
                selectedTypes.includes(vehicleType.type) && "border-primary ring-1 ring-primary"
              )}
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">{vehicleType.type}</span>
                <span className="text-xs text-muted-foreground">
                  {vehicleType.description}
                </span>
                <span className="text-xs mt-1">
                  Capacité: {vehicleType.capacity_min} - {vehicleType.capacity_max} passagers
                </span>
              </div>
              {selectedTypes.includes(vehicleType.type) && (
                <CheckIcon className="h-4 w-4 text-primary" />
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      {error && <div className="text-sm text-destructive mt-1">{error}</div>}
      <div className="text-xs text-muted-foreground mt-1">
        Sélectionnez jusqu'à {maxSelections} types de véhicules
      </div>
    </div>
  );
}
