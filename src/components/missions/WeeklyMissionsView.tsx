
import { useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Mission } from "./MissionsCalendar";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WeeklyMissionsViewProps {
  missions: Mission[];
  isLoading: boolean;
  onMissionClick: (mission: Mission) => void;
}

export function WeeklyMissionsView({ missions, isLoading, onMissionClick }: WeeklyMissionsViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Obtenir le début et la fin de la semaine
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Commencer par lundi (1)
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigation entre les semaines
  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filtrer les missions pour un jour donné
  const getMissionsForDay = (day: Date) => {
    return missions.filter(mission => 
      isSameDay(mission.date, day)
    );
  };

  // Fonction pour obtenir la couleur selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "terminee": return "bg-success text-success-foreground";
      case "annulee": return "bg-destructive text-destructive-foreground";
      default: return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className="space-y-4 w-full overflow-x-hidden">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-xl font-semibold">
            {format(weekStart, 'd', { locale: fr })} - {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-2 text-lg">Chargement des missions...</span>
        </div>
      ) : (
        <Card className="w-full overflow-hidden">
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="grid grid-cols-7 min-w-max">
                {/* En-têtes des jours */}
                {daysInWeek.map((day, index) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div 
                      key={`header-${index}`}
                      className={`p-2 border-b text-center font-medium ${isToday ? 'bg-accent text-accent-foreground' : ''}`}
                    >
                      <div className="truncate">{format(day, 'EEEE', { locale: fr })}</div>
                      <div className="text-sm truncate">{format(day, 'd MMMM', { locale: fr })}</div>
                    </div>
                  );
                })}
                
                {/* Conteneurs des missions pour chaque jour */}
                {daysInWeek.map((day, index) => {
                  const dayMissions = getMissionsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div 
                      key={`day-${index}`}
                      className={`min-h-[300px] border border-muted/20 p-2 ${isToday ? 'bg-accent/20' : ''}`}
                    >
                      <div className="space-y-2 max-h-[280px] overflow-y-auto">
                        {dayMissions.length === 0 ? (
                          <div className="text-sm text-muted-foreground h-full flex items-center justify-center">
                            Pas de mission
                          </div>
                        ) : (
                          dayMissions.map(mission => (
                            <div
                              key={mission.id}
                              onClick={() => onMissionClick(mission)}
                              className={`p-2 rounded cursor-pointer ${getStatusColor(mission.status)} hover:opacity-90`}
                            >
                              <div className="font-medium">{format(mission.date, 'HH:mm')}</div>
                              <div className="truncate">{mission.title}</div>
                              <div className="text-xs truncate">
                                {mission.driver || "Chauffeur non assigné"}
                              </div>
                              {mission.start_location && (
                                <div className="text-xs truncate">
                                  de: {mission.start_location}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
