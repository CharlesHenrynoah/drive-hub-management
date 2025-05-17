
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddVehicleForm } from "./AddVehicleForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface VehiclesAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VehiclesAddModal({ isOpen, onClose, onSuccess }: VehiclesAddModalProps) {
  const [modalReady, setModalReady] = useState(false);

  // Ce useEffect permet d'assurer que le formulaire est prêt avant d'être rendu
  useEffect(() => {
    if (isOpen) {
      // Petit délai pour s'assurer que le dialogue est complètement ouvert
      const timer = setTimeout(() => {
        setModalReady(true);
      }, 100);
      return () => {
        clearTimeout(timer);
        setModalReady(false);
      };
    }
    return undefined;
  }, [isOpen]);

  const handleSuccess = () => {
    toast.success("Véhicule ajouté avec succès");
    onSuccess();
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Si le dialogue se ferme, attendez un peu avant d'appeler onClose
      // pour éviter des problèmes de rendu
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Ajouter un véhicule</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire pour ajouter un nouveau véhicule à la flotte
          </DialogDescription>
        </DialogHeader>
        {(isOpen && modalReady) && (
          <AddVehicleForm 
            onSuccess={handleSuccess} 
            isOpen={isOpen} 
            onOpenChange={onClose} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
