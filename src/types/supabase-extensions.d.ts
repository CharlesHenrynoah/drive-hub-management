
import { Database } from "@/integrations/supabase/types";

// Extension de la définition de Database pour inclure les nouvelles tables
declare module "@/integrations/supabase/types" {
  interface Database {
    public: {
      Tables: {
        api_keys: {
          Row: {
            id: string;
            name: string;
            api_key: string;
            revoked: boolean;
            created_at: string;
            last_used_at: string | null;
          };
          Insert: {
            id?: string;
            name: string;
            api_key: string;
            revoked?: boolean;
            created_at?: string;
            last_used_at?: string | null;
          };
          Update: {
            id?: string;
            name?: string;
            api_key?: string;
            revoked?: boolean;
            created_at?: string;
            last_used_at?: string | null;
          };
          Relationships: [];
        };
        api_requests: {
          Row: {
            id: string;
            api_key_id: string | null;
            endpoint: string;
            method: string;
            ip_address: string | null;
            status_code: number;
            response_time_ms: number | null;
            created_at: string;
          };
          Insert: {
            id?: string;
            api_key_id?: string | null;
            endpoint: string;
            method: string;
            ip_address?: string | null;
            status_code: number;
            response_time_ms?: number | null;
            created_at?: string;
          };
          Update: {
            id?: string;
            api_key_id?: string | null;
            endpoint?: string;
            method?: string;
            ip_address?: string | null;
            status_code?: number;
            response_time_ms?: number | null;
            created_at?: string;
          };
          Relationships: [
            {
              foreignKeyName: "api_requests_api_key_id_fkey";
              columns: ["api_key_id"];
              isOneToOne: false;
              referencedRelation: "api_keys";
              referencedColumns: ["id"];
            }
          ];
        };
      } & Database["public"]["Tables"];
    };
  }
}
