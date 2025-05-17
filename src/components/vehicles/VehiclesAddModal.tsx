
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Ajouter un véhicule</DialogTitle>
        </DialogHeader>
        <AddVehicleForm onSuccess={handleSuccess} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
