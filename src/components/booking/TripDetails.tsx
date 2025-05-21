
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock, MapPin, Users, Calendar, Info } from "lucide-react";
import { Driver } from "@/types/driver";
import { Vehicle } from "@/types/vehicle";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';

interface TripDetailsProps {
  driver: Driver;
  vehicle: Vehicle;
  departureLocation: string;
  destinationLocation: string;
  departureDate: Date;
  passengerCount: string;
  additionalInfo: string;
  onContinue: () => void;
  onBack: () => void;
  setEstimatedDuration: (duration: string) => void;
  setEstimatedPrice: (price: number) => void;
}

export function TripDetails({
  driver,
  vehicle,
  departureLocation,
  destinationLocation,
  departureDate,
  passengerCount,
  additionalInfo,
  onContinue,
  onBack,
  setEstimatedDuration,
  setEstimatedPrice
}: TripDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [estimatedDuration, setEstimatedDuration] = useState("2h 30");
  const [estimatedPrice, setEstimatedPrice] = useState(450);
  const [arrivalTime, setArrivalTime] = useState<Date>(new Date());
  
  // Calculate estimated duration and price
  useEffect(() => {
    const calculateEstimates = async () => {
      try {
        setLoading(true);
        
        // Simulate API call to get estimates - NOTA: à remplacer par un appel à Gemini API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Calculate based on locations
        let duration = "2h 30";
        let price = 450;
        
        // Simple distance-based calculation
        const distanceMap: Record<string, Record<string, number>> = {
          "Paris": {
            "Lyon": 465,
            "Marseille": 775,
            "Bordeaux": 585,
            "Toulouse": 675,
            "Lille": 220,
            "Strasbourg": 490,
            "Nantes": 380,
            "Nice": 930,
          },
          "Lyon": {
            "Paris": 465,
            "Marseille": 315,
            "Bordeaux": 550,
            "Toulouse": 540,
            "Lille": 690,
            "Strasbourg": 500,
            "Nantes": 630,
            "Nice": 470,
          },
          "Marseille": {
            "Paris": 775,
            "Lyon": 315,
            "Bordeaux": 645,
            "Toulouse": 400,
            "Lille": 1000,
            "Strasbourg": 815,
            "Nantes": 970,
            "Nice": 200,
          },
          "Bordeaux": {
            "Paris": 585,
            "Lyon": 550,
            "Marseille": 645,
            "Toulouse": 250,
            "Lille": 800,
            "Strasbourg": 1050,
            "Nantes": 340,
            "Nice": 800,
          }
        };
        
        // Get distance if available
        let distance = 500; // Default distance in km
        if (distanceMap[departureLocation]?.[destinationLocation]) {
          distance = distanceMap[departureLocation][destinationLocation];
        } else if (distanceMap[destinationLocation]?.[departureLocation]) {
          distance = distanceMap[destinationLocation][departureLocation];
        }
        
        // Calculate duration (average speed 90 km/h)
        const hours = Math.floor(distance / 90);
        const minutes = Math.round((distance / 90 - hours) * 60);
        duration = `${hours}h ${minutes}`;
        
        // Calculate price based on distance, vehicle type and passengers
        const basePricePerKm = 1.5;
        const capacityFactor = parseInt(passengerCount) > 30 ? 1.5 : 1.2;
        const vehicleTypeFactor = vehicle.type === "Luxe" ? 2 : 
                                vehicle.type === "Tourisme" ? 1.5 : 
                                vehicle.type === "Minicar" ? 1.2 : 1;
        
        // Seasonal factor (summer months cost more)
        const month = departureDate.getMonth();
        const seasonalFactor = (month >= 5 && month <= 8) ? 1.2 : 1;
        
        price = Math.round(distance * basePricePerKm * capacityFactor * vehicleTypeFactor * seasonalFactor);
        
        // Calculate arrival time
        const arrival = new Date(departureDate);
        arrival.setHours(arrival.getHours() + hours);
        arrival.setMinutes(arrival.getMinutes() + minutes);
        
        setEstimatedDuration(duration);
        setEstimatedPrice(price);
        setArrivalTime(arrival);
        
        // Pass values to parent component
        setEstimatedDuration(duration);
        setEstimatedPrice(price);
      } catch (error) {
        console.error("Error calculating estimates:", error);
      } finally {
        setLoading(false);
      }
    };
    
    calculateEstimates();
  }, [departureLocation, destinationLocation, departureDate, passengerCount, vehicle.type]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Détails du trajet</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg">Informations de voyage</h3>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-hermes-green" />
                <div>
                  <p className="text-sm text-gray-500">Départ</p>
                  <p className="font-medium">{departureLocation}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Arrivée</p>
                  <p className="font-medium">{destinationLocation}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Date et heure de départ</p>
                  <p className="font-medium">{format(departureDate, "d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Nombre de passagers</p>
                  <p className="font-medium">{passengerCount} personnes</p>
                </div>
              </div>
              
              {additionalInfo && (
                <div className="flex items-start">
                  <Info className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Informations supplémentaires</p>
                    <p className="font-medium">{additionalInfo}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-lg">Estimations</h3>
            
            {loading ? (
              <p className="text-sm text-gray-500">Calcul des estimations en cours...</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Durée estimée</p>
                    <p className="font-medium">{estimatedDuration}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Heure d'arrivée estimée</p>
                    <p className="font-medium">{format(arrivalTime, "d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Prix total estimé</p>
                  <p className="text-2xl font-bold">{estimatedPrice} €</p>
                  <p className="text-xs text-gray-500 mt-1">Tous frais inclus, TTC</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-bold">Chauffeur sélectionné</h3>
            
            <div className="flex items-center">
              {driver.photo ? (
                <img 
                  src={driver.photo} 
                  alt={`${driver.prenom} ${driver.nom}`}
                  className="h-12 w-12 object-cover rounded-full mr-3"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium">{driver.prenom} {driver.nom}</p>
                <div className="flex items-center text-sm text-yellow-500">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  <span>{driver.note_chauffeur || "N/A"}/5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-bold">Véhicule sélectionné</h3>
            
            <div className="flex items-center">
              {vehicle.photo_url ? (
                <img 
                  src={vehicle.photo_url} 
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="h-12 w-16 object-cover mr-3 rounded"
                />
              ) : (
                <div className="h-12 w-16 bg-gray-200 mr-3 rounded flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                <p className="text-sm text-gray-500">Capacité: {vehicle.capacity} passagers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          onClick={onBack}
          variant="outline"
        >
          Retour
        </Button>
        <Button 
          onClick={onContinue}
          disabled={loading}
          className="bg-hermes-green hover:bg-hermes-green/80 text-black"
        >
          Continuer vers le paiement
        </Button>
      </div>
    </div>
  );
}
