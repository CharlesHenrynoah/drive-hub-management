
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { city, passengers } = body;

    if (!city) {
      return new Response(
        JSON.stringify({ error: 'City parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get companies with resources
    let companiesQuery = supabaseClient
      .from('companies')
      .select('id, name');
    
    const { data: companies, error: companiesError } = await companiesQuery;
    
    if (companiesError) {
      throw companiesError;
    }

    // Return empty array if no companies found
    if (!companies || companies.length === 0) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For each company, get drivers and vehicles count
    const companiesWithResources = await Promise.all(companies.map(async (company) => {
      try {
        // Get drivers for company and city
        const { data: drivers, error: driversError } = await supabaseClient
          .from('drivers')
          .select('id')
          .eq('id_entreprise', company.id)
          .eq('ville', city)
          .eq('disponible', true);
        
        if (driversError) throw driversError;
        
        // Get vehicles for company and city
        let vehicleQuery = supabaseClient
          .from('vehicles')
          .select('id, capacity')
          .eq('company_id', company.id)
          .eq('location', city)
          .eq('status', 'Disponible');
          
        const { data: vehicles, error: vehiclesError } = await vehicleQuery;
        
        if (vehiclesError) throw vehiclesError;
        
        // Count vehicles that meet passenger capacity requirement
        const vehiclesArray = vehicles || []; // Ensure vehicles is an array
        let suitableVehiclesCount = vehiclesArray.length;
        
        if (passengers && passengers > 0) {
          suitableVehiclesCount = vehiclesArray.filter(v => v.capacity >= passengers).length;
        }
        
        return {
          ...company,
          drivers_count: drivers ? drivers.length : 0,
          vehicles_count: vehiclesArray.length,
          suitable_vehicles_count: suitableVehiclesCount
        };
      } catch (error) {
        console.error(`Error processing company ${company.id}:`, error);
        // Return the company with zero counts on error
        return {
          ...company,
          drivers_count: 0,
          vehicles_count: 0,
          suitable_vehicles_count: 0
        };
      }
    }));
    
    // Filter companies that have both drivers and suitable vehicles
    const validCompanies = companiesWithResources.filter(c => {
      if (passengers && passengers > 0) {
        // If passenger count is specified, require suitable vehicles
        return c.drivers_count > 0 && c.suitable_vehicles_count > 0;
      }
      return c.drivers_count > 0 && c.vehicles_count > 0;
    });
    
    return new Response(
      JSON.stringify(validCompanies),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
    
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
