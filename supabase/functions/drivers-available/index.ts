
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/http_server

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    // Récupérer les paramètres depuis l'URL
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');
    const vehicleTypeParam = url.searchParams.get('vehicle_type'); // Paramètre pour filtrer par type de véhicule
    const locationParam = url.searchParams.get('location'); // Paramètre pour le lieu des chauffeurs
    const companyIdParam = url.searchParams.get('company_id'); // Paramètre pour l'entreprise
    
    const searchDate = dateParam ? new Date(dateParam) : new Date();
    
    // Créer un client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Récupérer tous les chauffeurs disponibles
    let query = supabase
      .from('drivers')
      .select('id, nom, prenom, email, telephone, disponible, photo, ville, id_entreprise')
      .eq('disponible', true);
      
    // Filtrer par lieu du chauffeur si spécifié
    if (locationParam) {
      query = query.eq('ville', locationParam);
    }
    
    // Filtrer par entreprise si spécifié
    if (companyIdParam) {
      query = query.eq('id_entreprise', companyIdParam);
    }
    
    const { data: allDrivers, error: driversError } = await query;
      
    if (driversError) {
      throw new Error(`Erreur lors de la récupération des chauffeurs: ${driversError.message}`);
    }
    
    // Récupérer les missions à cette date pour vérifier quels chauffeurs sont occupés
    const formattedDate = searchDate.toISOString().split('T')[0];
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('driver_id')
      .gte('date', `${formattedDate}T00:00:00`)
      .lte('date', `${formattedDate}T23:59:59`)
      .neq('status', 'annulee');
      
    if (missionsError) {
      throw new Error(`Erreur lors de la récupération des missions: ${missionsError.message}`);
    }
    
    // Filtrer les chauffeurs qui sont déjà assignés à une mission à cette date
    const busyDriverIds = missions.map(mission => mission.driver_id);
    let availableDrivers = allDrivers.filter(driver => !busyDriverIds.includes(driver.id));
    
    // Si un type de véhicule est spécifié, filtrer les chauffeurs par type de véhicule qu'ils peuvent conduire
    if (vehicleTypeParam) {
      const { data: driverVehicleTypes, error: dvtError } = await supabase
        .from('driver_vehicle_types')
        .select('driver_id, vehicle_type')
        .eq('vehicle_type', vehicleTypeParam);
        
      if (dvtError) {
        throw new Error(`Erreur lors de la récupération des types de véhicules des chauffeurs: ${dvtError.message}`);
      }
      
      const eligibleDriverIds = driverVehicleTypes.map(dvt => dvt.driver_id);
      availableDrivers = availableDrivers.filter(driver => eligibleDriverIds.includes(driver.id));
    }
    
    return new Response(
      JSON.stringify({ 
        date: formattedDate,
        location: locationParam || null,
        vehicle_type: vehicleTypeParam || null,
        company_id: companyIdParam || null,
        drivers: availableDrivers
      }),
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
