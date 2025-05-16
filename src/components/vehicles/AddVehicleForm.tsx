
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleTypeSelector } from "./VehicleTypeSelector";
import { Vehicle } from "./VehiclesManagement";
import { supabase } from "@/integrations/supabase/client";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Liste des types de carburants
const fuelTypes = [
  "Diesel",
  "Essence",
  "Électrique",
  "Hybride",
  "GNV",
  "Biodiesel",
  "Hydrogène",
];

// Liste des statuts de véhicule
const vehicleStatuses = ["Disponible", "En maintenance", "Hors service", "En mission"];

// Liste des villes pour la localisation
const cities = [
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg",
  "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre",
  "Saint-Étienne", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Clermont-Ferrand"
];

interface AddVehicleFormProps {
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  vehicleToEdit?: Vehicle;
}

export function AddVehicleForm({ onSuccess, isOpen, onOpenChange, vehicleToEdit }: AddVehicleFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    type: "",
    vehicle_type: "",
    registration: "",
    capacity: 0,
    fuel_type: "Diesel",
    year: new Date().getFullYear(),
    mileage: 0,
    last_maintenance: new Date().toISOString().split("T")[0],
    status: "Disponible",
    ecological_score: 50,
    company_id: null,
    photo_url: null,
    location: ""
  });
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const { data: vehicleTypes } = useVehicleTypes();

  // Configurer le dialogue en fonction des props
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Charger les données du véhicule à éditer
  useEffect(() => {
    if (vehicleToEdit) {
      setFormData({
        brand: vehicleToEdit.brand || "",
        model: vehicleToEdit.model || "",
        type: vehicleToEdit.type || "",
        vehicle_type: vehicleToEdit.vehicle_type || "",
        registration: vehicleToEdit.registration || "",
        capacity: vehicleToEdit.capacity || 0,
        fuel_type: vehicleToEdit.fuel_type || "Diesel",
        year: vehicleToEdit.year || new Date().getFullYear(),
        mileage: vehicleToEdit.mileage || 0,
        last_maintenance: vehicleToEdit.last_maintenance
          ? new Date(vehicleToEdit.last_maintenance).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: vehicleToEdit.status || "Disponible",
        ecological_score: vehicleToEdit.ecological_score || 50,
        company_id: vehicleToEdit.company_id || null,
        photo_url: vehicleToEdit.photo_url || null,
        location: vehicleToEdit.location || ""
      });
    }
  }, [vehicleToEdit]);

  // Charger les entreprises
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const { data, error } = await supabase.from("companies").select("*");
        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    }

    fetchCompanies();
  }, []);

  const handleChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation de base
      if (!formData.brand || !formData.model || !formData.registration) {
        toast.error("Veuillez remplir tous les champs requis");
        return;
      }

      // Si nous éditons un véhicule existant
      if (vehicleToEdit) {
        const { error } = await supabase
          .from("vehicles")
          .update({
            brand: formData.brand,
            model: formData.model,
            type: formData.type,
            vehicle_type: formData.vehicle_type || null,
            registration: formData.registration,
            capacity: formData.capacity,
            fuel_type: formData.fuel_type,
            year: formData.year,
            mileage: formData.mileage,
            last_maintenance: formData.last_maintenance,
            status: formData.status,
            ecological_score: formData.ecological_score,
            company_id: formData.company_id,
            photo_url: formData.photo_url,
            location: formData.location || null
          })
          .eq("id", vehicleToEdit.id);

        if (error) throw error;
        toast.success("Véhicule modifié avec succès");
      } else {
        // Sinon, nous créons un nouveau véhicule
        const { error } = await supabase.from("vehicles").insert([
          {
            brand: formData.brand,
            model: formData.model,
            type: formData.type,
            vehicle_type: formData.vehicle_type || null,
            registration: formData.registration,
            capacity: formData.capacity,
            fuel_type: formData.fuel_type,
            year: formData.year,
            mileage: formData.mileage,
            last_maintenance: formData.last_maintenance,
            status: formData.status,
            ecological_score: formData.ecological_score,
            company_id: formData.company_id,
            photo_url: formData.photo_url,
            location: formData.location || null
          },
        ]);

        if (error) throw error;
        toast.success("Véhicule ajouté avec succès");
      }

      // Réinitialiser le formulaire et fermer le dialogue
      if (!vehicleToEdit) {
        setFormData({
          brand: "",
          model: "",
          type: "",
          vehicle_type: "",
          registration: "",
          capacity: 0,
          fuel_type: "Diesel",
          year: new Date().getFullYear(),
          mileage: 0,
          last_maintenance: new Date().toISOString().split("T")[0],
          status: "Disponible",
          ecological_score: 50,
          company_id: null,
          photo_url: null,
          location: ""
        });
      }

      setOpen(false);
      if (onOpenChange) onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving vehicle:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!vehicleToEdit && (
        <DialogTrigger asChild>
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Ajouter un véhicule
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicleToEdit ? "Modifier le véhicule" : "Ajouter un nouveau véhicule"}</DialogTitle>
          <DialogDescription>
            {vehicleToEdit
              ? "Modifiez les informations du véhicule ci-dessous."
              : "Entrez les informations du nouveau véhicule."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Informations de base */}
            <div className="space-y-2">
              <Label htmlFor="brand">Marque *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modèle *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange("model", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration">Immatriculation *</Label>
              <Input
                id="registration"
                value={formData.registration}
                onChange={(e) => handleChange("registration", e.target.value)}
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
                value={formData.year}
                onChange={(e) => handleChange("year", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de véhicule *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Berline">Berline</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Mini Bus">Mini Bus</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type de véhicule standardisé */}
            <VehicleTypeSelector
              value={formData.vehicle_type}
              onChange={(value) => handleChange("vehicle_type", value)}
              vehicleTypes={vehicleTypes || []}
            />

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité (passagers)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_type">Type de carburant</Label>
              <Select
                value={formData.fuel_type}
                onValueChange={(value) => handleChange("fuel_type", value)}
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
                value={formData.mileage}
                onChange={(e) => handleChange("mileage", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_maintenance">Dernière maintenance</Label>
              <Input
                id="last_maintenance"
                type="date"
                value={formData.last_maintenance}
                onChange={(e) => handleChange("last_maintenance", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
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
              <Label htmlFor="ecological_score">Score écologique (0-100)</Label>
              <Input
                id="ecological_score"
                type="number"
                min="0"
                max="100"
                value={formData.ecological_score}
                onChange={(e) =>
                  handleChange("ecological_score", parseInt(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_id">Entreprise</Label>
              <Select
                value={formData.company_id || ""}
                onValueChange={(value) =>
                  handleChange("company_id", value === "" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une entreprise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune entreprise</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo_url">URL de photo</Label>
              <Input
                id="photo_url"
                value={formData.photo_url || ""}
                onChange={(e) =>
                  handleChange("photo_url", e.target.value || null)
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Select
                value={formData.location || ""}
                onValueChange={(value) =>
                  handleChange("location", value === "" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une localisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Non définie</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className={cn(loading ? "opacity-70 pointer-events-none" : "")}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {vehicleToEdit ? "Mettre à jour" : "Ajouter le véhicule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
