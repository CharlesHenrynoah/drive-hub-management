
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddVehicleForm } from "./AddVehicleForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VehiclesAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VehiclesAddModal({ isOpen, onClose, onSuccess }: VehiclesAddModalProps) {
  const handleSuccess = () => {
    toast.success("Véhicule ajouté avec succès");
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Ajouter un véhicule</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire pour ajouter un nouveau véhicule à la flotte
          </DialogDescription>
        </DialogHeader>
        {isOpen && <AddVehicleForm onSuccess={handleSuccess} isOpen={isOpen} onOpenChange={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
