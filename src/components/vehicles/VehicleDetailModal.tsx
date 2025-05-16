
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit, MapPin } from "lucide-react";
import { Vehicle } from "./VehiclesManagement";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  companyName?: string;
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

export function VehicleDetailModal({ vehicle, companyName = "N/A", onEdit, onClose }: VehicleDetailModalProps) {
  const [futureMissions, setFutureMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFutureMissions = async () => {
      if (!vehicle.id) return;
      
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
            driver:driver_id(nom, prenom)
          `)
          .eq('vehicle_id', vehicle.id)
          .gte('date', today)
          .order('date', { ascending: true });
          
        if (error) {
          console.error('Erreur lors du chargement des missions futures:', error);
          toast.error("Erreur lors du chargement des missions");
          return;
        }
        
        // Transform data to include driver name
        const formattedMissions = data?.map(mission => ({
          ...mission,
          driver: mission.driver ? `${mission.driver.prenom} ${mission.driver.nom}` : null,
          vehicle: `${vehicle.brand} ${vehicle.model}`
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
  }, [vehicle.id, vehicle.brand, vehicle.model]);
  
  // Helper pour déterminer la classe de couleur selon le score écologique
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-info";
    return "bg-warning";
  };

  // Calculate note moyenne client display value
  const clientNote = ((vehicle.Note_Moyenne_Client || 85) / 20).toFixed(1);
  
  // Calculate seated and standing capacity based on the vehicle type
  const seatedCapacity = Math.floor(vehicle.capacity * 0.9);
  const standingCapacity = Math.floor(vehicle.capacity * 0.1);
  
  // Format dates for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non défini";
    return new Date(dateString).toLocaleDateString();
  };

  // Format mission date with time
  const formatMissionDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().substring(0, 5);
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
                <dt className="font-medium">Localisation</dt>
                <dd className="flex items-center">
                  {vehicle.location ? (
                    <>
                      <MapPin className="h-3 w-3 mr-1" />
                      {vehicle.location}
                    </>
                  ) : "Non définie"}
                </dd>
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
                <dd>{formatDate(vehicle.last_maintenance)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Prochain entretien</dt>
                <dd>
                  {vehicle.last_maintenance ? 
                    formatDate(new Date(new Date(vehicle.last_maintenance).setMonth(new Date(vehicle.last_maintenance).getMonth() + 6)).toISOString()) : 
                    formatDate(new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString())}
                </dd>
              </div>
              
              {vehicle.type === "Mini Bus" || vehicle.type === "Bus" ? (
                <>
                  <div className="pt-3">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">Informations spécifiques {vehicle.type}</h4>
                    <div className="flex justify-between">
                      <dt className="font-medium">Places assises</dt>
                      <dd>{seatedCapacity}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Places debout</dt>
                      <dd>{standingCapacity}</dd>
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

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Missions futures</h3>
            <Separator className="my-2" />
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <p className="text-muted-foreground">Chargement des missions...</p>
              </div>
            ) : futureMissions.length > 0 ? (
              <ul className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
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
                    {mission.driver && (
                      <div className="text-xs mt-1 text-muted-foreground">
                        Chauffeur: {mission.driver}
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
