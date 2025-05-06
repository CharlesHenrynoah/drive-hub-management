
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, MapPin, User, Truck, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mission type (same as in MissionsCalendar.tsx)
interface Mission {
  id: string;
  title: string;
  date: Date;
  driver: string;
  vehicle: string;
  company: string;
  status: "pending" | "completed" | "cancelled";
  description?: string;
  startLocation?: string;
  endLocation?: string;
}

interface MissionDetailModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
}

export function MissionDetailModal({ mission, isOpen, onClose }: MissionDetailModalProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-success text-success-foreground">Terminée</Badge>;
      case "cancelled":
        return <Badge variant="default" className="bg-destructive text-destructive-foreground">Annulée</Badge>;
      default:
        return <Badge>En attente</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{mission.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-start">
            {getStatusBadge(mission.status)}
            <div className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {format(mission.date, 'EEEE d MMMM yyyy', { locale: fr })}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(mission.date, 'HH:mm')}</span>
          </div>
          
          {mission.description && (
            <div className="bg-muted/20 p-3 rounded-md text-sm">
              {mission.description}
            </div>
          )}
          
          <div className="grid gap-3 pt-3 border-t border-border">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Chauffeur</div>
                <div className="text-sm text-muted-foreground">{mission.driver}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Truck className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Véhicule</div>
                <div className="text-sm text-muted-foreground">{mission.vehicle}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Entreprise</div>
                <div className="text-sm text-muted-foreground">{mission.company}</div>
              </div>
            </div>
            
            {mission.startLocation && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Départ</div>
                  <div className="text-sm text-muted-foreground">{mission.startLocation}</div>
                </div>
              </div>
            )}
            
            {mission.endLocation && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Arrivée</div>
                  <div className="text-sm text-muted-foreground">{mission.endLocation}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
