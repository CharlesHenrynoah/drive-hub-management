

export interface VehicleType {
  id: number;
  type: string;
  description: string;
  capacity_min: number;
  capacity_max: number;
  image_url: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration: string;
  type: string;
  capacity: number;
  fuel_type: string;
  ecological_score: number;
  emissions: number;
  mileage: number;
  year: number;
  last_maintenance: string;
  vehicle_type?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  status?: string;
  company_id: string;
  location?: string;
  Note_Moyenne_Client?: number;
}

