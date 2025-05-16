import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, parseISO, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { MissionDetailModal } from "./MissionDetailModal";
import { EditMissionModal } from "./EditMissionModal";
import { CalendarNav } from "./CalendarNav";
import { CalendarIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { WeeklyMissionsView } from "./WeeklyMissionsView";

// Mission type
export interface Mission {
  id: string;
  title: string;
  date: string;
  arrival_date?: string;
  start_location?: string;
  end_location?: string;
  status: string;
  description?: string;
  driver?: string;
  vehicle?: string;
  company?: string;
  driver_id?: string;
  vehicle_id?: string;
  company_id?: string;
  client?: string;
  passengers?: number;
  client_phone?: string;
  client_email?: string;
  additional_details?: string;
}

interface MissionsCalendarProps {
  displayMode?: "month" | "week";
  onMissionSelected?: (mission: Mission) => void;
}

export function MissionsCalendar({ displayMode = "month", onMissionSelected }: MissionsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteAlertRef = useRef<HTMLButtonElement>(null);

  const startDate = displayMode === "month" 
    ? startOfMonth(currentDate)
    : startOfWeek(currentDate, { weekStartsOn: 1 });
    
  const endDate = displayMode === "month" 
    ? endOfMonth(currentDate)
    : endOfWeek(currentDate, { weekStartsOn: 1 });
    
  const daysInInterval = eachDayOfInterval({ start: startDate, end: endDate });

  // Fetch missions from Supabase
  const fetchMissions = async () => {
    try {
      // Récupérer toutes les missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select(`
          *,
          drivers:driver_id (prenom, nom),
          vehicles:vehicle_id (brand, model, registration),
          companies:company_id (name)
        `);

      if (missionsError) throw missionsError;

      // Transformer les données en objets Mission
      const missions: Mission[] = (missionsData || []).map(mission => ({
        id: mission.id,
        title: mission.title,
        date: parseISO(mission.date),
        arrival_date: mission.arrival_date ? parseISO(mission.arrival_date) : undefined,
        start_location: mission.start_location,
        end_location: mission.end_location,
        status: mission.status as "en_cours" | "terminee" | "annulee",
        description: mission.description,
        driver_id: mission.driver_id,
        driver: mission.drivers ? `${mission.drivers.prenom} ${mission.drivers.nom}` : undefined,
        vehicle_id: mission.vehicle_id,
        vehicle: mission.vehicles ? `${mission.vehicles.brand} ${mission.vehicles.model} (${mission.vehicles.registration})` : undefined,
        company_id: mission.company_id,
        company: mission.companies?.name,
        client: mission.client,
        client_email: mission.client_email,
        client_phone: mission.client_phone,
        passengers: mission.passengers,
        additional_details: mission.additional_details
      }));

      return missions;
    } catch (error: any) {
      console.error('Erreur lors du chargement des missions:', error);
      toast.error(`Erreur: ${error.message}`);
      return [];
    }
  };

  // Query for missions with TanStack Query
  const { data: missions = [], isLoading, refetch } = useQuery({
    queryKey: ['missions'],
    queryFn: fetchMissions,
  });

  const handleMissionClick = (mission: Mission) => {
    if (onMissionSelected) {
      onMissionSelected(mission);
    } else {
      setSelectedMission(mission);
      setIsDetailModalOpen(true);
    }
  };

  const handleEditMission = (mission: Mission) => {
    setMissionToEdit(mission);
    setIsEditModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleDeleteMission = (mission: Mission) => {
    setMissionToDelete(mission);
    setIsDeleteDialogOpen(true);
    setIsDetailModalOpen(false);
  };

  // Define confirmDeleteMission function before it's used
  const confirmDeleteMission = async () => {
    if (!missionToDelete) return;
    
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', missionToDelete.id);
      
      if (error) throw error;
      
      toast.success("Mission supprimée avec succès");
      refetch();
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la mission:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsDeleteDialogOpen(false);
      setMissionToDelete(null);
    }
  };

  // Si nous sommes en mode semaine, afficher le composant WeeklyMissionsView
  if (displayMode === "week") {
    return (
      <>
        <WeeklyMissionsView 
          missions={missions} 
          isLoading={isLoading} 
          onMissionClick={handleMissionClick}
        />
        
        {selectedMission && (
          <MissionDetailModal
            mission={selectedMission}
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            onEdit={() => handleEditMission(selectedMission)}
            onDelete={() => handleDeleteMission(selectedMission)}
          />
        )}

        {missionToEdit && (
          <EditMissionModal
            mission={missionToEdit}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              refetch();
              setIsEditModalOpen(false);
            }}
          />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette mission ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. La mission sera définitivement supprimée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteMission} className="bg-destructive text-destructive-foreground">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Get the day names in French
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  
  // Calculate how many days we need to pad at the beginning for the calendar
  let startDay = getDay(startDate);
  // Convert from 0-6 (Sunday to Saturday) to 1-7 (Monday to Sunday)
  startDay = startDay === 0 ? 6 : startDay - 1;
  const paddingDays = Array.from({ length: startDay }, (_, i) => 
    addDays(startDate, -(startDay - i))
  );

  const getMissionsForDay = (day: Date) => {
    return missions.filter(mission => 
      isSameDay(mission.date, day)
    );
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "terminee": return "bg-success text-success-foreground";
      case "annulee": return "bg-destructive text-destructive-foreground";
      default: return "bg-primary text-primary-foreground";
    }
  };

  // Gérer les chevauchements de missions
  const getPositionStyle = (missions: Mission[], index: number) => {
    if (missions.length <= 1) return {};
    
    // Distribuer les missions sur la hauteur
    const offset = (index / missions.length) * 100;
    const height = 80 / missions.length; // 80% de la cellule pour toutes les missions
    
    return {
      top: `${offset}%`,
      height: `${height}%`,
      position: 'relative' as const,
      zIndex: missions.length - index,
      width: '95%',
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy', { locale: fr })}</h2>
        </div>
        <CalendarNav currentDate={currentDate} setCurrentDate={setCurrentDate} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-2 text-lg">Chargement des missions...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Calendar header */}
            <div className="grid grid-cols-7 border-b">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar body */}
            <div className="grid grid-cols-7">
              {/* Padding days */}
              {paddingDays.map((day, index) => (
                <div key={`padding-${index}`} className="min-h-[120px] p-1 border border-muted/20 bg-muted/10">
                  <span className="text-sm text-muted-foreground">{format(day, 'd')}</span>
                </div>
              ))}
              
              {/* Actual days of the month */}
              {daysInInterval.map((day) => {
                const dayMissions = getMissionsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={day.toString()} 
                    className={`min-h-[120px] p-1 border border-muted/20 ${isToday ? 'bg-accent/20' : ''}`}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    
                    <div className="mt-1 space-y-1 max-h-[100px] overflow-y-auto relative">
                      {dayMissions.map((mission, index) => (
                        <div
                          key={mission.id}
                          onClick={() => handleMissionClick(mission)}
                          className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(mission.status)} hover:opacity-80 truncate`}
                          style={getPositionStyle(dayMissions, index)}
                        >
                          {format(mission.date, 'HH:mm')} - {mission.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMission && (
        <MissionDetailModal
          mission={selectedMission}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={() => handleEditMission(selectedMission)}
          onDelete={() => handleDeleteMission(selectedMission)}
        />
      )}

      {missionToEdit && (
        <EditMissionModal
          mission={missionToEdit}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsEditModalOpen(false);
          }}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette mission ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. La mission sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMission} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
