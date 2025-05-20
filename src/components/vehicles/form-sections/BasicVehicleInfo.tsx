
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleTypeField } from "../VehicleTypeField";

interface BasicVehicleInfoProps {
  brand: string;
  model: string;
  registration: string;
  type: string;
  capacity: number;
  year: number;
  onTypeChange: (value: string) => void;
  onFieldChange: (field: string, value: string | number | null) => void;
}

export function BasicVehicleInfo({
  brand,
  model,
  registration,
  type,
  capacity,
  year,
  onTypeChange,
  onFieldChange
}: BasicVehicleInfoProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="type">Type de véhicule *</Label>
        <VehicleTypeField 
          value={type}
          onChange={onTypeChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacité (passagers)</Label>
        <Input
          id="capacity"
          type="number"
          min="1"
          value={capacity || ""}
          onChange={(e) => onFieldChange("capacity", parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand">Marque *</Label>
        <Input
          id="brand"
          value={brand}
          onChange={(e) => onFieldChange("brand", e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="model">Modèle *</Label>
        <Input
          id="model"
          value={model}
          onChange={(e) => onFieldChange("model", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="registration">Immatriculation *</Label>
        <Input
          id="registration"
          value={registration}
          onChange={(e) => onFieldChange("registration", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Année</Label>
        <Input
          id="year"
          type="number"
          min="1900"
          max={new Date().getFullYear() + 1}
          value={year || ""}
          onChange={(e) => onFieldChange("year", parseInt(e.target.value) || new Date().getFullYear())}
        />
      </div>
    </>
  );
}
