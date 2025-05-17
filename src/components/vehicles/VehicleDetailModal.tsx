
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/vehicle";

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  companyName?: string;
  onEdit: () => void;
  onClose: () => void;
}

export function VehicleDetailModal({ vehicle, companyName, onEdit, onClose }: VehicleDetailModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Détails du véhicule</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {vehicle.photo_url && (
            <div className="col-span-2 flex justify-center">
              <img 
                src={vehicle.photo_url} 
                alt={`${vehicle.brand} ${vehicle.model}`} 
                className="max-h-[200px] object-contain rounded-md"
              />
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Marque</p>
            <p className="font-medium">{vehicle.brand}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Modèle</p>
            <p className="font-medium">{vehicle.model}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <p className="font-medium">{vehicle.type}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Capacité</p>
            <p className="font-medium">{vehicle.capacity} passagers</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Immatriculation</p>
            <p className="font-medium">{vehicle.registration}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Année</p>
            <p className="font-medium">{vehicle.year || "Non spécifié"}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Type de carburant</p>
            <p className="font-medium">{vehicle.fuel_type}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Kilométrage</p>
            <p className="font-medium">{vehicle.mileage} km</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Dernière maintenance</p>
            <p className="font-medium">{vehicle.last_maintenance ? new Date(vehicle.last_maintenance).toLocaleDateString() : "Non spécifié"}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Statut</p>
            <p className="font-medium">{vehicle.status}</p>
          </div>
          
          {vehicle.location && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Localisation</p>
              <p className="font-medium">{vehicle.location}</p>
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Entreprise</p>
            <p className="font-medium">{companyName}</p>
          </div>
          
          {vehicle.ecological_score && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Score écologique</p>
              <p className="font-medium">{vehicle.ecological_score}/100</p>
            </div>
          )}
          
          <div className="col-span-2 flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={onEdit}>
              Modifier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
