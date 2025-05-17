
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Vehicle } from "@/types/vehicle";

interface VehiclesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSuccess: () => void;
}

export function VehiclesEditModal({ isOpen, onClose, vehicle, onSuccess }: VehiclesEditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Modifier le véhicule</DialogTitle>
        </DialogHeader>
        
        {/* Add your vehicle edit form component here */}
        <div className="p-4 text-center">
          Cette fonctionnalité est en cours de développement.
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md mr-2"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => {
              onSuccess();
              onClose();
            }}
          >
            Sauvegarder
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
