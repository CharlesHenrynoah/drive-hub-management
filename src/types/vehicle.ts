
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  type: string;
  vehicle_type: string;
  capacity: number;
  registration: string;
  fuel_type: string;
  status: string;
  photo_url?: string;
  mileage?: number;
  emissions?: number;
  ecological_score?: number;
  last_maintenance?: string;
  location?: string;
  company_id?: string;
  year?: number;
  created_at: string;
  updated_at?: string;
  Note_Moyenne_Client?: number;
}
