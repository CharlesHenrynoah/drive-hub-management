
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
  mileage?: number;
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
  switch (vehicleData.type) {
    case "Minibus":
      score += 10; // Better efficiency per passenger than larger buses
      break;
    case "Minicar":
      score += 5; // Good for medium groups
      break;
    case "Autocar Standard":
      score += 15; // Good efficiency per passenger for large groups
      break;
    case "Autocar Grand Tourisme":
      score += 20; // Best efficiency per passenger for very large groups
      break;
    case "VTC":
    case "Berline":
      score -= 5; // Less efficient for very small groups
      break;
    case "Van":
      score += 0; // Neutral, medium efficiency
      break;
  }
  
  // Adjust based on fuel type
  switch (vehicleData.fuel) {
    case "Électrique":
      score += 30;
      break;
    case "Hybride":
      score += 20;
      break;
    case "GNV": // Natural gas
      score += 15;
      break;
    case "Biodiesel":
      score += 10;
      break;
    case "Essence":
      score -= 5;
      break;
    case "Diesel":
      score -= 15;
      break;
  }
  
  // Adjust based on capacity (more passengers = better efficiency per person)
  score += Math.min(15, Math.floor(vehicleData.capacity / 10) * 3);
  
  // Adjust based on vehicle age if provided
  if (vehicleData.year) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicleData.year;
    
    if (age <= 2) {
      score += 10; // New vehicles are typically more efficient
    } else if (age <= 5) {
      score += 5;
    } else if (age > 10) {
      score -= 10; // Older vehicles are typically less efficient
    }
  }
  
  // Adjust based on mileage if provided
  if (vehicleData.mileage !== undefined) {
    if (vehicleData.mileage < 10000) {
      score += 5; // Low mileage is better
    } else if (vehicleData.mileage > 100000) {
      score -= 10; // High mileage vehicles tend to be less efficient
    } else if (vehicleData.mileage > 50000) {
      score -= 5; // Medium-high mileage
    }
  }
  
  // Cap the score between 0 and 100
  return Math.max(0, Math.min(100, score));
}
