
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Phone, Mail } from "lucide-react";
import { Driver } from "./DriversManagement";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DriverDetailModalProps {
  driver: Driver;
  onEdit: () => void;
  onClose: () => void;
}

interface Mission {
  id: string;
  title: string;
  date: string;
  start_location: string;
  end_location: string;
  status: string;
  driver: string | null;
  vehicle: string | null;
  vehicle_id: string;
}

export function DriverDetailModal({ driver, onEdit, onClose }: DriverDetailModalProps) {
  const [futureMissions, setFutureMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFutureMissions = async () => {
      if (!driver.id) return;
      
      setIsLoading(true);
      try {
        const today = new Date().toISOString();
        const { data, error } = await supabase
          .from('missions')
          .select(`
            id, 
            title, 
            date, 
            start_location, 
            end_location, 
            status,
            vehicle_id,
            vehicles:vehicle_id(brand, model)
          `)
          .eq('driver_id', driver.id)
          .gte('date', today)
          .order('date', { ascending: true });
          
        if (error) {
          console.error('Erreur lors du chargement des missions futures:', error);
          toast.error("Erreur lors du chargement des missions");
          return;
        }
        
        // Transform data to include vehicle name
        const formattedMissions = data?.map(mission => ({
          ...mission,
          driver: `${driver.prenom} ${driver.nom}`,
          vehicle: mission.vehicles ? `${mission.vehicles.brand} ${mission.vehicles.model}` : null
        })) || [];
        
        setFutureMissions(formattedMissions);
      } catch (err) {
        console.error('Erreur inattendue:', err);
        toast.error("Erreur inattendue lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFutureMissions();
  }, [driver.id, driver.nom, driver.prenom]);

  // Format mission date with time
  const formatMissionDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().substring(0, 5);
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Non défini";
    return new Date(dateString).toLocaleDateString();
  };

  // Navigate to mission detail
  const handleMissionClick = (mission: Mission) => {
    onClose();
    navigate('/missions', { state: { selectedMissionId: mission.id } });
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={driver.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"} 
                alt={`${driver.prenom} ${driver.nom}`} 
              />
              <AvatarFallback>{driver.prenom?.charAt(0)}{driver.nom?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">
                {driver.prenom} {driver.nom}
              </DialogTitle>
              <DialogDescription>
                {driver.id_chauffeur} - {driver.disponible ? "Disponible" : "Indisponible"}
              </DialogDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit} className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
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
                    className={driver.disponible ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}
                  >
                    {driver.disponible ? "Disponible" : "Indisponible"}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Note</dt>
                <dd>{driver.note_chauffeur}/10</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Date de début d'activité</dt>
                <dd>{formatDate(driver.date_debut_activite)}</dd>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{driver.telephone || "Non défini"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{driver.email || "Non défini"}</span>
              </div>
              {driver.ville && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.ville}</span>
                </div>
              )}
            </dl>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>
            <Separator className="my-2" />
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Pièce d'identité</dt>
                <dd>{driver.piece_identite ? "✓" : "✗"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Certificat médical</dt>
                <dd>{driver.certificat_medical ? "✓" : "✗"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Justificatif de domicile</dt>
                <dd>{driver.justificatif_domicile ? "✓" : "✗"}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Missions futures</h3>
            <Separator className="my-2" />
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <p className="text-muted-foreground">Chargement des missions...</p>
              </div>
            ) : futureMissions.length > 0 ? (
              <ul className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {futureMissions.map((mission) => (
                  <li 
                    key={mission.id} 
                    className="flex flex-col px-3 py-2 bg-secondary/50 rounded-md text-sm hover:bg-secondary cursor-pointer transition-colors"
                    onClick={() => handleMissionClick(mission)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{mission.title}</span>
                      <Badge variant="outline" className={mission.status === 'en_cours' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                        {mission.status === 'en_cours' ? 'En cours' : 'Planifiée'}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {formatMissionDate(mission.date)}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {mission.start_location} → {mission.end_location}
                    </div>
                    {mission.vehicle && (
                      <div className="text-xs mt-1 text-muted-foreground">
                        Véhicule: {mission.vehicle}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-3">Aucune mission planifiée</p>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
