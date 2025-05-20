
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration: string;
  type: string;
  vehicle_type?: string;
  capacity: number;
  fuel_type: string;
  year?: number;
  emissions?: number;
  ecological_score?: number;
  mileage?: number;
  last_maintenance?: string;
  status?: string;
  photo_url?: string;
  company_id?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  Note_Moyenne_Client?: number;
}
