
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  type: string;
  vehicle_type?: string;
  capacity: number;
  registration: string;
  fuel_type: string;
  mileage: number;
  last_maintenance: string;
  location?: string;
  status: string;
  ecological_score?: number;
  company_id: string;
  emissions?: number;
  updated_at: string;
  created_at: string;
  photo_url?: string;
  year?: number;
}
