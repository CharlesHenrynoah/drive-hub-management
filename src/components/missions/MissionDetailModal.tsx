
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, MapPin, User, Truck, Building, Users, FileText, AlertCircle } from "lucide-react";
import { Mission } from "@/types/mission";

interface MissionDetailModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MissionDetailModal({ mission, isOpen, onClose, onEdit, onDelete }: MissionDetailModalProps) {
  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(new Date(date), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  // Status color and label
  const getStatusColor = (status: string) => {
    switch (status) {
      case "terminee": return "bg-green-100 text-green-800 border-green-500";
      case "annulee": return "bg-red-100 text-red-800 border-red-500";
      default: return "bg-blue-100 text-blue-800 border-blue-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "terminee": return "Terminée";
      case "annulee": return "Annulée";
      default: return "En cours";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{mission.title}</DialogTitle>
          <DialogDescription>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mr-2 border ${getStatusColor(mission.status)}`}>
              {getStatusLabel(mission.status)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date et détails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-start space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Date de départ</p>
                  <p>{formatDate(mission.date)}</p>
                  {mission.arrival_date && (
                    <>
                      <p className="font-semibold mt-2">Date d'arrivée</p>
                      <p>{formatDate(mission.arrival_date)}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Lieux */}
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Itinéraire</p>
                  <p>
                    <span className="font-medium">Point A:</span> {mission.start_location || 'Non spécifié'}
                  </p>
                  <p>
                    <span className="font-medium">Point B:</span> {mission.end_location || 'Non spécifié'}
                  </p>
                </div>
              </div>

              {/* Passagers */}
              {mission.passengers !== undefined && mission.passengers > 0 && (
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Passagers</p>
                    <p>{mission.passengers} personne(s)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Chauffeur */}
              {mission.driver && (
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Chauffeur</p>
                    <p>{mission.driver}</p>
                  </div>
                </div>
              )}

              {/* Véhicule */}
              {mission.vehicle && (
                <div className="flex items-start space-x-3">
                  <Truck className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Véhicule</p>
                    <p>{mission.vehicle}</p>
                  </div>
                </div>
              )}

              {/* Entreprise */}
              {mission.company && (
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Entreprise</p>
                    <p>{mission.company}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Client */}
          {(mission.client || mission.client_email || mission.client_phone) && (
            <div>
              <h3 className="font-medium text-lg mb-2">Informations client</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
                {mission.client && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom</p>
                    <p>{mission.client}</p>
                  </div>
                )}
                {mission.client_email && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="truncate">{mission.client_email}</p>
                  </div>
                )}
                {mission.client_phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Téléphone</p>
                    <p>{mission.client_phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {mission.description && (
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-semibold">Description</p>
                <p className="whitespace-pre-wrap">{mission.description}</p>
              </div>
            </div>
          )}

          {/* Détails supplémentaires */}
          {mission.additional_details && (
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-semibold">Détails supplémentaires</p>
                <p className="whitespace-pre-wrap">{mission.additional_details}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onEdit}>
              Modifier
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Supprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
