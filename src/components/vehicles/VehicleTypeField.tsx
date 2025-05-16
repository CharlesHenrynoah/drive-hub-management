
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
import { Bus, Car, Loader2, MapPin } from "lucide-react";

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
  
  // Ensure we have valid vehicle types before processing
  const validVehicleTypes = vehicleTypes.filter(vt => 
    vt && typeof vt.type === 'string' && vt.type.trim() !== ''
  );
  
  // Validate the initial value when component mounts or vehicleTypes change
  useEffect(() => {
    if (validVehicleTypes.length > 0) {
      // Check if the current value is valid (exists in vehicleTypes)
      const isValidValue = value && 
                          typeof value === 'string' && 
                          value.trim() !== '' && 
                          validVehicleTypes.some(vt => vt.type === value);
      
      if (!isValidValue) {
        // If current value is invalid, select the first available type
        const firstValidType = validVehicleTypes[0].type;
        setSafeValue(firstValidType);
        onChange(firstValidType);
      } else if (value && value.trim() !== '') {
        setSafeValue(value);
      } else {
        // If value is empty but we have valid types, set to first type
        const firstValidType = validVehicleTypes[0].type;
        setSafeValue(firstValidType);
        onChange(firstValidType);
      }
    }
  }, [validVehicleTypes, value, onChange]);

  // Ensure we have a valid value
  const handleChange = (newValue: string) => {
    if (newValue && newValue.trim() !== '') {
      setSafeValue(newValue);
      onChange(newValue);
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
