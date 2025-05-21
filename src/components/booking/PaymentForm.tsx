
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Driver } from "@/types/driver";
import { Vehicle } from "@/types/vehicle";

interface PaymentFormProps {
  onPaymentComplete: () => void;
  onBack: () => void;
  driver: Driver;
  vehicle: Vehicle;
  departureLocation: string;
  destinationLocation: string;
  departureDate: Date;
  departureTime: string;
  passengerCount: string;
  estimatedDuration: string;
  estimatedPrice: number;
  contactInfo: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
}

export function PaymentForm({
  onPaymentComplete,
  onBack,
  driver,
  vehicle,
  departureLocation,
  destinationLocation,
  departureDate,
  departureTime,
  passengerCount,
  estimatedDuration,
  estimatedPrice,
  contactInfo
}: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    
    // Format the card number with spaces
    let formattedValue = "";
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += " ";
      }
      formattedValue += value[i];
    }
    
    setCardNumber(formattedValue);
  };
  
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    
    // Format the expiry date as MM/YY
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    
    setCardExpiry(value);
  };
  
  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCardCVC(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation - in a real app would have more robust validation
    if (cardNumber.trim().replace(/\s/g, "").length !== 16) {
      toast.error("Veuillez entrer un numéro de carte valide");
      return;
    }
    
    if (cardName.trim() === "") {
      toast.error("Veuillez entrer le nom sur la carte");
      return;
    }
    
    if (cardExpiry.trim().length !== 5) {
      toast.error("Veuillez entrer une date d'expiration valide");
      return;
    }
    
    if (cardCVC.trim().length !== 3) {
      toast.error("Veuillez entrer un code CVC valide");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simuler un délai de traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Créer la mission
      const combinedDateTime = new Date(departureDate);
      const [hours, minutes] = departureTime.split(':').map(Number);
      combinedDateTime.setHours(hours, minutes, 0, 0);
      const formattedDate = combinedDateTime.toISOString();
      
      // Estimer l'heure d'arrivée en fonction de la durée
      const [durationHours, durationMinutes] = estimatedDuration.split("h").map(part => parseInt(part.trim()));
      const arrivalDate = new Date(combinedDateTime);
      arrivalDate.setHours(arrivalDate.getHours() + durationHours);
      if (durationMinutes) {
        arrivalDate.setMinutes(arrivalDate.getMinutes() + durationMinutes);
      }
      
      // Déterminer le statut initial de la mission
      // Si la date de départ est dans le futur, statut "confirmé", sinon "en_cours"
      const now = new Date();
      const initialStatus = combinedDateTime > now ? 'confirmé' : 'en_cours';
      
      const { error } = await supabase
        .from('missions')
        .insert({
          title: `Trajet ${departureLocation} > ${destinationLocation}`,
          description: `Réservation par ${contactInfo.name} (${contactInfo.company})`,
          date: formattedDate,
          arrival_date: arrivalDate.toISOString(),
          driver_id: driver.id,
          vehicle_id: vehicle.id,
          passengers: parseInt(passengerCount),
          start_location: departureLocation,
          end_location: destinationLocation,
          client: contactInfo.name, // Utiliser le nom du contact
          client_email: contactInfo.email, // Utiliser l'email du contact
          client_phone: contactInfo.phone, // Utiliser le téléphone du contact
          additional_details: `Société: ${contactInfo.company}`, // Nom de l'entreprise
          status: initialStatus, // Statut initial basé sur la date de départ
          company_id: vehicle.company_id
        });
      
      if (error) {
        console.error("Erreur lors de la création de la mission:", error);
        toast.error("Une erreur est survenue lors de la création de votre réservation");
        setIsProcessing(false);
        return;
      }
      
      toast.success("Paiement accepté et réservation confirmée !");
      onPaymentComplete();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors du traitement du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Paiement</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Récapitulatif de la commande</h3>
        <p className="text-sm text-gray-600">
          Trajet {departureLocation} → {destinationLocation}<br />
          {format(departureDate, "d MMMM yyyy", { locale: fr })} à {departureTime}<br />
          {passengerCount} passagers<br />
          Contact: {contactInfo.name} ({contactInfo.email})<br />
          <span className="font-medium">Montant total: {estimatedPrice.toFixed(2)} €</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="cardNumber">Numéro de carte</Label>
                <Input 
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cardName">Nom sur la carte</Label>
                <Input 
                  id="cardName"
                  placeholder="Jean Dupont"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardExpiry">Date d'expiration</Label>
                  <Input 
                    id="cardExpiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cardCVC">CVV</Label>
                  <Input 
                    id="cardCVC"
                    placeholder="123"
                    value={cardCVC}
                    onChange={handleCVCChange}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between pt-4">
          <Button 
            onClick={onBack}
            variant="outline"
            type="button"
          >
            Retour
          </Button>
          <Button 
            type="submit"
            disabled={isProcessing}
            className="bg-hermes-green hover:bg-hermes-green/80 text-black"
          >
            {isProcessing ? "Traitement en cours..." : `Payer ${estimatedPrice.toFixed(2)} €`}
          </Button>
        </div>
      </form>
    </div>
  );
}
