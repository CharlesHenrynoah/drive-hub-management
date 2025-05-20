
import { useState, useEffect } from "react";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface VehicleTypeSelectorProps {
  selectedType?: string;
  selectedTypes?: string[];
  onTypeChange?: (type: string) => void;
  onChange?: (types: string[]) => void;
  maxSelections?: number;
}

export function VehicleTypeSelector({
  selectedType = "",
  selectedTypes = [],
  onTypeChange,
  onChange,
  maxSelections = 1,
}: VehicleTypeSelectorProps) {
  const { data: vehicleTypes = [], isLoading } = useVehicleTypes();
  const [error, setError] = useState<string | null>(null);
  
  const isMultiSelect = maxSelections > 1;
  
  // Handle type selection for single selection mode
  const handleSingleTypeClick = (type: string) => {
    if (!type || type.trim() === '') {
      console.warn("Attempted to select empty vehicle type");
      return;
    }
    
    if (onTypeChange) {
      // If the same type is clicked, deselect it
      if (selectedType === type) {
        onTypeChange("");
      } else {
        onTypeChange(type);
      }
    }
  };
  
  // Handle type selection for multi-selection mode
  const handleMultiTypeClick = (type: string) => {
    if (!type || type.trim() === '') {
      console.warn("Attempted to select empty vehicle type");
      return;
    }
    
    if (onChange) {
      // If type is already selected, remove it
      if (selectedTypes.includes(type)) {
        onChange(selectedTypes.filter(t => t !== type));
      } 
      // If not at max selections, add the type
      else if (selectedTypes.length < maxSelections) {
        onChange([...selectedTypes, type]);
      }
      // If at max selections, show error
      else {
        setError(`Vous ne pouvez sélectionner que ${maxSelections} types de véhicules maximum`);
        setTimeout(() => setError(null), 3000);
      }
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
      {/* Show selected types */}
      <div className="flex flex-wrap gap-2 mb-2">
        {isMultiSelect ? (
          selectedTypes.length > 0 ? (
            selectedTypes.map(type => (
              <Badge key={type} variant="outline" className="bg-primary/10">
                {type}
              </Badge>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">Aucun type sélectionné</div>
          )
        ) : (
          selectedType ? (
            <Badge key={selectedType} variant="outline" className="bg-primary/10">
              {selectedType}
            </Badge>
          ) : (
            <div className="text-sm text-muted-foreground">Aucun type sélectionné</div>
          )
        )}
      </div>
      
      {/* Show error message if any */}
      {error && (
        <div className="text-sm text-red-500 mb-2">
          {error}
        </div>
      )}
      
      <ScrollArea className="h-[220px] pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {validVehicleTypes.map((vehicleType) => {
            // Ensure type is non-empty to prevent errors
            if (!vehicleType.type || vehicleType.type.trim() === '') {
              return null;
            }
            
            const isSelected = isMultiSelect 
              ? selectedTypes.includes(vehicleType.type)
              : selectedType === vehicleType.type;
              
            return (
              <Button
                key={vehicleType.id}
                type="button"
                variant="outline"
                onClick={() => isMultiSelect 
                  ? handleMultiTypeClick(vehicleType.type)
                  : handleSingleTypeClick(vehicleType.type)
                }
                className={cn(
                  "flex items-start justify-between p-3 h-auto",
                  isSelected && "border-primary ring-1 ring-primary"
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
                {isSelected && (
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
