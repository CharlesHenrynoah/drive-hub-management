import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Calendar, CreditCardIcon, Lock } from "lucide-react";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentFormProps {
  price: number;
  vehicle: Vehicle;
  driver: Driver;
  departureLocation: string;
  destinationLocation: string;
  departureDate: Date;
  arrivalTime: string;
  passengerCount: string;
  additionalInfo: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function PaymentForm({
  price,
  vehicle,
  driver,
  departureLocation,
  destinationLocation,
  departureDate,
  arrivalTime,
  passengerCount,
  additionalInfo,
  onBack,
  onSuccess
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: ""
  });
  
  const handleInputChange = (field: string, value: string) => {
    // Formatting and validation
    let formattedValue = value;
    
    if (field === "cardNumber") {
      // Keep only digits and format with spaces
      formattedValue = value.replace(/\D/g, "").slice(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    }
    else if (field === "expiryDate") {
      // Keep only digits and format as MM/YY
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2);
      }
    }
    else if (field === "cvv") {
      // Keep only digits and limit to 3-4 characters
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }
    
    setCardDetails({
      ...cardDetails,
      [field]: formattedValue
    });
  };
  
  const isFormValid = () => {
    return (
      cardDetails.cardNumber.replace(/\s/g, "").length >= 15 &&
      cardDetails.cardHolder.trim().length > 3 &&
      cardDetails.expiryDate.length === 5 &&
      cardDetails.cvv.length >= 3
    );
  };
  
  const calculateArrivalDate = () => {
    const [hours, minutes] = arrivalTime.split('h').map(part => parseInt(part, 10));
    const arrivalDate = new Date(departureDate);
    arrivalDate.setHours(hours);
    arrivalDate.setMinutes(minutes || 0);
    return arrivalDate;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error("Veuillez remplir tous les champs correctement");
      return;
    }
    
    setLoading(true);
    
    try {
      // This is a simulated payment - in a real app you would integrate with a payment provider
      // For demo purposes, we'll just create the mission directly
      
      const missionTitle = `Transport de ${departureLocation} à ${destinationLocation}`;
      const arrivalDate = calculateArrivalDate();

      // Create mission via Edge Function
      const response = await fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/create-mission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
        },
        body: JSON.stringify({
          title: missionTitle,
          date: departureDate.toISOString(),
          arrival_date: arrivalDate.toISOString(),
          driver_id: driver.id,
          vehicle_id: vehicle.id,
          start_location: departureLocation,
          end_location: destinationLocation,
          passengers: parseInt(passengerCount, 10),
          additional_details: additionalInfo,
          company_id: vehicle.company_id,
          status: 'en_cours'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la création de la mission");
      }
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Paiement effectué et mission créée avec succès");
      onSuccess();
      
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      toast.error("Une erreur est survenue lors du paiement");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Paiement</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="cardHolder">Titulaire de la carte</Label>
                  <Input
                    id="cardHolder"
                    placeholder="Nom et prénom"
                    value={cardDetails.cardHolder}
                    onChange={(e) => handleInputChange("cardHolder", e.target.value)}
                    disabled={loading}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      disabled={loading}
                      className="mt-1 pl-9"
                    />
                    <CreditCard className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Date d'expiration</Label>
                    <div className="relative">
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        disabled={loading}
                        className="mt-1 pl-9"
                      />
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <div className="relative">
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => handleInputChange("cvv", e.target.value)}
                        disabled={loading}
                        className="mt-1 pl-9"
                        type="password"
                      />
                      <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex flex-col space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Lock className="h-4 w-4 mr-1" />
                    <span>Paiement sécurisé via SSL</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <CreditCardIcon className="h-6 w-6 text-blue-600" />
                    <CreditCardIcon className="h-6 w-6 text-red-600" />
                    <CreditCardIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-4">Récapitulatif</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transport</span>
                  <span>{price} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Frais de service</span>
                  <span>0 €</span>
                </div>
                <div className="border-t border-gray-200 my-3"></div>
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>{price} €</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 space-y-3">
            <Button 
              onClick={onBack}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Retour
            </Button>
            
            <Button 
              onClick={handleSubmit}
              className="w-full bg-hermes-green hover:bg-hermes-green/80 text-black"
              disabled={loading || !isFormValid()}
            >
              {loading ? "Traitement en cours..." : `Payer ${price} €`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
