
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
    <div className="flex flex-col gap-4">
      {/* Titre et sélections */}
      <div>
        <h3 className="text-base font-medium mb-2">Types de véhicules {maxSelections > 1 && <span className="text-sm font-normal text-muted-foreground">(max {maxSelections})</span>}</h3>
        
        {/* Types sélectionnés */}
        <div className="flex flex-wrap gap-2 mb-1">
          {isMultiSelect ? (
            selectedTypes && selectedTypes.length > 0 ? (
              selectedTypes.map(type => (
                <Badge 
                  key={type} 
                  variant="outline" 
                  className="bg-green-50 text-green-700 border-green-200 px-2.5 py-0.5 rounded-full font-medium hover:bg-green-100 transition-colors"
                >
                  {type}
                </Badge>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic">Aucun type sélectionné</div>
            )
          ) : (
            selectedType ? (
              <Badge 
                key={selectedType} 
                variant="outline" 
                className="bg-green-50 text-green-700 border-green-200 px-2.5 py-0.5 rounded-full font-medium hover:bg-green-100 transition-colors"
              >
                {selectedType}
              </Badge>
            ) : (
              <div className="text-sm text-gray-500 italic">Aucun type sélectionné</div>
            )
          )}
        </div>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 px-3 py-2 border border-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {/* Liste des types de véhicules disponibles */}
      <ScrollArea className="h-[300px] pr-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vehicleTypes.map((vehicleType, index) => {
            const isSelected = isMultiSelect 
              ? selectedTypes && selectedTypes.includes(vehicleType.value)
              : selectedType === vehicleType.value;
              
            return (
              <button
                key={index}
                type="button"
                onClick={() => isMultiSelect 
                  ? handleMultiTypeClick(vehicleType.value)
                  : handleSingleTypeClick(vehicleType.value)
                }
                className={cn(
                  "relative flex items-center border rounded-lg p-4 h-auto transition-all",
                  "hover:border-blue-300 hover:bg-blue-50/50",
                  isSelected 
                    ? "border-green-400 bg-green-50 shadow-sm" 
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex flex-1 items-start text-left">
                  <span className={cn(
                    "font-medium",
                    isSelected ? "text-green-700" : "text-gray-700"
                  )}>
                    {vehicleType.label}
                  </span>
                </div>
                
                {isSelected && (
                  <div className="absolute right-2 top-2 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckIcon className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
