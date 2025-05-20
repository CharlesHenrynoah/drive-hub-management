
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { fuelTypes, vehicleStatuses, cities } from "../constants/vehicleFormConstants";

interface TechnicalDetailsProps {
  fuel_type: string;
  mileage: number;
  last_maintenance: string;
  status: string;
  location: string;
  company_id: string | null;
  companies: { id: string; name: string }[];
  onFieldChange: (field: string, value: string | number | null) => void;
}

export function TechnicalDetails({
  fuel_type,
  mileage,
  last_maintenance,
  status,
  location,
  company_id,
  companies,
  onFieldChange
}: TechnicalDetailsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fuel_type">Type de carburant</Label>
        <Select
          value={fuel_type}
          onValueChange={(value) => onFieldChange("fuel_type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un carburant" />
          </SelectTrigger>
          <SelectContent>
            {fuelTypes.map((fuel) => (
              <SelectItem key={fuel} value={fuel}>
                {fuel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mileage">Kilométrage</Label>
        <Input
          id="mileage"
          type="number"
          min="0"
          value={mileage || ""}
          onChange={(e) => onFieldChange("mileage", parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_maintenance">Dernière maintenance</Label>
        <Input
          id="last_maintenance"
          type="date"
          value={last_maintenance}
          onChange={(e) => onFieldChange("last_maintenance", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Statut</Label>
        <Select
          value={status}
          onValueChange={(value) => onFieldChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            {vehicleStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_id">Entreprise</Label>
        <Select
          value={company_id || "none"}
          onValueChange={(value) =>
            onFieldChange("company_id", value === "none" ? null : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une entreprise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune entreprise</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Localisation</Label>
        <Select
          value={location || "aucune"}
          onValueChange={(value) =>
            onFieldChange("location", value === "aucune" ? null : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une localisation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aucune">Non définie</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {city}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
