
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bus } from "lucide-react";
import { Vehicle } from "@/types/vehicle";

interface VehicleSelectionProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicle: Vehicle) => void;
  selectedVehicleId: string | null;
  onContinue: () => void;
}

export function VehicleSelection({ 
  vehicles, 
  onVehicleSelect, 
  selectedVehicleId,
  onContinue
}: VehicleSelectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Sélectionnez un véhicule</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => (
          <Card 
            key={vehicle.id} 
            className={`cursor-pointer transition-all ${selectedVehicleId === vehicle.id ? 'ring-2 ring-hermes-green shadow-md' : ''}`}
            onClick={() => onVehicleSelect(vehicle)}
          >
            <CardContent className="p-4">
              <div className="flex items-center">
                {vehicle.photo_url ? (
                  <img 
                    src={vehicle.photo_url} 
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-20 w-28 object-cover mr-4 rounded"
                  />
                ) : (
                  <div className="h-20 w-28 bg-gray-200 mr-4 rounded flex items-center justify-center">
                    <Bus className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{vehicle.brand} {vehicle.model}</h3>
                  <p className="text-sm text-gray-500">{vehicle.type}</p>
                  <p className="text-sm">Capacité: {vehicle.capacity} passagers</p>
                  <p className="text-sm text-gray-500">Imm.: {vehicle.registration}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button 
          onClick={onContinue}
          disabled={!selectedVehicleId}
          className="bg-hermes-green hover:bg-hermes-green/80 text-black"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
