
export interface Mission {
  id: string;
  title: string;
  date: Date;
  arrival_date?: Date;
  start_location?: string;
  end_location?: string;
  status: "en_cours" | "terminee" | "annulee";
  description?: string;
  driver_id?: string;
  vehicle_id?: string;
  client?: string;
  client_email?: string;
  client_phone?: string;
  passengers?: number;
  additional_details?: string;
  company_id?: string;
  driver?: string;
  vehicle?: string;
  company?: string;
  drivers?: {
    nom: string;
    prenom: string;
  };
  vehicles?: {
    brand: string;
    model: string;
  };
  companies?: {
    name: string;
  };
  created_at: string;
  updated_at: string;
}
