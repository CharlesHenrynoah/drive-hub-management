
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface Vehicle {
  ID_Vehicule: string;
  Type_Vehicule: string;
  Capacite: number;
  Type_Carburant: string;
  Score_Ecologique: number;
  Note_Moyenne_Client: number;
  Entretien: string;
  Immatriculation: string;
  Statut: string;
  Marque: string;
  Modele: string;
  Kilometrage: number;
  Photo: string;
  ID_Entreprise: string;
}

interface VehicleDetailModalProps {
  vehicle: Vehicle;
}

export function VehicleDetailModal({ vehicle }: VehicleDetailModalProps) {
  // Map des entreprises
  const entreprises = {
    "E-001": "Ville de Paris",
    "E-002": "Académie de Lyon",
    "E-003": "Transport Express",
    "E-004": "LogiMobile",
    "E-005": "Société ABC",
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
          <Avatar className="h-16 w-16">
            <AvatarImage src={vehicle.Photo} alt={`${vehicle.Marque} ${vehicle.Modele}`} />
            <AvatarFallback>{vehicle.Marque.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle className="text-xl">
              {vehicle.Marque} {vehicle.Modele}
            </DialogTitle>
            <DialogDescription>
              {vehicle.ID_Vehicule} - {vehicle.Immatriculation}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Informations générales</h3>
            <Separator className="my-2" />
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Statut</dt>
                <dd>
                  <Badge
                    variant="outline"
                    className={`
                      ${vehicle.Statut === "Disponible" ? "bg-success text-success-foreground" : ""}
                      ${vehicle.Statut === "En maintenance" ? "bg-warning text-warning-foreground" : ""}
                    `}
                  >
                    {vehicle.Statut}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Type</dt>
                <dd>{vehicle.Type_Vehicule}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Carburant</dt>
                <dd>{vehicle.Type_Carburant}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Capacité</dt>
                <dd>{vehicle.Capacite} passagers</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Entreprise</dt>
                <dd>{entreprises[vehicle.ID_Entreprise as keyof typeof entreprises]}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Performance</h3>
            <Separator className="my-2" />
            <dl className="space-y-4">
              <div>
                <dt className="flex justify-between mb-1">
                  <span>Score écologique</span>
                  <span>{vehicle.Score_Ecologique}/100</span>
                </dt>
                <dd>
                  <Progress
                    value={vehicle.Score_Ecologique}
                    max={100}
                    className={`h-2 ${vehicle.Score_Ecologique >= 80 ? "bg-success" : vehicle.Score_Ecologique >= 60 ? "bg-info" : "bg-warning"}`}
                  />
                </dd>
              </div>
              <div>
                <dt className="flex justify-between mb-1">
                  <span>Note moyenne client</span>
                  <span>{(vehicle.Note_Moyenne_Client / 20).toFixed(1)}/5</span>
                </dt>
                <dd>
                  <Progress
                    value={vehicle.Note_Moyenne_Client}
                    max={100}
                    className="h-2 bg-primary"
                  />
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">État technique</h3>
            <Separator className="my-2" />
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Kilométrage</dt>
                <dd>{vehicle.Kilometrage.toLocaleString()} km</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Dernier entretien</dt>
                <dd>{vehicle.Entretien}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Prochain entretien</dt>
                <dd>
                  {new Date(new Date(vehicle.Entretien).setMonth(new Date(vehicle.Entretien).getMonth() + 6)).toISOString().split('T')[0]}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
