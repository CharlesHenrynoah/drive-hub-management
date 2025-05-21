
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface BookingSuccessMessageProps {
  onClose: () => void;
}

export function BookingSuccessMessage({ onClose }: BookingSuccessMessageProps) {
  return (
    <div className="text-center space-y-6 py-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-hermes-green" />
      </div>
      
      <h2 className="text-2xl font-bold">Réservation confirmée !</h2>
      
      <p className="text-gray-600 max-w-md mx-auto">
        Votre réservation a été confirmée et votre mission a été créée. Vous pouvez consulter les détails de votre mission dans le calendrier.
      </p>
      
      <div className="flex justify-center pt-4">
        <Button onClick={onClose} variant="outline">
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
