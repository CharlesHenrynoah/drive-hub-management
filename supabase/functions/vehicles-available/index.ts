
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
    const typeParam = url.searchParams.get('type');
    const fleetIdParam = url.searchParams.get('fleet_id');
    const vehicleTypeParam = url.searchParams.get('vehicle_type');
    const locationParam = url.searchParams.get('location'); // Paramètre pour le lieu
    const passengersParam = url.searchParams.get('passengers'); // Paramètre pour le nombre de passagers
    
    const searchDate = dateParam ? new Date(dateParam) : new Date();
    
    // Créer un client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Construire la requête pour récupérer les véhicules
    let query = supabase
      .from('vehicles')
      .select('id, brand, model, type, capacity, registration, fuel_type, photo_url, status, vehicle_type, location, company_id')
      .eq('status', 'Disponible');
      
    // Filtrer par type classique (champ 'type')
    if (typeParam) {
      query = query.eq('type', typeParam);
    }
    
    // Filtrer par type énuméré (nouveau champ 'vehicle_type')
    if (vehicleTypeParam) {
      query = query.eq('vehicle_type', vehicleTypeParam);
    }
    
    // Filtrer par localisation
    if (locationParam) {
      query = query.eq('location', locationParam);
    }
    
    // Filtrer par nombre de passagers
    if (passengersParam) {
      const passengers = parseInt(passengersParam, 10);
      if (!isNaN(passengers)) {
        query = query.gte('capacity', passengers);
      }
    }
    
    // Si un fleet_id est fourni, filtrer par flotte
    if (fleetIdParam) {
      const { data: fleetVehicles, error: fleetError } = await supabase
        .from('fleet_vehicles')
        .select('vehicle_id')
        .eq('fleet_id', fleetIdParam);
        
      if (fleetError) {
        throw new Error(`Erreur lors de la récupération des véhicules de la flotte: ${fleetError.message}`);
      }
      
      const vehicleIds = fleetVehicles.map(fv => fv.vehicle_id);
      if (vehicleIds.length > 0) {
        query = query.in('id', vehicleIds);
      } else {
        // Si aucun véhicule n'est trouvé dans cette flotte, renvoyer une liste vide
        return new Response(
          JSON.stringify({ 
            date: searchDate.toISOString().split('T')[0],
            vehicles: []
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    const { data: allVehicles, error: vehiclesError } = await query;
      
    if (vehiclesError) {
      throw new Error(`Erreur lors de la récupération des véhicules: ${vehiclesError.message}`);
    }
    
    // Récupérer les missions à cette date pour vérifier quels véhicules sont occupés
    const formattedDate = searchDate.toISOString().split('T')[0];
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('vehicle_id')
      .gte('date', `${formattedDate}T00:00:00`)
      .lte('date', `${formattedDate}T23:59:59`)
      .neq('status', 'annulee');
      
    if (missionsError) {
      throw new Error(`Erreur lors de la récupération des missions: ${missionsError.message}`);
    }
    
    // Filtrer les véhicules qui sont déjà assignés à une mission à cette date
    const busyVehicleIds = missions.map(mission => mission.vehicle_id);
    const availableVehicles = allVehicles.filter(vehicle => !busyVehicleIds.includes(vehicle.id));
    
    // Récupérer les informations sur les types de véhicules standardisés
    const { data: vehicleTypes, error: vehicleTypesError } = await supabase
      .from('vehicle_types')
      .select('*');
    
    if (vehicleTypesError) {
      throw new Error(`Erreur lors de la récupération des types de véhicules: ${vehicleTypesError.message}`);
    }
    
    // Enrichir les données des véhicules avec les informations de type
    const enrichedVehicles = availableVehicles.map(vehicle => {
      const vehicleTypeInfo = vehicleTypes?.find(vt => vt.type === vehicle.vehicle_type);
      return {
        ...vehicle,
        vehicle_type_info: vehicleTypeInfo || null
      };
    });
    
    console.log("Véhicules disponibles trouvés:", enrichedVehicles.length);
    
    return new Response(
      JSON.stringify({ 
        date: formattedDate,
        type: typeParam || 'all',
        vehicle_type: vehicleTypeParam || 'all',
        location: locationParam || null,
        passengers: passengersParam ? parseInt(passengersParam, 10) : null,
        fleet_id: fleetIdParam || null,
        vehicles: enrichedVehicles
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error("Erreur dans vehicles-available:", err);
    return new Response(
      JSON.stringify({ error: 'Erreur de serveur interne', details: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
