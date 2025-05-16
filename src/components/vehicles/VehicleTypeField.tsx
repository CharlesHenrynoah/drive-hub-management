
import { useState } from "react";
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
  
  // Ensure we have a valid value
  const handleChange = (newValue: string) => {
    if (newValue && newValue.trim() !== '') {
      onChange(newValue);
    }
  };

  return (
    <FormItem>
      <Select
        value={value || undefined}
        onValueChange={handleChange}
        disabled={disabled || isLoading}
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
            vehicleTypes
              .filter(vehicleType => {
                // Ensure we only include vehicle types with valid values
                const typeValue = vehicleType.type || `Type ${vehicleType.id}`;
                return typeValue && typeValue.trim() !== '';
              })
              .map((vehicleType) => {
                // Create a guaranteed non-empty value
                const itemValue = vehicleType.type || `Type ${vehicleType.id}`;
                
                return (
                  <SelectItem 
                    key={vehicleType.id} 
                    value={itemValue}
                    className="py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getVehicleEmoji(vehicleType.type)}</span>
                      <div className="flex flex-col">
                        <span>{itemValue}</span>
                        <span className="text-xs text-muted-foreground">
                          {vehicleType.capacity_min} - {vehicleType.capacity_max} places
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })
          )}
        </SelectContent>
      </Select>
      
      {value && !isLoading && (
        <div className="mt-2">
          {vehicleTypes.find(vt => (vt.type || `Type ${vt.id}`) === value) && (
            <Badge variant="outline" className="bg-secondary flex items-center gap-1">
              {getVehicleEmoji(value)}
              {vehicleTypes.find(vt => (vt.type || `Type ${vt.id}`) === value)?.capacity_min} - 
              {vehicleTypes.find(vt => (vt.type || `Type ${vt.id}`) === value)?.capacity_max} passagers
            </Badge>
          )}
        </div>
      )}
      <FormMessage />
    </FormItem>
  );
}
