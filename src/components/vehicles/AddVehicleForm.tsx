
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
import { VehicleTypeField } from "./VehicleTypeField";
import { Vehicle } from "./VehiclesManagement";
import { supabase } from "@/integrations/supabase/client";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { toast } from "sonner";
import { Bus, Car, Gauge, Image, Loader2, MapPin, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateEcologicalScore } from "@/utils/ecologicalScoreCalculator";
import { Progress } from "@/components/ui/progress";

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
  const [calculatingScore, setCalculatingScore] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    type: "",
    registration: "",
    capacity: 0,
    fuel_type: "Diesel",
    year: new Date().getFullYear(),
    mileage: 0,
    last_maintenance: new Date().toISOString().split("T")[0],
    status: "Disponible",
    ecological_score: 50,
    company_id: null as string | null,
    photo_url: null as string | null,
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
      
      if (vehicleToEdit.photo_url && !vehicleToEdit.photo_url.startsWith('blob:')) {
        setPhotoPreview(vehicleToEdit.photo_url);
      }
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

  // Recalculer le score écologique quand les informations pertinentes changent
  useEffect(() => {
    // Ne pas calculer si certaines valeurs essentielles sont manquantes
    if (!formData.type || !formData.fuel_type || !formData.capacity) {
      return;
    }
    
    const calculateScore = async () => {
      setCalculatingScore(true);
      try {
        const score = await calculateEcologicalScore({
          type: formData.type,
          fuel: formData.fuel_type,
          capacity: formData.capacity,
          year: formData.year
        });
        
        setFormData(prev => ({
          ...prev,
          ecological_score: score
        }));
      } catch (error) {
        console.error("Error calculating ecological score:", error);
      } finally {
        setCalculatingScore(false);
      }
    };
    
    // Utiliser un délai pour ne pas surcharger l'API
    const timer = setTimeout(() => {
      calculateScore();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData.type, formData.fuel_type, formData.capacity, formData.year]);

  const handleChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Gérer le changement de type de véhicule et mettre à jour automatiquement la capacité
  const handleVehicleTypeChange = (value: string) => {
    const selectedType = vehicleTypes?.find(vt => vt.type === value);
    
    setFormData(prev => ({
      ...prev,
      type: value,
      capacity: selectedType ? Math.floor((selectedType.capacity_min + selectedType.capacity_max) / 2) : prev.capacity
    }));
  };

  // Gérer le téléchargement de photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    
    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image doit être inférieure à 5MB");
      return;
    }
    
    setUploadingPhoto(true);
    setPhotoFile(file);
    
    try {
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
      
      toast.success("Photo prête à être téléchargée");
    } catch (error) {
      console.error("Error preparing photo:", error);
      toast.error("Erreur lors de la préparation de la photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const uploadPhotoToStorage = async (file: File): Promise<string | null> => {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `vehicle_photos/${fileName}`;
      
      // Télécharger vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('vehicles')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Construire l'URL publique
      const { data: publicUrl } = supabase.storage
        .from('vehicles')
        .getPublicUrl(filePath);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Error uploading to storage:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation de base
      if (!formData.brand || !formData.model || !formData.registration) {
        toast.error("Veuillez remplir tous les champs requis");
        setLoading(false);
        return;
      }
      
      // Gestion de la photo
      let finalPhotoUrl = formData.photo_url;
      if (photoFile) {
        const uploadedUrl = await uploadPhotoToStorage(photoFile);
        if (uploadedUrl) {
          finalPhotoUrl = uploadedUrl;
        }
      }

      // Si nous éditons un véhicule existant
      if (vehicleToEdit) {
        const { error } = await supabase
          .from("vehicles")
          .update({
            brand: formData.brand,
            model: formData.model,
            type: formData.type,
            registration: formData.registration,
            capacity: formData.capacity || 0,
            fuel_type: formData.fuel_type,
            year: formData.year,
            mileage: formData.mileage,
            last_maintenance: formData.last_maintenance,
            status: formData.status,
            ecological_score: formData.ecological_score,
            company_id: formData.company_id,
            photo_url: finalPhotoUrl,
            location: formData.location || null
          })
          .eq("id", vehicleToEdit.id);

        if (error) throw error;
        toast.success("Véhicule modifié avec succès");
      } else {
        // Sinon, nous créons un nouveau véhicule
        const { error } = await supabase.from("vehicles").insert({
            brand: formData.brand,
            model: formData.model,
            type: formData.type,
            registration: formData.registration,
            capacity: formData.capacity || 0,
            fuel_type: formData.fuel_type,
            year: formData.year,
            mileage: formData.mileage,
            last_maintenance: formData.last_maintenance,
            status: formData.status,
            ecological_score: formData.ecological_score,
            company_id: formData.company_id === "none" ? null : formData.company_id,
            photo_url: finalPhotoUrl,
            location: formData.location === "aucune" ? null : formData.location
        });

        if (error) throw error;
        toast.success("Véhicule ajouté avec succès");
      }

      // Réinitialiser le formulaire et fermer le dialogue
      if (!vehicleToEdit) {
        setFormData({
          brand: "",
          model: "",
          type: "",
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
        setPhotoPreview(null);
        setPhotoFile(null);
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

  // Correction de l'ouverture du modal en utilisant une approche simplifiée
  const openModal = () => {
    setOpen(true);
  };
  
  // Déterminer la couleur de la barre de progression en fonction du score écologique
  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500"; // Très écologique
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-yellow-400";
    if (score >= 20) return "bg-orange-400";
    return "bg-red-500"; // Peu écologique
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!vehicleToEdit && (
        <DialogTrigger asChild>
          <Button 
            className="flex items-center gap-1"
            onClick={openModal}
          >
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
          {/* Section photo du véhicule */}
          <div className="flex flex-col items-center space-y-4 mb-4">
            <div className="w-40 h-40 rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center relative">
              {photoPreview ? (
                <>
                  <img 
                    src={photoPreview} 
                    alt="Aperçu du véhicule" 
                    className="object-cover w-full h-full rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2 opacity-70 hover:opacity-100 bg-white"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFile(null);
                      setFormData(prev => ({ ...prev, photo_url: null }));
                    }}
                  >
                    Supprimer
                  </Button>
                </>
              ) : (
                <>
                  <Image className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground mt-2">Photo du véhicule</p>
                </>
              )}
            </div>
            <div>
              <Label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {photoPreview ? "Changer la photo" : "Télécharger une photo"}
                  </>
                )}
              </Label>
              <Input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type de véhicule */}
            <div className="space-y-2">
              <Label htmlFor="type">Type de véhicule *</Label>
              <VehicleTypeField 
                value={formData.type}
                onChange={handleVehicleTypeChange}
              />
            </div>
            
            {/* Capacité */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité (passagers)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity || ""}
                onChange={(e) => handleChange("capacity", parseInt(e.target.value) || 0)}
              />
            </div>

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
                value={formData.year || ""}
                onChange={(e) => handleChange("year", parseInt(e.target.value) || new Date().getFullYear())}
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
                value={formData.mileage || ""}
                onChange={(e) => handleChange("mileage", parseInt(e.target.value) || 0)}
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

            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="ecological_score" className="flex items-center gap-1">
                Score écologique (0-100)
                {calculatingScore && <Loader2 className="h-3 w-3 animate-spin" />}
              </Label>
              
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-lg">{formData.ecological_score}</span>
              </div>
              
              <div className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ease-in-out ${getProgressColor(formData.ecological_score)}`}
                  style={{ width: `${formData.ecological_score}%` }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Le score écologique est calculé automatiquement en fonction du type de véhicule, 
                du carburant, de la capacité et de l'année du véhicule
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_id">Entreprise</Label>
              <Select
                value={formData.company_id || "none"}
                onValueChange={(value) =>
                  handleChange("company_id", value === "none" ? null : value)
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
                value={formData.location || "aucune"}
                onValueChange={(value) =>
                  handleChange("location", value === "aucune" ? null : value)
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
