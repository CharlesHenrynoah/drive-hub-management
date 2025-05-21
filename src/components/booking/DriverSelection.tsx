
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star } from "lucide-react";
import { Driver } from "@/types/driver";

interface DriverSelectionProps {
  drivers: Driver[];
  onDriverSelect: (driver: Driver) => void;
  selectedDriverId: string | null;
  onContinue: () => void;
  onBack: () => void;
}

export function DriverSelection({
  drivers,
  onDriverSelect,
  selectedDriverId,
  onContinue,
  onBack
}: DriverSelectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Sélectionnez un chauffeur</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drivers.map((driver) => (
          <Card 
            key={driver.id} 
            className={`cursor-pointer transition-all ${selectedDriverId === driver.id ? 'ring-2 ring-hermes-green shadow-md' : ''}`}
            onClick={() => onDriverSelect(driver)}
          >
            <CardContent className="p-4">
              <div className="flex items-center">
                {driver.photo ? (
                  <img 
                    src={driver.photo} 
                    alt={`${driver.prenom} ${driver.nom}`}
                    className="h-16 w-16 object-cover rounded-full mr-4"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{driver.prenom} {driver.nom}</h3>
                  <div className="flex items-center text-sm text-yellow-500 mt-1">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span>{driver.note_chauffeur || "N/A"}/5</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {driver.ville || "Disponible"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          onClick={onBack}
          variant="outline"
        >
          Retour
        </Button>
        <Button 
          onClick={onContinue}
          disabled={!selectedDriverId}
          className="bg-hermes-green hover:bg-hermes-green/80 text-black"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
