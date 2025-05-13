
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/http_server

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Définition des en-têtes CORS pour permettre les requêtes cross-origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Gestion des requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  // Validation que seules les requêtes POST sont acceptées
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Méthode non autorisée' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  const startTime = performance.now();
  let apiKeyId = null;
  let statusCode = 500;

  try {
    // Récupérer la clé API de l'en-tête
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      statusCode = 401;
      throw new Error('Clé API requise');
    }

    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier si la clé API est valide
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, revoked')
      .eq('api_key', apiKey)
      .single();

    if (keyError || !keyData) {
      statusCode = 401;
      throw new Error('Clé API invalide');
    }

    if (keyData.revoked) {
      statusCode = 403;
      throw new Error('Clé API révoquée');
    }

    apiKeyId = keyData.id;

    // Mettre à jour la date de dernière utilisation de la clé API
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyId);

    // Récupérer et valider les données de la requête
    const { title, date, description, driver_id, vehicle_id, client, 
            start_location, end_location, passengers, company_id, arrival_date } = await req.json();

    if (!title || !date) {
      statusCode = 400;
      throw new Error('Titre et date requis');
    }

    // Créer une nouvelle mission
    const { data: mission, error } = await supabase
      .from('missions')
      .insert({
        title,
        date,
        description,
        driver_id,
        vehicle_id,
        client,
        start_location,
        end_location,
        passengers,
        company_id,
        arrival_date,
        status: 'en_cours'
      })
      .select()
      .single();

    if (error) {
      statusCode = 400;
      throw error;
    }

    statusCode = 201;
    
    // Renvoyer une réponse de succès
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mission créée avec succès',
        data: mission
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Erreur:', err);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur inconnue'
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } finally {
    // Enregistrer la requête API dans le journal
    try {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Créer le client Supabase (à nouveau car on ne peut pas le réutiliser dans un bloc finally)
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Enregistrer la requête
      await supabase
        .from('api_requests')
        .insert({
          api_key_id: apiKeyId,
          endpoint: '/create-mission',
          method: 'POST',
          ip_address: req.headers.get('x-forwarded-for') || null,
          status_code: statusCode,
          response_time_ms: responseTime
        });
    } catch (logError) {
      console.error('Erreur lors de l\'enregistrement de la requête:', logError);
    }
  }
});
