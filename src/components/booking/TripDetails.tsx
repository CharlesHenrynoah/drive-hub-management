
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Driver } from "@/types/driver";
import { Vehicle } from "@/types/vehicle";
import { useMemo, useEffect, useState } from "react";
import { calculateDistance } from "@/utils/distanceCalculator";
import { addDays } from "date-fns";
import { ContactDetailsForm } from "./ContactDetailsForm";

interface TripDetailsProps {
  vehicle: Vehicle;
  driver: Driver;
  departureLocation: string;
  destinationLocation: string;
  departureDate: Date;
  departureTime: string;
  setDepartureTime: (time: string) => void;
  passengerCount: string;
  contactInfo: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  setContactInfo: (info: {
    name: string;
    company: string;
    email: string;
    phone: string;
  }) => void;
  onContinue: () => void;
  onBack: () => void;
  setEstimatedDuration: (duration: string) => void;
  setEstimatedPrice: (price: number) => void;
}

export function TripDetails({
  vehicle,
  driver,
  departureLocation,
  destinationLocation,
  departureDate,
  departureTime,
  setDepartureTime,
  passengerCount,
  contactInfo,
  setContactInfo,
  onContinue,
  onBack,
  setEstimatedDuration,
  setEstimatedPrice
}: TripDetailsProps) {
  // Calculate minimum date (24 hours from now)
  const minDate = useMemo(() => {
    const now = new Date();
    return addDays(now, 1);
  }, []);
  
  // State to store the estimated distance
  const [estimatedDistance, setEstimatedDistance] = useState<number>(0);
  
  // Fetch the distance when locations change
  useEffect(() => {
    const fetchDistance = async () => {
      try {
        const distance = await calculateDistance(departureLocation, destinationLocation);
        setEstimatedDistance(distance);
      } catch (error) {
        console.error("Failed to calculate distance:", error);
        setEstimatedDistance(0);
      }
    };
    
    if (departureLocation && destinationLocation) {
      fetchDistance();
    }
  }, [departureLocation, destinationLocation]);
  
  // Calculate duration based on distance
  const duration = useMemo(() => {
    const minutes = Math.max(Math.round(estimatedDistance), 15);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}` : ''}`;
  }, [estimatedDistance]);
  
  // Calculate estimated price: Base price + (distance × rate per km)
  const basePrice = 25; // Starting fee in EUR
  const ratePerKm = 1.5; // EUR per km
  const estimatedPrice = useMemo(() => {
    return basePrice + (estimatedDistance * ratePerKm);
  }, [estimatedDistance]);
  
  // Update parent component's state when our calculations change
  useEffect(() => {
    setEstimatedDuration(duration);
    setEstimatedPrice(estimatedPrice);
  }, [duration, estimatedPrice, setEstimatedDuration, setEstimatedPrice]);
  
  // Update departure date to be at least minDate if it's earlier
  useEffect(() => {
    // Check if departureDate is before minimum date
    if (departureDate < minDate) {
      // You could set the date to minDate here if you want to automatically adjust it
      // However, leaving it as is and displaying validation warnings is often better UX
      console.log("Warning: Selected date is earlier than the minimum allowed date.");
    }
  }, [departureDate, minDate]);
  
  const handleNextStep = () => {
    // Validate that the departure date is not before the minimum date
    if (departureDate < minDate) {
      alert("La date de départ doit être au moins 24 heures dans le futur.");
      return;
    }
    
    // Validate contact info
    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      alert("Veuillez remplir tous les champs obligatoires des coordonnées.");
      return;
    }
    
    // If validation passes, continue to next step
    onContinue();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Détails du trajet</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="departureDate">Date de départ</Label>
            <DatePicker
              date={departureDate}
              setDate={() => {}}  // Read-only in this context
              placeholder="Sélectionner une date"
              disabled={true}
              minDate={minDate}
            />
            {departureDate < minDate && (
              <p className="text-sm text-red-500 mt-1">
                La date de départ doit être au moins 24 heures dans le futur.
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="departureTime">Heure de départ</Label>
            <TimePicker 
              time={departureTime}
              setTime={setDepartureTime}
              placeholder="Sélectionner une heure"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">Véhicule sélectionné</h3>
              <p className="text-sm">
                {vehicle.brand} {vehicle.model}<br />
                Type: {vehicle.vehicle_type || vehicle.type}<br />
                Capacité: {vehicle.capacity} passagers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">Chauffeur sélectionné</h3>
              <p className="text-sm">
                {driver.prenom} {driver.nom}<br />
                Note: {driver.note_chauffeur}/5<br />
                Expérience: {new Date().getFullYear() - new Date(driver.date_debut_activite).getFullYear()} ans
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">Détails de la course</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Départ:</span>
                <span>{departureLocation}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Destination:</span>
                <span>{destinationLocation}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Distance estimée:</span>
                <span>{estimatedDistance} km</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Durée estimée:</span>
                <span>{duration}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Nombre de passagers:</span>
                <span>{passengerCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <ContactDetailsForm 
              contactInfo={contactInfo}
              setContactInfo={setContactInfo}
            />
          </CardContent>
        </Card>
        
        <Card className="bg-slate-50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Prix estimé:</h3>
              <span className="text-xl font-bold">{estimatedPrice.toFixed(2)} €</span>
            </div>
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
            onClick={handleNextStep}
          >
            Continuer
          </Button>
        </div>
      </div>
    </div>
  );
}
