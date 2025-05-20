
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AddDriverForm } from "./AddDriverForm";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddDriverModal({ isOpen, onClose, onSuccess }: AddDriverModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Ajouter un chauffeur</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-80px)]">
          <div className="pr-4 pb-4">
            <AddDriverForm 
              onDriverAdded={() => {
                onSuccess();
                onClose();
              }}
              buttonText="Ajouter"
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
