
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Driver } from "@/types/driver";

interface DriverDetailModalProps {
  driver: Driver;
  onEdit: () => void;
  onClose: () => void;
}

export function DriverDetailModal({ driver, onEdit, onClose }: DriverDetailModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Détails du chauffeur</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {driver.photo && (
            <div className="col-span-2 flex justify-center">
              <img 
                src={driver.photo} 
                alt={`${driver.prenom} ${driver.nom}`} 
                className="max-h-[200px] object-contain rounded-full"
              />
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">ID Chauffeur</p>
            <p className="font-medium">{driver.id_chauffeur}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Nom</p>
            <p className="font-medium">{driver.nom}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Prénom</p>
            <p className="font-medium">{driver.prenom}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="font-medium">{driver.email}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
            <p className="font-medium">{driver.telephone}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Ville</p>
            <p className="font-medium">{driver.ville || "Non spécifié"}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Date de début d'activité</p>
            <p className="font-medium">{new Date(driver.date_debut_activite).toLocaleDateString()}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Note</p>
            <p className="font-medium">{driver.note_chauffeur}/5</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Disponibilité</p>
            <p className="font-medium">{driver.disponible ? "Disponible" : "Indisponible"}</p>
          </div>
          
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
