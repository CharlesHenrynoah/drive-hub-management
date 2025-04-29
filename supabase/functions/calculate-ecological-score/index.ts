
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get the API key from environment variables
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vehicleData } = await req.json();
    
    // Prepare prompt for Gemini
    const prompt = `
      I need an ecological score from 0 to 100 for a vehicle with the following characteristics:
      - Type: ${vehicleData.type}
      - Fuel type: ${vehicleData.fuel}
      - Passenger capacity: ${vehicleData.capacity}
      ${vehicleData.year ? `- Year: ${vehicleData.year}` : ''}

      Please provide ONLY a number between 0 and 100 representing the ecological score,
      where 100 is the most ecological (clean, efficient, sustainable) and 0 is the least ecological.
      Consider factors like emissions, fuel efficiency per passenger, and environmental impact.
      Return ONLY the number, no explanation.
    `;

    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    const data = await response.json();
    
    // Extract the score from the response
    let score = 50; // Default score
    if (data?.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const responseText = data.candidates[0].content.parts[0].text.trim();
      const parsedScore = parseInt(responseText, 10);
      
      if (!isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= 100) {
        score = parsedScore;
      } else {
        console.log("Invalid score from API:", responseText);
      }
    } else {
      console.log("Unexpected API response format:", JSON.stringify(data));
    }

    return new Response(
      JSON.stringify({ score }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in calculate-ecological-score function:', error);
    return new Response(
      JSON.stringify({ error: error.message, score: 50 }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
