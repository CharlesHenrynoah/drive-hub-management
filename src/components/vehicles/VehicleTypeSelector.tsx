
import { useState } from "react";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { vehicleTypes } from "./constants/vehicleFormConstants";

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
  const { data: vehicleTypesFromDB = [], isLoading } = useVehicleTypes();
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

  if (isLoading) {
    return <div>Chargement des types de véhicules...</div>;
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
          {vehicleTypes.map((vehicleType, index) => {
            const isSelected = isMultiSelect 
              ? selectedTypes.includes(vehicleType.value)
              : selectedType === vehicleType.value;
              
            return (
              <Button
                key={index}
                type="button"
                variant="outline"
                onClick={() => isMultiSelect 
                  ? handleMultiTypeClick(vehicleType.value)
                  : handleSingleTypeClick(vehicleType.value)
                }
                className={cn(
                  "flex items-start justify-between p-3 h-auto",
                  isSelected && "border-primary ring-1 ring-primary"
                )}
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">{vehicleType.label}</span>
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
