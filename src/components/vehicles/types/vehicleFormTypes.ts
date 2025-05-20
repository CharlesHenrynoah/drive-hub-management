
import { Vehicle } from "@/types/vehicle";

export interface VehicleFormData {
  brand: string;
  model: string;
  type: string;
  registration: string;
  capacity: number;
  fuel_type: string;
  year: number;
  mileage: number;
  last_maintenance: string;
  status: string;
  ecological_score: number;
  company_id: string | null;
  photo_url: string | null;
  location: string;
}

export interface AddVehicleFormProps {
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  vehicleToEdit?: Vehicle;
}

// Définition simplifiée de Driver pour les composants de flotte
export interface FleetDriver {
  id: string;
  id_chauffeur: string;
  nom: string;
  prenom: string;
  ville?: string;
  email?: string;
  telephone?: string;
  piece_identite?: string;
}
