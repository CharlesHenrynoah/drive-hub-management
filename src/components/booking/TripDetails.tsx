
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bus, User, Clock, Calendar, MapPin, Euro } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { Skeleton } from "@/components/ui/skeleton";

interface TripDetailsProps {
  vehicle: Vehicle;
  driver: Driver;
  departureLocation: string;
  destinationLocation: string;
  departureDate: Date;
  passengerCount: string;
  onContinue: (tripDetails: {
    duration: string;
    arrivalTime: string;
    price: number;
  }) => void;
  onBack: () => void;
}

export function TripDetails({
  vehicle,
  driver,
  departureLocation,
  destinationLocation,
  departureDate,
  passengerCount,
  onContinue,
  onBack
}: TripDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [tripDetails, setTripDetails] = useState({
    duration: "",
    arrivalTime: "",
    price: 0
  });

  useEffect(() => {
    // Simulate API call to calculate trip details
    const calculateTripDetails = async () => {
      setLoading(true);
      
      try {
        // In a real app, this would be a call to a Gemini API through an edge function
        // For now we'll simulate it with some reasonable calculations
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Calculate distance (this would be done via Google Maps API in a real app)
        const distanceMap: Record<string, Record<string, number>> = {
          "Paris": { "Lyon": 465, "Marseille": 774, "Bordeaux": 580, "Toulouse": 680, "Strasbourg": 490, "Nice": 930 },
          "Lyon": { "Paris": 465, "Marseille": 315, "Bordeaux": 550, "Toulouse": 540, "Strasbourg": 490, "Nice": 470 },
          "Marseille": { "Paris": 774, "Lyon": 315, "Bordeaux": 645, "Toulouse": 400, "Strasbourg": 800, "Nice": 200 },
          "Bordeaux": { "Paris": 580, "Lyon": 550, "Marseille": 645, "Toulouse": 245, "Strasbourg": 920, "Nice": 800 },
          "Toulouse": { "Paris": 680, "Lyon": 540, "Marseille": 400, "Bordeaux": 245, "Strasbourg": 930, "Nice": 600 },
          "Strasbourg": { "Paris": 490, "Lyon": 490, "Marseille": 800, "Bordeaux": 920, "Toulouse": 930, "Nice": 715 },
          "Nice": { "Paris": 930, "Lyon": 470, "Marseille": 200, "Bordeaux": 800, "Toulouse": 600, "Strasbourg": 715 }
        };
        
        // Get distance or use default
        const distance = 
          (distanceMap[departureLocation] && distanceMap[departureLocation][destinationLocation]) || 
          Math.floor(Math.random() * 500) + 200; // Random distance between 200-700 km
        
        // Calculate duration (avg speed 80 km/h)
        const durationHours = distance / 80;
        const durationHoursRounded = Math.floor(durationHours);
        const durationMinutes = Math.floor((durationHours - durationHoursRounded) * 60);
        
        // Format duration
        const duration = `${durationHoursRounded}h${durationMinutes > 0 ? ` ${durationMinutes}min` : ''}`;
        
        // Calculate arrival time
        const arrivalTime = new Date(departureDate);
        arrivalTime.setHours(arrivalTime.getHours() + durationHoursRounded);
        arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);
        
        // Calculate price based on distance, vehicle type, and season
        const basePrice = distance * 2.5; // Base rate per km
        
        // Vehicle type multiplier
        const vehicleMultiplier = 
          vehicle.type.toLowerCase().includes('standard') ? 1.0 :
          vehicle.type.toLowerCase().includes('luxe') || vehicle.type.toLowerCase().includes('vip') ? 1.5 :
          vehicle.capacity > 40 ? 1.3 : 
          1.1;
        
        // Season multiplier (higher in summer and during holidays)
        const month = departureDate.getMonth();
        const seasonMultiplier = 
          (month >= 5 && month <= 8) ? 1.3 : // Summer (Jun-Sep)
          (month === 11 || month === 0) ? 1.2 : // Winter holidays (Dec-Jan)
          1.0; // Rest of the year
        
        // Passenger count impact (slight discount for larger groups)
        const passengerCountNum = parseInt(passengerCount, 10);
        const passengerMultiplier = passengerCountNum > 30 ? 0.9 : passengerCountNum > 15 ? 0.95 : 1.0;
        
        // Calculate final price
        let price = basePrice * vehicleMultiplier * seasonMultiplier * passengerMultiplier;
        
        // Add driver rating impact (slight premium for high-rated drivers)
        const driverRatingMultiplier = driver.note_chauffeur ? (1.0 + (driver.note_chauffeur - 3) * 0.05) : 1.0;
        price *= driverRatingMultiplier;
        
        // Round to nearest 10
        price = Math.ceil(price / 10) * 10;
        
        setTripDetails({
          duration,
          arrivalTime: format(arrivalTime, "HH'h'mm", { locale: fr }),
          price
        });
      } catch (error) {
        console.error("Error calculating trip details:", error);
        // Fallback values
        setTripDetails({
          duration: "4h30",
          arrivalTime: "16h30",
          price: 850
        });
      } finally {
        setLoading(false);
      }
    };
    
    calculateTripDetails();
  }, [vehicle, driver, departureLocation, destinationLocation, departureDate, passengerCount]);
  
  const handleContinue = () => {
    onContinue(tripDetails);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Détails du trajet</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-4">Récapitulatif</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-hermes-green mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Départ</p>
                  <p className="font-medium">{departureLocation}</p>
                  <p className="text-sm">{format(departureDate, "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-hermes-green mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="font-medium">{destinationLocation}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Voyageurs</p>
                  <p>{passengerCount} personnes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-4">Sélections</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Bus className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Véhicule</p>
                  <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                  <p className="text-sm">{vehicle.capacity} places</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Chauffeur</p>
                  <p className="font-medium">{driver.prenom} {driver.nom}</p>
                  {driver.note_chauffeur && (
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs ml-1">{driver.note_chauffeur}/5</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-4">Estimation du voyage</h3>
          
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Durée estimée</p>
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Arrivée prévue</p>
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <div className="flex items-center">
                <Euro className="h-5 w-5 mr-2 text-gray-400" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Prix estimé</p>
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Durée estimée</p>
                  <p className="font-medium">{tripDetails.duration}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Arrivée prévue</p>
                  <p className="font-medium">
                    {format(departureDate, "d MMMM", { locale: fr })} à {tripDetails.arrivalTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Euro className="h-5 w-5 mr-2 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Prix total</p>
                  <p className="font-bold text-xl">{tripDetails.price} €</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between pt-4">
        <Button 
          onClick={onBack}
          variant="outline"
        >
          Retour
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={loading}
          className="bg-hermes-green hover:bg-hermes-green/80 text-black"
        >
          Procéder au paiement
        </Button>
      </div>
    </div>
  );
}
