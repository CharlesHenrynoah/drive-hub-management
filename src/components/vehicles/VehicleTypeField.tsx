
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
import { Loader2 } from "lucide-react";

interface VehicleTypeFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function VehicleTypeField({ value, onChange, disabled = false }: VehicleTypeFieldProps) {
  const { data: vehicleTypes = [], isLoading } = useVehicleTypes();

  return (
    <FormItem>
      <FormLabel>Type de véhicule</FormLabel>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type de véhicule" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            vehicleTypes.map((vehicleType) => (
              <SelectItem key={vehicleType.id} value={vehicleType.type}>
                <div className="flex flex-col">
                  <span>
                    {vehicleType.type === "Minibus" && "🚐 "}
                    {vehicleType.type === "Minicar" && "🚌 "}
                    {vehicleType.type === "Autocar Standard" && "🚌 "}
                    {vehicleType.type === "Autocar Grand Tourisme" && "🚌 "}
                    {vehicleType.type === "Berline" && "🚗 "}
                    {vehicleType.type === "Van" && "🚐 "}
                    {vehicleType.type}
                  </span>
                  <span className="text-xs text-muted-foreground">{vehicleType.description}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {value && !isLoading && (
        <div className="mt-2">
          {vehicleTypes.find(vt => vt.type === value) && (
            <Badge variant="outline" className="bg-secondary">
              {vehicleTypes.find(vt => vt.type === value)?.capacity_min} - 
              {vehicleTypes.find(vt => vt.type === value)?.capacity_max} passagers
            </Badge>
          )}
        </div>
      )}
      <FormMessage />
    </FormItem>
  );
}
