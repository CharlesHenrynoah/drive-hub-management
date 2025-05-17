
/**
 * Utilitaire pour calculer la distance et le temps de trajet entre deux points
 */

// Estimation de vitesse moyenne selon le type de véhicule (en km/h)
const AVERAGE_SPEEDS = {
  SEDAN: 90,
  SUV: 85,
  VAN: 80, 
  MINIBUS: 75,
  BUS: 70,
  DEFAULT: 80
};

/**
 * Calcule la distance approximative entre deux villes (en kilomètres)
 * Cette fonction utilise une approximation basée sur les coordonnées des villes
 */
export async function calculateDistance(
  origin: string, 
  destination: string
): Promise<number> {
  try {
    // Coordonnées des principales villes françaises et européennes
    const CITY_COORDINATES: Record<string, {lat: number, lng: number}> = {
      // France
      "Paris": {lat: 48.8566, lng: 2.3522},
      "Marseille": {lat: 43.2965, lng: 5.3698},
      "Lyon": {lat: 45.7640, lng: 4.8357},
      "Toulouse": {lat: 43.6047, lng: 1.4442},
      "Nice": {lat: 43.7102, lng: 7.2620},
      "Nantes": {lat: 47.2184, lng: -1.5536},
      "Strasbourg": {lat: 48.5734, lng: 7.7521},
      "Montpellier": {lat: 43.6108, lng: 3.8767},
      "Bordeaux": {lat: 44.8378, lng: -0.5792},
      "Lille": {lat: 50.6292, lng: 3.0573},
      // Europe
      "Berlin": {lat: 52.5200, lng: 13.4050},
      "Madrid": {lat: 40.4168, lng: -3.7038},
      "Rome": {lat: 41.9028, lng: 12.4964},
      "Londres": {lat: 51.5074, lng: -0.1278},
      "Amsterdam": {lat: 52.3676, lng: 4.9041},
      "Bruxelles": {lat: 50.8503, lng: 4.3517},
      "Vienne": {lat: 48.2082, lng: 16.3738},
      "Lisbonne": {lat: 38.7223, lng: -9.1393},
      "Athènes": {lat: 37.9838, lng: 23.7275},
      "Stockholm": {lat: 59.3293, lng: 18.0686},
    };
    
    // Si les villes ne sont pas dans notre liste, on retourne une estimation par défaut
    if (!CITY_COORDINATES[origin] || !CITY_COORDINATES[destination]) {
      console.log("Villes non trouvées dans la base de données, estimation par défaut");
      return 300; // Distance par défaut en kilomètres
    }
    
    // Calcul de la distance à vol d'oiseau (formule de Haversine)
    const R = 6371; // Rayon de la Terre en km
    const originCoord = CITY_COORDINATES[origin];
    const destCoord = CITY_COORDINATES[destination];
    
    const dLat = toRad(destCoord.lat - originCoord.lat);
    const dLng = toRad(destCoord.lng - originCoord.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(originCoord.lat)) * Math.cos(toRad(destCoord.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Ajout de 30% pour tenir compte des routes (non linéaires)
    const adjustedDistance = distance * 1.3;
    
    return Math.round(adjustedDistance);
  } catch (error) {
    console.error("Erreur lors du calcul de distance:", error);
    return 300; // Distance par défaut en cas d'erreur
  }
}

// Conversion de degrés en radians
function toRad(value: number): number {
  return value * Math.PI / 180;
}

/**
 * Estime le temps de trajet en fonction de la distance et du type de véhicule
 * @param distance - Distance en kilomètres
 * @param vehicleType - Type de véhicule
 * @returns Durée estimée en minutes
 */
export function estimateTravelTime(
  distance: number, 
  vehicleType?: string
): number {
  const speed = vehicleType && AVERAGE_SPEEDS[vehicleType as keyof typeof AVERAGE_SPEEDS]
    ? AVERAGE_SPEEDS[vehicleType as keyof typeof AVERAGE_SPEEDS]
    : AVERAGE_SPEEDS.DEFAULT;
    
  // Temps en heures = distance / vitesse
  const timeInHours = distance / speed;
  
  // Conversion en minutes et ajout d'une marge de 15%
  let timeInMinutes = timeInHours * 60 * 1.15;
  
  // Arrondi aux 5 minutes supérieures
  timeInMinutes = Math.ceil(timeInMinutes / 5) * 5;
  
  return timeInMinutes;
}

/**
 * Calcule l'heure d'arrivée estimée
 * @param departureTime - Heure de départ
 * @param distanceKm - Distance en kilomètres
 * @param vehicleType - Type de véhicule
 * @returns Date d'arrivée estimée
 */
export function calculateEstimatedArrival(
  departureTime: Date,
  distanceKm: number,
  vehicleType?: string
): Date {
  const travelTimeMinutes = estimateTravelTime(distanceKm, vehicleType);
  const arrivalTime = new Date(departureTime.getTime() + travelTimeMinutes * 60 * 1000);
  
  return arrivalTime;
}
