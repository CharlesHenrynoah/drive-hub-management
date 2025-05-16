
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
    // Récupérer la ville depuis les paramètres de requête
    const url = new URL(req.url);
    const city = url.searchParams.get('city');
    
    if (!city) {
      return new Response(
        JSON.stringify({ error: 'Le paramètre city est requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Créer un client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Récupérer toutes les entreprises
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
      
    if (companiesError) {
      throw new Error(`Erreur lors de la récupération des entreprises: ${companiesError.message}`);
    }
    
    // Tableau pour stocker les entreprises avec ressources disponibles
    const companiesWithResources = [];
    
    // 2. Pour chaque entreprise, vérifier si elle a des chauffeurs et des véhicules dans la ville spécifiée
    for (const company of companies) {
      // Récupérer les chauffeurs de l'entreprise dans la ville spécifiée
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id_entreprise', company.id)
        .eq('ville', city)
        .eq('disponible', true);
        
      if (driversError) {
        console.error(`Erreur lors de la récupération des chauffeurs: ${driversError.message}`);
        continue;
      }
      
      // Récupérer les véhicules de l'entreprise dans la ville spécifiée
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('company_id', company.id)
        .eq('location', city)
        .eq('status', 'Disponible');
        
      if (vehiclesError) {
        console.error(`Erreur lors de la récupération des véhicules: ${vehiclesError.message}`);
        continue;
      }
      
      // Si l'entreprise a au moins un chauffeur et un véhicule dans la ville spécifiée, l'ajouter à la liste
      if (drivers.length > 0 && vehicles.length > 0) {
        companiesWithResources.push({
          ...company,
          drivers_count: drivers.length,
          vehicles_count: vehicles.length
        });
      }
    }
    
    return new Response(
      JSON.stringify(companiesWithResources),
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
