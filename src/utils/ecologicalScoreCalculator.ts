
/**
 * Utility to calculate ecological score using Gemini API
 */
import { supabase } from "@/integrations/supabase/client";

interface VehicleData {
  type: string;
  fuel: string;
  capacity: number;
  year?: number;
  emissions?: number;
}

export async function calculateEcologicalScore(vehicleData: VehicleData): Promise<number> {
  try {
    // Get the API key from Supabase edge function
    const { data, error } = await supabase.functions.invoke('calculate-ecological-score', {
      body: { vehicleData }
    });

    if (error) {
      console.error('Error calculating ecological score:', error);
      // Fallback calculation if API fails
      return getDefaultEcologicalScore(vehicleData);
    }

    return data.score;
  } catch (e) {
    console.error('Exception calculating ecological score:', e);
    return getDefaultEcologicalScore(vehicleData);
  }
}

// Fallback calculation if API fails
function getDefaultEcologicalScore(vehicleData: VehicleData): number {
  let score = 50; // Base score
  
  // Adjust based on vehicle type
  if (vehicleData.type === "Mini Bus") {
    score += 10; // Mini buses tend to be more efficient per passenger than regular buses
  } else if (vehicleData.type === "Bus") {
    score += 5; // Good for mass transit
  }
  
  // Adjust based on fuel type
  if (vehicleData.fuel === "Electrique") {
    score += 30;
  } else if (vehicleData.fuel === "Hybride") {
    score += 20;
  } else if (vehicleData.fuel === "Diesel") {
    score -= 10;
  }
  
  // Adjust based on capacity (more passengers = better efficiency per person)
  score += Math.min(15, Math.floor(vehicleData.capacity / 10) * 3);
  
  // Cap the score between 0 and 100
  return Math.max(0, Math.min(100, score));
}
