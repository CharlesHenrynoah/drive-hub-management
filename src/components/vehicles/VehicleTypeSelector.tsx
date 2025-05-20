
import { useState, useEffect } from "react";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface VehicleTypeSelectorProps {
  selectedType?: string;
  onTypeChange: (type: string) => void;
}

export function VehicleTypeSelector({
  selectedType = "",
  onTypeChange,
}: VehicleTypeSelectorProps) {
  const { data: vehicleTypes = [], isLoading } = useVehicleTypes();
  const [error, setError] = useState<string | null>(null);
  
  // Handle type selection
  const handleTypeClick = (type: string) => {
    if (!type || type.trim() === '') {
      console.warn("Attempted to select empty vehicle type");
      return;
    }
    
    // If the same type is clicked, deselect it
    if (selectedType === type) {
      onTypeChange("");
    } else {
      onTypeChange(type);
    }
  };

  // Filter valid vehicle types
  const validVehicleTypes = vehicleTypes.filter(vt => 
    vt && 
    typeof vt.type === 'string' && 
    vt.type.trim() !== '' &&
    vt.id !== null && 
    vt.id !== undefined
  );

  if (isLoading) {
    return <div>Chargement des types de véhicules...</div>;
  }

  if (!validVehicleTypes || validVehicleTypes.length === 0) {
    return <div>Aucun type de véhicule disponible</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedType ? (
          <Badge key={selectedType} variant="outline" className="bg-primary/10">
            {selectedType}
          </Badge>
        ) : (
          <div className="text-sm text-muted-foreground">Aucun type sélectionné</div>
        )}
      </div>
      
      <ScrollArea className="h-[220px] pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {validVehicleTypes.map((vehicleType) => {
            // Ensure type is non-empty to prevent errors
            if (!vehicleType.type || vehicleType.type.trim() === '') {
              return null;
            }
            
            return (
              <Button
                key={vehicleType.id}
                type="button"
                variant="outline"
                onClick={() => handleTypeClick(vehicleType.type)}
                className={cn(
                  "flex items-start justify-between p-3 h-auto",
                  selectedType === vehicleType.type && "border-primary ring-1 ring-primary"
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
                {selectedType === vehicleType.type && (
                  <CheckIcon className="h-4 w-4 text-primary" />
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
