
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/http_server

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Récupérer le token d'API depuis l'en-tête d'autorisation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token API manquant ou invalide' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const apiKey = authHeader.split(' ')[1];
    
    // Créer un client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Vérifier si le token existe et n'est pas révoqué
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, revoked')
      .eq('api_key', apiKey)
      .single();
      
    if (error || !data) {
      return new Response(
        JSON.stringify({ error: 'Token API invalide' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (data.revoked) {
      return new Response(
        JSON.stringify({ error: 'Ce token API a été révoqué' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Mettre à jour la date de dernière utilisation
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);
      
    // Enregistrer la requête API
    const url = new URL(req.url);
    await supabase
      .from('api_requests')
      .insert({
        api_key_id: data.id,
        method: req.method,
        endpoint: url.pathname,
        status_code: 200,
        ip_address: req.headers.get('x-forwarded-for') || null,
        response_time_ms: 0 // Sera mis à jour par le middleware
      });
    
    return new Response(
      JSON.stringify({ valid: true, key_id: data.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Erreur de serveur interne', details: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
