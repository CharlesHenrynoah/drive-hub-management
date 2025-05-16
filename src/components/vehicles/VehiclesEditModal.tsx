
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Vehicle } from "./VehiclesManagement";
import { VehicleTypeSelector } from "./VehicleTypeSelector";

interface VehiclesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSuccess: () => void;
}

export function VehiclesEditModal({ isOpen, onClose, vehicle, onSuccess }: VehiclesEditModalProps) {
  const [brand, setBrand] = useState(vehicle.brand);
  const [model, setModel] = useState(vehicle.model);
  const [type, setType] = useState(vehicle.type);
  const [capacity, setCapacity] = useState<string>(vehicle.capacity.toString());
  const [registration, setRegistration] = useState(vehicle.registration);
  const [fuelType, setFuelType] = useState(vehicle.fuel_type);
  const [mileage, setMileage] = useState<string>(vehicle.mileage.toString());
  const [lastMaintenance, setLastMaintenance] = useState(vehicle.last_maintenance);
  const [location, setLocation] = useState(vehicle.location);
  const [status, setStatus] = useState(vehicle.status);
  const [companyId, setCompanyId] = useState(vehicle.company_id);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState(vehicle.vehicle_type || "");

  useEffect(() => {
    fetchCompanies();
    
    // Update form fields when vehicle changes
    setBrand(vehicle.brand);
    setModel(vehicle.model);
    setType(vehicle.type);
    setCapacity(vehicle.capacity.toString());
    setRegistration(vehicle.registration);
    setFuelType(vehicle.fuel_type);
    setMileage(vehicle.mileage.toString());
    setLastMaintenance(vehicle.last_maintenance);
    setLocation(vehicle.location);
    setStatus(vehicle.status);
    setCompanyId(vehicle.company_id);
    setVehicleType(vehicle.vehicle_type || "");
  }, [vehicle]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');
      
      if (error) {
        console.error("Erreur lors de la récupération des entreprises:", error);
        toast({
          title: "Erreur!",
          description: "Erreur lors de la récupération des entreprises",
        });
      } else {
        setCompanies(data || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des entreprises:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate ecological score based on fuel type and mileage
      let ecologicalScore = 0;
      
      switch (fuelType.toLowerCase()) {
        case "électrique":
          ecologicalScore = 10;
          break;
        case "hybride":
          ecologicalScore = 7;
          break;
        case "essence":
          ecologicalScore = 4;
          break;
        case "diesel":
          ecologicalScore = 2;
          break;
        default:
          ecologicalScore = 5;
      }
      
      // Adjust based on mileage
      const mileageNum = parseInt(mileage);
      if (mileageNum > 100000) {
        ecologicalScore -= 2;
      } else if (mileageNum < 50000) {
        ecologicalScore += 1;
      }
      
      // Ensure the score is between 1-10
      ecologicalScore = Math.max(1, Math.min(10, ecologicalScore));

      const { data, error } = await supabase
        .from('vehicles')
        .update({
          brand,
          model,
          type,
          vehicle_type: vehicleType,
          capacity: parseInt(capacity),
          registration,
          fuel_type: fuelType,
          mileage: parseInt(mileage),
          last_maintenance: lastMaintenance,
          location,
          status,
          ecological_score: ecologicalScore,
          company_id: companyId
        })
        .eq('id', vehicle.id);

      if (error) {
        console.error("Erreur lors de la mise à jour du véhicule:", error);
        toast({
          title: "Erreur!",
          description: "Erreur lors de la mise à jour du véhicule",
        });
      } else {
        toast({
          title: "Succès!",
          description: "Véhicule mis à jour avec succès",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du véhicule:", error);
      toast({
        title: "Erreur!",
        description: "Erreur lors de la mise à jour du véhicule",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le véhicule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marque</Label>
              <Input 
                id="brand" 
                placeholder="Marque" 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              <Input 
                id="model" 
                placeholder="Modèle" 
                value={model} 
                onChange={(e) => setModel(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input 
                id="type" 
                placeholder="Type (e.g. SUV, Berline)" 
                value={type} 
                onChange={(e) => setType(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicle-type">Type de véhicule</Label>
              <VehicleTypeSelector 
                value={vehicleType}
                onChange={setVehicleType}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité (personnes)</Label>
              <Input 
                id="capacity" 
                type="number" 
                placeholder="Capacité" 
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registration">Immatriculation</Label>
              <Input 
                id="registration" 
                placeholder="Immatriculation" 
                value={registration} 
                onChange={(e) => setRegistration(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel-type">Type de carburant</Label>
              <Select onValueChange={setFuelType} defaultValue={fuelType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de carburant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Essence">Essence</SelectItem>
                  <SelectItem value="Électrique">Électrique</SelectItem>
                  <SelectItem value="Hybride">Hybride</SelectItem>
                  <SelectItem value="GPL">GPL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mileage">Kilométrage</Label>
              <Input 
                id="mileage" 
                type="number" 
                placeholder="Kilométrage" 
                value={mileage} 
                onChange={(e) => setMileage(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last-maintenance">Dernière maintenance</Label>
              <Input 
                id="last-maintenance" 
                type="date" 
                value={lastMaintenance} 
                onChange={(e) => setLastMaintenance(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input 
                id="location" 
                placeholder="Localisation" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select onValueChange={setStatus} defaultValue={status}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut du véhicule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en_mission">En mission</SelectItem>
                  <SelectItem value="maintenance">En maintenance</SelectItem>
                  <SelectItem value="hors_service">Hors service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Select onValueChange={setCompanyId} defaultValue={companyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une entreprise" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Mise à jour en cours..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
