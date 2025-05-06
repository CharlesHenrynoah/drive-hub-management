
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { MissionDetailModal } from "./MissionDetailModal";
import { CalendarNav } from "./CalendarNav";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";

// Temporary mission type until we create a proper database schema
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
  client?: string;
  arrivalDate?: Date;
  passengers?: number;
  additionalDetails?: string;
}

// Sample data (to be replaced with actual data from Supabase)
const sampleMissions: Mission[] = [
  {
    id: "1",
    title: "Transport client VIP",
    date: new Date(2025, 4, 10, 9, 30),
    driver: "Jean Dupont",
    vehicle: "Tesla Model S",
    company: "DriveHub",
    status: "pending",
    description: "Transport d'un client VIP depuis l'aéroport jusqu'à l'hôtel.",
    startLocation: "Aéroport CDG",
    endLocation: "Hôtel Le Meurice",
    client: "Richard Martin",
    arrivalDate: new Date(2025, 4, 10, 11, 0),
    passengers: 1,
    additionalDetails: "Client VIP - directeur de Total Énergies. Prévoir bouteille d'eau et journaux du jour."
  },
  {
    id: "2",
    title: "Livraison urgente",
    date: new Date(2025, 4, 15, 14, 0),
    driver: "Marie Lambert",
    vehicle: "Renault Kangoo",
    company: "TransCorp",
    status: "completed",
    description: "Livraison de documents confidentiels.",
    startLocation: "Siège TransCorp",
    endLocation: "Cabinet d'avocats Legrand",
    arrivalDate: new Date(2025, 4, 15, 15, 30),
    client: "TransCorp Legal"
  },
  {
    id: "3",
    title: "Transport scolaire",
    date: new Date(2025, 4, 18, 7, 45),
    driver: "Philippe Martin",
    vehicle: "Mercedes Sprinter",
    company: "EduTrans",
    status: "pending",
    description: "Transport d'élèves pour une sortie scolaire.",
    startLocation: "École Jules Ferry",
    endLocation: "Musée du Louvre",
    arrivalDate: new Date(2025, 4, 18, 9, 0),
    passengers: 22,
    client: "École Jules Ferry",
    additionalDetails: "Groupe de 20 élèves et 2 accompagnateurs. Prévoir siège enfant."
  },
  {
    id: "4",
    title: "Déménagement",
    date: new Date(2025, 4, 22, 10, 0),
    driver: "Sophie Dubois",
    vehicle: "Iveco Daily",
    company: "MoveIt",
    status: "pending",
    description: "Déménagement d'un appartement à une maison.",
    startLocation: "15 rue de la Paix, Paris",
    endLocation: "8 avenue des Champs, Neuilly",
    arrivalDate: new Date(2025, 4, 22, 17, 0),
    client: "Famille Bernard",
    passengers: 3
  },
  {
    id: "5",
    title: "Transfert matériel médical",
    date: new Date(2025, 4, 5, 8, 15),
    driver: "Lucas Bernard",
    vehicle: "Ford Transit",
    company: "MediMove",
    status: "cancelled",
    description: "Transport de matériel médical entre deux hôpitaux.",
    startLocation: "Hôpital Saint-Louis",
    endLocation: "Clinique des Lilas",
    arrivalDate: new Date(2025, 4, 5, 9, 45),
    client: "Groupe Hospitalier Est"
  }
];

export function MissionsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [missions, setMissions] = useState<Mission[]>(sampleMissions);

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  // Get the day names in French
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  
  // Calculate how many days we need to pad at the beginning for the calendar
  let startDay = getDay(startDate);
  // Convert from 0-6 (Sunday to Saturday) to 1-7 (Monday to Sunday)
  startDay = startDay === 0 ? 6 : startDay - 1;
  const paddingDays = Array.from({ length: startDay }, (_, i) => 
    addDays(startDate, -(startDay - i))
  );

  const handleMissionClick = (mission: Mission) => {
    setSelectedMission(mission);
    setIsDetailModalOpen(true);
  };

  const getMissionsForDay = (day: Date) => {
    return missions.filter(mission => 
      mission.date.getDate() === day.getDate() && 
      mission.date.getMonth() === day.getMonth() && 
      mission.date.getFullYear() === day.getFullYear()
    );
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "cancelled": return "bg-destructive text-destructive-foreground";
      default: return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy', { locale: fr })}</h2>
        </div>
        <div className="flex gap-4 items-center">
          <CalendarNav currentDate={currentDate} setCurrentDate={setCurrentDate} />
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle mission
          </Button>
        </div>
      </div>

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
            {daysInMonth.map((day) => {
              const dayMissions = getMissionsForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={day.toString()} 
                  className={`min-h-[120px] p-1 border border-muted/20 ${isToday ? 'bg-accent/20' : ''}`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="mt-1 space-y-1 max-h-[100px] overflow-y-auto">
                    {dayMissions.map((mission) => (
                      <div
                        key={mission.id}
                        onClick={() => handleMissionClick(mission)}
                        className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(mission.status)} hover:opacity-80 truncate`}
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

      {selectedMission && (
        <MissionDetailModal
          mission={selectedMission}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}
    </div>
  );
}
