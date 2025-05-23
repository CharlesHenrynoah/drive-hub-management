
import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mission } from '@/types/mission';
import { WeeklyMissionsView } from './WeeklyMissionsView';
import { CalendarNav } from './CalendarNav';

moment.locale('fr');
const localizer = momentLocalizer(moment);

interface MissionsCalendarProps {
  displayMode?: 'month' | 'week';
  onMissionSelected?: (mission: Mission) => void;
}

export function MissionsCalendar({ displayMode = 'month', onMissionSelected }: MissionsCalendarProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          drivers:driver_id(nom, prenom),
          vehicles:vehicle_id(brand, model),
          companies:company_id(name)
        `);
        
      if (error) {
        console.error("Erreur lors du chargement des missions:", error);
        toast.error("Erreur lors du chargement des missions");
        return;
      }
      
      // Format the data
      const formattedMissions: Mission[] = data.map(mission => ({
        ...mission,
        date: new Date(mission.date),
        arrival_date: mission.arrival_date ? new Date(mission.arrival_date) : undefined,
        driver: mission.drivers ? `${mission.drivers.prenom} ${mission.drivers.nom}` : undefined,
        vehicle: mission.vehicles ? `${mission.vehicles.brand} ${mission.vehicles.model}` : undefined,
        company: mission.companies ? mission.companies.name : undefined,
        status: mission.status as "en_cours" | "terminee" | "annulee"
      }));
      
      setMissions(formattedMissions);
    } catch (error) {
      console.error("Erreur lors du chargement des missions:", error);
      toast.error("Erreur lors du chargement des missions");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Define a custom toolbar component that uses our CalendarNav
  const CustomToolbar = (toolbarProps: any) => {
    return (
      <div className="flex justify-between items-center mb-4 p-4">
        <span className="text-xl font-semibold">
          {moment(toolbarProps.date).format('YYYY')}
        </span>
        <CalendarNav 
          currentDate={toolbarProps.date} 
          setCurrentDate={(date) => toolbarProps.onNavigate('DATE', date)}
        />
      </div>
    );
  };
  
  return displayMode === 'month' ? (
    <div className="h-[700px]">
      <Calendar
        localizer={localizer}
        events={missions.map(mission => ({
          ...mission,
          start: new Date(mission.date),
          end: mission.arrival_date ? new Date(mission.arrival_date) : new Date(mission.date),
          title: mission.title
        }))}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={(event) => onMissionSelected?.(event as unknown as Mission)}
        views={['month']}
        components={{
          toolbar: CustomToolbar
        }}
        date={currentDate}
        onNavigate={setCurrentDate}
      />
    </div>
  ) : (
    <WeeklyMissionsView 
      missions={missions}
      onMissionSelected={onMissionSelected}
    />
  );
}
