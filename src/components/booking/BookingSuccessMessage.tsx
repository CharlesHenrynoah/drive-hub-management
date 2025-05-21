
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BookingSuccessMessageProps {
  onClose: () => void;
}

export function BookingSuccessMessage({ onClose }: BookingSuccessMessageProps) {
  const navigate = useNavigate();
  
  const viewCalendar = () => {
    navigate("/missions");
  };
  
  return (
    <div className="text-center space-y-6 py-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-hermes-green" />
      </div>
      
      <h2 className="text-2xl font-bold">Réservation confirmée !</h2>
      
      <p className="text-gray-600 max-w-md mx-auto">
        Votre réservation a été confirmée et votre mission a été créée. Vous pouvez consulter les détails de votre mission dans le calendrier.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button onClick={viewCalendar} className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Voir le calendrier
        </Button>
        
        <Button onClick={onClose} variant="outline">
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
