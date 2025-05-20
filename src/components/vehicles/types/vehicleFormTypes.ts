
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
