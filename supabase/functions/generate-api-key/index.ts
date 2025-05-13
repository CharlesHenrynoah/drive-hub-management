
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/http_server

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { generate } from 'https://deno.land/std@0.198.0/uuid/v4.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { name } = await req.json();

    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate API key - using a format like: hermes_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const apiKeyUuid = await generate();
    const apiKey = `hermes_${apiKeyUuid}`;

    // Store API key in database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        name,
        api_key: apiKey,
        revoked: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting API key:', error);
      throw error;
    }

    // Return success response with API key
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'API key generated successfully', 
        key: apiKey,
        id: data.id
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
        error: 'An unexpected error occurred',
        details: err instanceof Error ? err.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
