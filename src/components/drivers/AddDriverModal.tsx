
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AddDriverForm } from "./AddDriverForm";

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddDriverModal({ isOpen, onClose, onSuccess }: AddDriverModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un chauffeur</DialogTitle>
        </DialogHeader>
        
        <AddDriverForm 
          onSuccess={() => {
            onSuccess();
            onClose();
          }} 
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
