
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
  passengers?: number;
  description?: string;
  additional_details?: string;
}

Deno.serve(async (req) => {
  const startTime = performance.now();
  const requestIP = req.headers.get("x-forwarded-for") || "unknown";
  const requestURL = new URL(req.url);
  const endpoint = requestURL.pathname;
  const requestMethod = req.method;
  let apiKeyId: string | null = null;
  let statusCode = 200;
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      });
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
      statusCode = 405;
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: statusCode,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the mission data from the request body
    const missionData: MissionPayload = await req.json();

    // API key verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      statusCode = 401;
      return new Response(
        JSON.stringify({ error: 'Missing or invalid API key' }),
        {
          status: statusCode,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const apiKey = authHeader.split(' ')[1];
    
    // Verify API key against database
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('id, revoked')
      .eq('api_key', apiKey)
      .single();
      
    if (apiKeyError || !apiKeyData) {
      statusCode = 401;
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        {
          status: statusCode,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (apiKeyData.revoked) {
      statusCode = 401;
      return new Response(
        JSON.stringify({ error: 'API key has been revoked' }),
        {
          status: statusCode,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    apiKeyId = apiKeyData.id;
    
    // Update last used timestamp for API key
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyId);
    
    // Basic validation to ensure we have at minimum required fields
    if (!missionData.title || !missionData.date) {
      statusCode = 400;
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and date are required' }),
        {
          status: statusCode,
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
      statusCode = 400;
      
      return new Response(
        JSON.stringify({ error: `Failed to create mission: ${error.message}` }),
        {
          status: statusCode,
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

    statusCode = 201;
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
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    statusCode = 500;
    
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur inattendue est survenue',
        details: err instanceof Error ? err.message : 'Unknown error'
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } finally {
    // Calculate response time
    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);
    
    // Create Supabase client again to log the request
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Log API request
      await supabase
        .from('api_requests')
        .insert({
          api_key_id: apiKeyId,
          method: requestMethod,
          endpoint,
          ip_address: requestIP,
          status_code: statusCode,
          response_time_ms: responseTimeMs
        });
    } catch (error) {
      console.error('Error logging API request:', error);
    }
  }
});
