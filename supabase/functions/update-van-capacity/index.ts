
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/http_server

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

Deno.serve(async (req) => {
  try {
    // Créer un client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Mettre à jour la capacité du type "Van"
    const { error } = await supabase
      .from('vehicle_types')
      .update({ 
        capacity_max: 9,
        description: 'Van (6 - 9 passagers)' 
      })
      .eq('type', 'Van');
      
    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Capacité du Van mise à jour de 8 à 9 passagers"
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Erreur de serveur interne', details: err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
