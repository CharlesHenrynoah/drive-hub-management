
import { useState, useEffect } from "react";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
  const { data: vehicleTypes = [], isLoading } = useVehicleTypes();
  const [error, setError] = useState<string | null>(null);

  // Ensure all vehicle types are valid (no empty strings)
  const validVehicleTypes = vehicleTypes.filter(vt => 
    vt && 
    typeof vt.type === 'string' && 
    vt.type.trim() !== '' &&
    vt.id !== null && 
    vt.id !== undefined
  );
  
  // Clean up any invalid selections whenever vehicle types change
  useEffect(() => {
    if (validVehicleTypes.length > 0 && selectedTypes.length > 0) {
      // Filter out any invalid or empty selected types
      const validSelectedTypes = selectedTypes.filter(type => 
        type && 
        typeof type === 'string' &&
        type.trim() !== '' && 
        validVehicleTypes.some(vt => vt.type === type)
      );
      
      // Update selected types if any were filtered out
      if (validSelectedTypes.length !== selectedTypes.length) {
        onChange(validSelectedTypes);
      }
    }
  }, [validVehicleTypes, selectedTypes, onChange]);

  const handleTypeClick = (type: string) => {
    if (!type || type.trim() === '') {
      console.warn("Attempted to select empty vehicle type");
      return;
    }
    
    // Check if already selected
    const isSelected = selectedTypes.includes(type);
    
    if (isSelected) {
      // Remove from selection
      onChange(selectedTypes.filter(t => t !== type));
      setError(null);
    } else {
      // Add to selection if under max limit
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

  if (!validVehicleTypes || validVehicleTypes.length === 0) {
    return <div>Aucun type de véhicule disponible</div>;
  }

  // Ensure selected types are all valid
  const safeSelectedTypes = selectedTypes.filter(type => 
    type && 
    type.trim() !== '' && 
    validVehicleTypes.some(vt => vt.type === type)
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {safeSelectedTypes.length > 0 ? (
          safeSelectedTypes.map((type) => (
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
          {validVehicleTypes.map((vehicleType) => {
            // Ensure type is non-empty to prevent SelectItem errors
            if (!vehicleType.type || vehicleType.type.trim() === '') {
              return null; // Skip this item completely
            }
            
            return (
              <Button
                key={vehicleType.id}
                type="button"
                variant="outline"
                onClick={() => handleTypeClick(vehicleType.type)}
                className={cn(
                  "flex items-start justify-between p-3 h-auto",
                  safeSelectedTypes.includes(vehicleType.type) && "border-primary ring-1 ring-primary"
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
                {safeSelectedTypes.includes(vehicleType.type) && (
                  <CheckIcon className="h-4 w-4 text-primary" />
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      
      {error && <div className="text-sm text-destructive mt-1">{error}</div>}
      <div className="text-xs text-muted-foreground mt-1">
        Sélectionnez jusqu'à {maxSelections} types de véhicules
      </div>
    </div>
  );
}
