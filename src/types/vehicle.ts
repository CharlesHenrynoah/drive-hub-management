
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  type: string;
  vehicle_type?: string;
  capacity: number;
  registration: string;
  fuel_type: string;
  year: number;
  emissions: number;
  mileage: number;
  ecological_score: number;
  last_maintenance: string;
  status?: string;
  location?: string;
  photo_url?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
  Note_Moyenne_Client?: number;
}
