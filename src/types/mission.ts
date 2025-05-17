
export interface Mission {
  id: string;
  title: string;
  date: string | Date;
  arrival_date?: string | Date;
  driver_id?: string;
  vehicle_id?: string;
  company_id?: string;
  passengers?: number;
  status: "en_cours" | "terminee" | "annulee";
  start_location?: string;
  end_location?: string;
  client?: string;
  client_email?: string;
  client_phone?: string;
  description?: string;
  additional_details?: string;
  created_at?: string;
  updated_at?: string;
  driver?: string; // Formatted name from join
  vehicle?: string; // Formatted info from join
  company?: string; // Company name from join
}
