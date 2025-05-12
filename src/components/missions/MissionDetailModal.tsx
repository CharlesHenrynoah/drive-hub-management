
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, differenceInMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, MapPin, User, Truck, Building2, UserRound, Users, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mission } from "./MissionsCalendar";

interface MissionDetailModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MissionDetailModal({ mission, isOpen, onClose, onEdit, onDelete }: MissionDetailModalProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "terminee":
        return <Badge variant="default" className="bg-success text-success-foreground">Terminée</Badge>;
      case "annulee":
        return <Badge variant="default" className="bg-destructive text-destructive-foreground">Annulée</Badge>;
      default:
        return <Badge>En cours</Badge>;
    }
  };

  // Calculate trip duration in minutes
  const getTripDuration = () => {
    if (mission.arrival_date) {
      const durationMinutes = differenceInMinutes(mission.arrival_date, mission.date);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      if (hours > 0) {
        return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
      } else {
        return `${minutes}min`;
      }
    }
    return "Non définie";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex justify-between items-center">
            <span>{mission.title}</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Modifier la mission"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="text-destructive hover:bg-destructive/10" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Supprimer la mission"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-start">
            {getStatusBadge(mission.status)}
            <div className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {format(mission.date, 'EEEE d MMMM yyyy', { locale: fr })}
            </div>
          </div>
          
          <div className="grid gap-2">
            {/* Departure Time */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Départ: {format(mission.date, 'HH:mm')}</span>
            </div>
            
            {/* Arrival Time (if available) */}
            {mission.arrival_date && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Arrivée: {format(mission.arrival_date, 'HH:mm, EEEE d MMMM yyyy', { locale: fr })}</span>
              </div>
            )}

            {/* Trip Duration */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Durée: {getTripDuration()}</span>
            </div>
          </div>
          
          {mission.description && (
            <div className="bg-muted/20 p-3 rounded-md text-sm">
              {mission.description}
            </div>
          )}
          
          <div className="grid gap-3 pt-3 border-t border-border">
            {/* Client Information (if available) */}
            {mission.client && (
              <div className="flex items-start gap-2">
                <UserRound className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Client</div>
                  <div className="text-sm text-muted-foreground">{mission.client}</div>
                </div>
              </div>
            )}
            
            {/* Passengers Count (if available) */}
            {mission.passengers !== undefined && (
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Passagers</div>
                  <div className="text-sm text-muted-foreground">{mission.passengers}</div>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Chauffeur</div>
                <div className="text-sm text-muted-foreground">{mission.driver || "Non assigné"}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Truck className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Véhicule</div>
                <div className="text-sm text-muted-foreground">{mission.vehicle || "Non assigné"}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Entreprise</div>
                <div className="text-sm text-muted-foreground">{mission.company || "Non assignée"}</div>
              </div>
            </div>
            
            {mission.start_location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Départ (Point A)</div>
                  <div className="text-sm text-muted-foreground">{mission.start_location}</div>
                </div>
              </div>
            )}
            
            {mission.end_location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Arrivée (Point B)</div>
                  <div className="text-sm text-muted-foreground">{mission.end_location}</div>
                </div>
              </div>
            )}
            
            {/* Additional Details (if available) */}
            {mission.additional_details && (
              <div className="flex items-start gap-2">
                <div className="bg-muted/20 p-3 rounded-md text-sm w-full mt-2">
                  <div className="text-sm font-medium mb-1">Détails supplémentaires</div>
                  {mission.additional_details}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
