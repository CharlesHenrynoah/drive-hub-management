
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/http_server

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface MissionPayload {
  title: string;
  date: string;
  arrival_date?: string;
  driver_id?: string;
  vehicle_id?: string;
  fleet_id?: string;
  company_id?: string;
  status?: string;
  start_location?: string;
  end_location?: string;
  client?: string;
  client_email?: string;
  client_phone?: string;
  passengers?: number;
  description?: string;
  additional_details?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the mission data from the request body
    const missionData: MissionPayload = await req.json();

    // API key verification (optional, implement as needed)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid API key' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const apiKey = authHeader.split(' ')[1];
    // Basic validation to ensure we have at minimum required fields
    if (!missionData.title || !missionData.date) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and date are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Format the mission payload for insertion
    const missionPayload = {
      title: missionData.title,
      date: missionData.date,
      arrival_date: missionData.arrival_date || null,
      driver_id: missionData.driver_id || null,
      vehicle_id: missionData.vehicle_id || null,
      company_id: missionData.company_id || null,
      status: missionData.status || 'en_cours',
      start_location: missionData.start_location || null,
      end_location: missionData.end_location || null,
      client: missionData.client || null,
      client_email: missionData.client_email || null,
      client_phone: missionData.client_phone || null,
      passengers: missionData.passengers || null,
      description: missionData.description || null,
      additional_details: missionData.additional_details || null
    };

    // Insert the mission into the database
    const { data, error } = await supabase
      .from('missions')
      .insert(missionPayload)
      .select('id, title')
      .single();

    if (error) {
      console.error('Error creating mission:', error);
      
      return new Response(
        JSON.stringify({ error: `Failed to create mission: ${error.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If fleet_id is provided, associate driver and vehicle with this fleet
    if (missionData.fleet_id && missionData.driver_id) {
      // Check if driver is already in the fleet
      const { data: existingDriverInFleet } = await supabase
        .from('fleet_drivers')
        .select('id')
        .eq('fleet_id', missionData.fleet_id)
        .eq('driver_id', missionData.driver_id)
        .maybeSingle();
        
      if (!existingDriverInFleet) {
        // Add driver to the fleet
        await supabase
          .from('fleet_drivers')
          .insert({
            fleet_id: missionData.fleet_id,
            driver_id: missionData.driver_id
          });
      }
    }
    
    if (missionData.fleet_id && missionData.vehicle_id) {
      // Check if vehicle is already in the fleet
      const { data: existingVehicleInFleet } = await supabase
        .from('fleet_vehicles')
        .select('id')
        .eq('fleet_id', missionData.fleet_id)
        .eq('vehicle_id', missionData.vehicle_id)
        .maybeSingle();
        
      if (!existingVehicleInFleet) {
        // Add vehicle to the fleet
        await supabase
          .from('fleet_vehicles')
          .insert({
            fleet_id: missionData.fleet_id,
            vehicle_id: missionData.vehicle_id
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mission créée avec succès', 
        data: { 
          id: data.id,
          title: data.title 
        } 
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur inattendue est survenue',
        details: err instanceof Error ? err.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
