export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          last_used_at: string | null
          name: string
          revoked: boolean
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          last_used_at?: string | null
          name: string
          revoked?: boolean
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          last_used_at?: string | null
          name?: string
          revoked?: boolean
        }
        Relationships: []
      }
      api_requests: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          response_time_ms: number | null
          status_code: number
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          response_time_ms?: number | null
          status_code: number
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          response_time_ms?: number | null
          status_code?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      driver_vehicle_types: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "driver_vehicle_types_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          certificat_medical: string
          created_at: string
          date_debut_activite: string
          disponible: boolean
          email: string
          id: string
          id_chauffeur: string
          id_entreprise: string
          justificatif_domicile: string
          nom: string
          note_chauffeur: number
          photo: string | null
          piece_identite: string
          prenom: string
          telephone: string
        }
        Insert: {
          certificat_medical: string
          created_at?: string
          date_debut_activite: string
          disponible?: boolean
          email: string
          id?: string
          id_chauffeur: string
          id_entreprise: string
          justificatif_domicile: string
          nom: string
          note_chauffeur?: number
          photo?: string | null
          piece_identite: string
          prenom: string
          telephone: string
        }
        Update: {
          certificat_medical?: string
          created_at?: string
          date_debut_activite?: string
          disponible?: boolean
          email?: string
          id?: string
          id_chauffeur?: string
          id_entreprise?: string
          justificatif_domicile?: string
          nom?: string
          note_chauffeur?: number
          photo?: string | null
          piece_identite?: string
          prenom?: string
          telephone?: string
        }
        Relationships: []
      }
      fleet_drivers: {
        Row: {
          created_at: string
          driver_id: string
          fleet_id: string
          id: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          fleet_id: string
          id?: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          fleet_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleet_drivers_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_vehicles: {
        Row: {
          created_at: string
          fleet_id: string
          id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          fleet_id: string
          id?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          fleet_id?: string
          id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_vehicles_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleet_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleets: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          additional_details: string | null
          arrival_date: string | null
          client: string | null
          client_email: string | null
          client_phone: string | null
          company_id: string | null
          created_at: string
          date: string
          description: string | null
          driver_id: string | null
          end_location: string | null
          id: string
          passengers: number | null
          start_location: string | null
          status: string
          title: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          additional_details?: string | null
          arrival_date?: string | null
          client?: string | null
          client_email?: string | null
          client_phone?: string | null
          company_id?: string | null
          created_at?: string
          date: string
          description?: string | null
          driver_id?: string | null
          end_location?: string | null
          id?: string
          passengers?: number | null
          start_location?: string | null
          status?: string
          title: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          additional_details?: string | null
          arrival_date?: string | null
          client?: string | null
          client_email?: string | null
          client_phone?: string | null
          company_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          driver_id?: string | null
          end_location?: string | null
          id?: string
          passengers?: number | null
          start_location?: string | null
          status?: string
          title?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_types: {
        Row: {
          capacity_max: number
          capacity_min: number
          created_at: string
          description: string
          id: number
          image_url: string | null
          type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          capacity_max: number
          capacity_min: number
          created_at?: string
          description: string
          id?: number
          image_url?: string | null
          type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          capacity_max?: number
          capacity_min?: number
          created_at?: string
          description?: string
          id?: number
          image_url?: string | null
          type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          capacity: number
          company_id: string | null
          created_at: string
          ecological_score: number | null
          emissions: number | null
          fuel_type: string
          id: string
          last_maintenance: string | null
          location: string | null
          mileage: number | null
          model: string
          photo_url: string | null
          registration: string
          status: string | null
          type: string
          updated_at: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
          year: number | null
        }
        Insert: {
          brand: string
          capacity: number
          company_id?: string | null
          created_at?: string
          ecological_score?: number | null
          emissions?: number | null
          fuel_type: string
          id?: string
          last_maintenance?: string | null
          location?: string | null
          mileage?: number | null
          model: string
          photo_url?: string | null
          registration: string
          status?: string | null
          type: string
          updated_at?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          year?: number | null
        }
        Update: {
          brand?: string
          capacity?: number
          company_id?: string | null
          created_at?: string
          ecological_score?: number | null
          emissions?: number | null
          fuel_type?: string
          id?: string
          last_maintenance?: string | null
          location?: string | null
          mileage?: number | null
          model?: string
          photo_url?: string | null
          registration?: string
          status?: string | null
          type?: string
          updated_at?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      vehicle_type:
        | "Minibus"
        | "Minicar"
        | "Autocar Standard"
        | "Autocar Grand Tourisme"
        | "Berline"
        | "Van"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      vehicle_type: [
        "Minibus",
        "Minicar",
        "Autocar Standard",
        "Autocar Grand Tourisme",
        "Berline",
        "Van",
      ],
    },
  },
} as const
