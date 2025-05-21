
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
    
    // 1. Mettre à jour les missions confirmées dont la date de début est dépassée
    const { data: confirmedMissions, error: confirmedError, count: confirmedCount } = await supabase
      .from('missions')
      .update({ status: 'en_cours' })
      .eq('status', 'confirmé')
      .lte('date', now)
      .select();
      
    if (confirmedError) {
      console.error("Error updating confirmed missions status:", confirmedError);
      throw confirmedError;
    }
    
    console.log(`Updated ${confirmedCount || 0} missions from 'confirmé' to 'en_cours' status`);
    
    // 2. Mettre à jour les missions en cours dont la date d'arrivée est dépassée
    const { data: ongoingMissions, error: ongoingError, count: ongoingCount } = await supabase
      .from('missions')
      .update({ status: 'terminee' })
      .eq('status', 'en_cours')
      .lt('arrival_date', now)
      .select();
    
    if (ongoingError) {
      console.error("Error updating ongoing mission status:", ongoingError);
      throw ongoingError;
    }
    
    console.log(`Updated ${ongoingCount || 0} missions from 'en_cours' to 'terminee' status`);
    
    // Combiner les résultats pour la réponse
    const allUpdatedMissions = [
      ...(confirmedMissions || []),
      ...(ongoingMissions || [])
    ];
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${confirmedCount || 0} missions to 'en_cours' and ${ongoingCount || 0} missions to 'terminee' status`,
        updatedMissions: allUpdatedMissions
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
