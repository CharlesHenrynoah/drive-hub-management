
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Vehicle } from "./VehiclesManagement";

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  companyName?: string;
}

export function VehicleDetailModal({ vehicle, companyName = "N/A" }: VehicleDetailModalProps) {
  // Helper pour déterminer la classe de couleur selon le score écologique
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-info";
    return "bg-warning";
  };

  // Calculate note moyenne client display value
  const clientNote = ((vehicle.Note_Moyenne_Client || 85) / 20).toFixed(1);

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={vehicle.photo_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop"} 
              alt={`${vehicle.brand} ${vehicle.model}`} 
            />
            <AvatarFallback>{vehicle.brand.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle className="text-xl">
              {vehicle.brand} {vehicle.model}
            </DialogTitle>
            <DialogDescription>
              {vehicle.id.substring(0, 8)}... - {vehicle.registration}
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
                      ${vehicle.status === "Disponible" ? "bg-success text-success-foreground" : ""}
                      ${vehicle.status === "En maintenance" ? "bg-warning text-warning-foreground" : ""}
                    `}
                  >
                    {vehicle.status}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Type</dt>
                <dd>{vehicle.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Carburant</dt>
                <dd>{vehicle.fuel_type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Capacité</dt>
                <dd>{vehicle.capacity} passagers</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Entreprise</dt>
                <dd>{companyName}</dd>
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
                  <span>{vehicle.ecological_score}/100</span>
                </dt>
                <dd>
                  <Progress
                    value={vehicle.ecological_score}
                    max={100}
                    className={`h-2 ${getScoreColorClass(vehicle.ecological_score)}`}
                  />
                </dd>
              </div>
              <div>
                <dt className="flex justify-between mb-1">
                  <span>Note moyenne client</span>
                  <span>{clientNote}/5</span>
                </dt>
                <dd>
                  <Progress
                    value={vehicle.Note_Moyenne_Client || 85}
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
                <dd>{vehicle.mileage?.toLocaleString() || "0"} km</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Dernier entretien</dt>
                <dd>{new Date(vehicle.last_maintenance || Date.now()).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Prochain entretien</dt>
                <dd>
                  {new Date(new Date(vehicle.last_maintenance || Date.now()).setMonth(new Date(vehicle.last_maintenance || Date.now()).getMonth() + 6)).toLocaleDateString()}
                </dd>
              </div>
              
              {vehicle.type === "Mini Bus" || vehicle.type === "Bus" ? (
                <>
                  <div className="pt-3">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">Informations spécifiques {vehicle.type}</h4>
                    <div className="flex justify-between">
                      <dt className="font-medium">Places assises</dt>
                      <dd>{Math.floor(vehicle.capacity * 0.9)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Places debout</dt>
                      <dd>{Math.floor(vehicle.capacity * 0.1)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Accessibilité PMR</dt>
                      <dd>{vehicle.type === "Bus" ? "Oui" : "Non"}</dd>
                    </div>
                  </div>
                </>
              ) : null}
            </dl>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
