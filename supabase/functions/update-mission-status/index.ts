
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client setup with direct URL and key references
const supabaseUrl = "https://nsfphygihklucqjiwngl.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting mission status update process...");
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get current time
    const now = new Date().toISOString();
    console.log(`Current time: ${now}`);
    
    // Update missions whose arrival date has passed and are still marked as "en_cours"
    const { data, error, count } = await supabase
      .from('missions')
      .update({ status: 'terminee' })
      .eq('status', 'en_cours')
      .lt('arrival_date', now)
      .select();
    
    if (error) {
      console.error("Error updating mission status:", error);
      throw error;
    }
    
    console.log(`Updated ${count || 0} missions to 'terminee' status`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${count || 0} missions to 'terminee' status`,
        updatedMissions: data
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200
      }
    );
    
  } catch (error) {
    console.error("Function execution error:", error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500 
      }
    );
  }
});
