
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, Phone, User, Map, Building, Clock, Calendar, Truck, CheckCircle2, XCircle, AlertCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Mission } from "@/types/mission";

interface MissionDetailModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function MissionDetailModal({
  mission,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}: MissionDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete && onDelete();
    } else {
      setConfirmDelete(true);
    }
  };
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Badge className="bg-blue-500 text-white">En cours</Badge>;
      case 'terminee':
        return <Badge className="bg-green-500 text-white">Terminée</Badge>;
      case 'annulee':
        return <Badge className="bg-red-500 text-white">Annulée</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };
  
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'terminee':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'annulee':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Non spécifiée";
    return format(new Date(date), "PPP 'à' HH'h'mm", { locale: fr });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      setConfirmDelete(false);
      onClose();
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{mission.title}</DialogTitle>
            <div className="flex items-center gap-2">
              {renderStatusIcon(mission.status)}
              {renderStatusBadge(mission.status)}
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Date et horaires */}
          <div className="flex items-start gap-3 border-b pb-3">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Date de départ</h3>
              <p className="text-sm text-gray-600">{formatDate(mission.date)}</p>
              
              {mission.arrival_date && (
                <div className="mt-2">
                  <h3 className="font-medium">Date d'arrivée prévue</h3>
                  <p className="text-sm text-gray-600">{formatDate(mission.arrival_date)}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Trajet */}
          <div className="flex items-start gap-3 border-b pb-3">
            <Map className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Trajet</h3>
              <p className="text-sm text-gray-600">
                <strong>Départ:</strong> {mission.start_location || "Non spécifié"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Destination:</strong> {mission.end_location || "Non spécifiée"}
              </p>
            </div>
          </div>
          
          {/* Informations client */}
          {(mission.client || mission.client_email || mission.client_phone) && (
            <div className="flex items-start gap-3 border-b pb-3">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Client</h3>
                {mission.client && <p className="text-sm text-gray-600">{mission.client}</p>}
                
                <div className="mt-1 space-y-1">
                  {mission.client_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${mission.client_email}`} className="hover:underline">{mission.client_email}</a>
                    </div>
                  )}
                  
                  {mission.client_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${mission.client_phone}`} className="hover:underline">{mission.client_phone}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Passagers */}
          {mission.passengers !== undefined && mission.passengers > 0 && (
            <div className="flex items-start gap-3 border-b pb-3">
              <Users className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Passagers</h3>
                <p className="text-sm text-gray-600">{mission.passengers} passager(s)</p>
              </div>
            </div>
          )}
          
          {/* Ressources */}
          <div className="flex items-start gap-3 border-b pb-3">
            <Building className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Entreprise</h3>
              <p className="text-sm text-gray-600">{mission.company || "Non spécifiée"}</p>
              
              <div className="mt-2">
                <h3 className="font-medium">Chauffeur</h3>
                <p className="text-sm text-gray-600">{mission.driver || "Non spécifié"}</p>
              </div>
              
              <div className="mt-2">
                <h3 className="font-medium">Véhicule</h3>
                <p className="text-sm text-gray-600">{mission.vehicle || "Non spécifié"}</p>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {(mission.description || mission.additional_details) && (
            <div className="flex items-start gap-3">
              <div>
                {mission.description && (
                  <div className="mb-3">
                    <h3 className="font-medium">Description</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{mission.description}</p>
                  </div>
                )}
                
                {mission.additional_details && (
                  <div>
                    <h3 className="font-medium">Détails supplémentaires</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{mission.additional_details}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          {onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              {confirmDelete ? "Confirmer la suppression" : "Supprimer"}
            </Button>
          )}
          
          <div className="flex gap-2 justify-end">
            {onEdit && (
              <Button onClick={onEdit} variant="outline">
                Modifier
              </Button>
            )}
            
            <Button onClick={onClose}>
              Fermer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
