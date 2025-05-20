
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
import { Loader2, Plus } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { supabase } from "@/integrations/supabase/client";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { calculateEcologicalScore } from "@/utils/ecologicalScoreCalculator";
import { VehiclePhotoUpload } from "./form-sections/VehiclePhotoUpload";
import { BasicVehicleInfo } from "./form-sections/BasicVehicleInfo";
import { TechnicalDetails } from "./form-sections/TechnicalDetails";
import { EcologicalScoreDisplay } from "./form-sections/EcologicalScoreDisplay";
import { useVehiclePhotoUpload } from "./hooks/useVehiclePhotoUpload";
import { VehicleFormData, AddVehicleFormProps } from "./types/vehicleFormTypes";
import { getDefaultCapacityByType } from "./constants/vehicleFormConstants";

export function AddVehicleForm({ onSuccess, isOpen, onOpenChange, vehicleToEdit }: AddVehicleFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculatingScore, setCalculatingScore] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const { data: vehicleTypes } = useVehicleTypes();
  
  const {
    photoPreview,
    uploadingPhoto,
    photoFile,
    handlePhotoUpload,
    removePhoto,
    uploadPhotoToStorage,
    setPhotoPreview
  } = useVehiclePhotoUpload();

  const [formData, setFormData] = useState<VehicleFormData>({
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
  }, [vehicleToEdit, setPhotoPreview]);

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
    setFormData(prev => ({
      ...prev,
      type: value,
      capacity: getDefaultCapacityByType(value)
    }));
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

      // Si nous édits un véhicule existant
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
        removePhoto();
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

  // Ouverture explicite du modal
  const openModal = () => {
    setOpen(true);
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
          <VehiclePhotoUpload
            photoPreview={photoPreview}
            uploadingPhoto={uploadingPhoto}
            onPhotoUpload={handlePhotoUpload}
            onPhotoRemove={removePhoto}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Informations de base */}
            <BasicVehicleInfo
              brand={formData.brand}
              model={formData.model}
              registration={formData.registration}
              type={formData.type}
              capacity={formData.capacity}
              year={formData.year}
              onTypeChange={handleVehicleTypeChange}
              onFieldChange={handleChange}
            />

            {/* Détails techniques */}
            <TechnicalDetails
              fuel_type={formData.fuel_type}
              mileage={formData.mileage}
              last_maintenance={formData.last_maintenance}
              status={formData.status}
              location={formData.location}
              company_id={formData.company_id}
              companies={companies}
              onFieldChange={handleChange}
            />

            {/* Score écologique */}
            <EcologicalScoreDisplay
              score={formData.ecological_score}
              calculatingScore={calculatingScore}
            />
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
