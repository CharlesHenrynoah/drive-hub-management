
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { cities } from "@/components/vehicles/constants/vehicleFormConstants";

interface NewMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewMissionModal({ 
  isOpen, 
  onClose,
  onSuccess 
}: NewMissionModalProps) {
  const [selectedCity, setSelectedCity] = useState<string>("");
  
  // Formater les villes pour le composant Combobox
  const cityOptions = cities.map(city => ({
    label: city,
    value: city
  }));

  const handleSelection = (city: string) => {
    setSelectedCity(city);
    // Nous pourrions ajouter d'autres actions ici si nécessaire
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvelle mission</DialogTitle>
          <DialogDescription>
            Le formulaire de création de mission a été temporairement désactivé.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="city-selector">Lieu de départ</Label>
              <Combobox 
                items={cityOptions}
                value={selectedCity}
                onChange={handleSelection}
                placeholder="Sélectionnez une ville de départ"
                emptyMessage="Aucune ville trouvée"
                className="w-full mt-1"
              />
              {selectedCity && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Vous avez sélectionné: {selectedCity}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={onClose}
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
