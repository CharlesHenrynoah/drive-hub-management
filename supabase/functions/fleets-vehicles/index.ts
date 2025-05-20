
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
    // Vérifier l'authentification de l'API
    const authResult = await checkApiAuth(req);
    if (!authResult.valid) {
      return authResult.response;
    }
    
    // Récupérer l'ID de la flotte depuis l'URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const fleetId = pathParts[pathParts.length - 2]; // Format: /fleets/{fleet_id}/vehicles
    
    if (!fleetId) {
      return new Response(
        JSON.stringify({ error: 'ID de flotte manquant' }),
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
    
    // Récupérer les informations de la flotte
    const { data: fleet, error: fleetError } = await supabase
      .from('fleets')
      .select('id, name, description')
      .eq('id', fleetId)
      .single();
      
    if (fleetError) {
      return new Response(
        JSON.stringify({ error: 'Flotte non trouvée' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Récupérer les IDs des véhicules de cette flotte
    const { data: fleetVehicles, error: fleetVehiclesError } = await supabase
      .from('fleet_vehicles')
      .select('vehicle_id')
      .eq('fleet_id', fleetId);
      
    if (fleetVehiclesError) {
      throw new Error(`Erreur lors de la récupération des véhicules de la flotte: ${fleetVehiclesError.message}`);
    }
    
    // Récupérer les IDs des chauffeurs de cette flotte
    const { data: fleetDrivers, error: fleetDriversError } = await supabase
      .from('fleet_drivers')
      .select('driver_id')
      .eq('fleet_id', fleetId);
      
    if (fleetDriversError) {
      throw new Error(`Erreur lors de la récupération des chauffeurs de la flotte: ${fleetDriversError.message}`);
    }
    
    // Si aucun véhicule et aucun chauffeur n'est trouvé dans cette flotte
    if (fleetVehicles.length === 0 && fleetDrivers.length === 0) {
      return new Response(
        JSON.stringify({ 
          fleet: fleet,
          vehicles: [],
          drivers: []
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Récupérer les détails des véhicules si nécessaire
    let vehicles = [];
    let vehiclesByType = {};
    
    if (fleetVehicles.length > 0) {
      const vehicleIds = fleetVehicles.map(fv => fv.vehicle_id);
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, brand, model, type, capacity, registration, fuel_type, photo_url, status')
        .in('id', vehicleIds);
        
      if (vehiclesError) {
        throw new Error(`Erreur lors de la récupération des véhicules: ${vehiclesError.message}`);
      }
      
      vehicles = vehiclesData || [];
      
      // Grouper les véhicules par type
      vehiclesByType = {};
      vehiclesData.forEach(vehicle => {
        if (!vehiclesByType[vehicle.type]) {
          vehiclesByType[vehicle.type] = [];
        }
        vehiclesByType[vehicle.type].push(vehicle);
      });
    }
    
    // Récupérer les détails des chauffeurs si nécessaire
    let drivers = [];
    
    if (fleetDrivers.length > 0) {
      const driverIds = fleetDrivers.map(fd => fd.driver_id);
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('id, id_chauffeur, nom, prenom, email, telephone, photo, ville, disponible')
        .in('id', driverIds);
        
      if (driversError) {
        throw new Error(`Erreur lors de la récupération des chauffeurs: ${driversError.message}`);
      }
      
      drivers = driversData || [];
    }
    
    return new Response(
      JSON.stringify({ 
        fleet: fleet,
        vehicles: vehicles,
        vehicles_by_type: vehiclesByType,
        drivers: drivers,
        total_vehicles: vehicles.length,
        total_drivers: drivers.length
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

// Fonction utilitaire pour vérifier l'authentification de l'API
async function checkApiAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: 'Token API manquant ou invalide' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    };
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
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: 'Token API invalide' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    };
  }
  
  if (data.revoked) {
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: 'Ce token API a été révoqué' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    };
  }
  
  // Mettre à jour la date de dernière utilisation
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);
  
  return { valid: true, keyId: data.id };
}
