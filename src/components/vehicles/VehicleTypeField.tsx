
import { useState, useEffect } from "react";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bus, Car, Loader2 } from "lucide-react";

interface VehicleTypeFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Fonction pour obtenir l'emoji correspondant au type de véhicule
function getVehicleEmoji(type: string): React.ReactNode {
  switch (type) {
    case "Minibus":
      return "🚐";
    case "Minicar":
      return "🚌";
    case "Autocar Standard":
      return "🚌";
    case "Autocar Grand Tourisme":
      return "🚌";
    case "VTC":
    case "Berline":
      return "🚗";
    case "Van":
      return "🚐";
    default:
      return "🚙";
  }
}

export function VehicleTypeField({ value, onChange, disabled = false }: VehicleTypeFieldProps) {
  const { data: vehicleTypes = [], isLoading } = useVehicleTypes();
  const [safeValue, setSafeValue] = useState<string>("");
  
  // Ensure all vehicle types are valid (no empty strings)
  const validVehicleTypes = vehicleTypes.filter(vt => 
    vt && typeof vt.type === 'string' && vt.type.trim() !== ''
  );
  
  // Initialize with valid vehicle type on mount
  useEffect(() => {
    // Only proceed if we have valid vehicle types
    if (validVehicleTypes.length > 0) {
      // Check if current value is valid
      const isValidCurrentValue = value && 
                          typeof value === 'string' && 
                          value.trim() !== '' && 
                          validVehicleTypes.some(vt => vt.type === value);
      
      if (!isValidCurrentValue) {
        // Select first valid type if current value is not valid
        const firstType = validVehicleTypes[0].type;
        setSafeValue(firstType);
        onChange(firstType); // Inform parent component
      } else {
        // Current value is valid, use it
        setSafeValue(value);
      }
    }
  }, [validVehicleTypes, value, onChange]);

  // Handle selection change safely
  const handleChange = (newValue: string) => {
    // Extra validation to ensure we never set an empty value
    if (newValue && newValue.trim() !== '') {
      setSafeValue(newValue);
      onChange(newValue);
    } else {
      // If somehow we got an empty value, fallback to first valid type
      if (validVehicleTypes.length > 0) {
        const fallbackType = validVehicleTypes[0].type;
        setSafeValue(fallbackType);
        onChange(fallbackType);
      }
    }
  };

  return (
    <FormItem>
      <Select
        value={safeValue}
        onValueChange={handleChange}
        disabled={disabled || isLoading || validVehicleTypes.length === 0}
      >
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un type de véhicule" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            validVehicleTypes.map((vehicleType) => (
              <SelectItem 
                key={vehicleType.id} 
                value={vehicleType.type}
                className="py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getVehicleEmoji(vehicleType.type)}</span>
                  <div className="flex flex-col">
                    <span>{vehicleType.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {vehicleType.capacity_min} - {vehicleType.capacity_max} places
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {safeValue && !isLoading && (
        <div className="mt-2">
          {validVehicleTypes.find(vt => vt.type === safeValue) && (
            <Badge variant="outline" className="bg-secondary flex items-center gap-1">
              {getVehicleEmoji(safeValue)}
              {validVehicleTypes.find(vt => vt.type === safeValue)?.capacity_min} - 
              {validVehicleTypes.find(vt => vt.type === safeValue)?.capacity_max} passagers
            </Badge>
          )}
        </div>
      )}
      <FormMessage />
    </FormItem>
  );
}
