
import { useState } from "react";
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
import { VehicleTypeSelector } from "./VehicleTypeSelector";

interface VehiclesAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VehiclesAddModal({ isOpen, onClose, onSuccess }: VehiclesAddModalProps) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState<string>(""); 
  const [registration, setRegistration] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [mileage, setMileage] = useState<string>(""); 
  const [lastMaintenance, setLastMaintenance] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("disponible");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState("");

  useState(() => {
    fetchCompanies();
  });

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
        .insert([
          {
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
            company_id: companyId,
            Note_Moyenne_Client: 0 // Default value
          }
        ]);

      if (error) {
        console.error("Erreur lors de l'ajout du véhicule:", error);
        toast({
          title: "Erreur!",
          description: "Erreur lors de l'ajout du véhicule",
        });
      } else {
        toast({
          title: "Succès!",
          description: "Véhicule ajouté avec succès",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du véhicule:", error);
      toast({
        title: "Erreur!",
        description: "Erreur lors de l'ajout du véhicule",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un véhicule</DialogTitle>
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
              <Select onValueChange={setFuelType} required>
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
              <Select onValueChange={setStatus} defaultValue="disponible">
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
              <Select onValueChange={setCompanyId} required>
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
              {isLoading ? "Ajout en cours..." : "Ajouter le véhicule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
