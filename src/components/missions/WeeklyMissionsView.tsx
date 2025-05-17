
import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, isWithinInterval, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Mission } from '@/types/mission';

interface WeeklyMissionsViewProps {
  missions: Mission[];
  onMissionSelected?: (mission: Mission) => void;
}

export function WeeklyMissionsView({ missions, onMissionSelected }: WeeklyMissionsViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get the start of the week (Monday)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Create array of dates for the current week
  const days = [...Array(7)].map((_, i) => addDays(startDate, i));
  
  // Navigate to previous/next week
  const prevWeek = () => setCurrentDate(addDays(startDate, -7));
  const nextWeek = () => setCurrentDate(addDays(startDate, 7));
  const today = () => setCurrentDate(new Date());
  
  // Get missions for a specific day
  const getDayMissions = (day: Date) => {
    return missions.filter(mission => {
      // Check if mission is on this day
      if (isSameDay(new Date(mission.date), day)) return true;
      
      // Check if mission spans across multiple days and includes this day
      if (mission.arrival_date) {
        return isWithinInterval(day, {
          start: new Date(mission.date),
          end: new Date(mission.arrival_date)
        });
      }
      
      return false;
    });
  };

  // Format time from date
  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    return format(new Date(date), 'HH:mm');
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    if (status === 'terminee') return 'bg-green-100 border-green-500 text-green-700';
    if (status === 'annulee') return 'bg-red-100 border-red-500 text-red-700';
    return 'bg-blue-100 border-blue-500 text-blue-700';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="text-xl font-semibold">
          {format(startDate, 'MMMM yyyy', { locale: fr })}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={today}>Aujourd'hui</Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Week view */}
      <div className="grid grid-cols-7 border-b">
        {days.map((day) => (
          <div key={day.toString()} className="p-2 text-center font-semibold border-r last:border-r-0">
            <div className="text-xs text-gray-500 uppercase">
              {format(day, 'EEEE', { locale: fr })}
            </div>
            <div className={`text-lg ${isSameDay(day, new Date()) ? 'bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Missions for each day */}
      <div className="grid grid-cols-7 h-[500px]">
        {days.map((day) => {
          const dayMissions = getDayMissions(day);
          return (
            <div key={day.toString()} className={`border-r last:border-r-0 p-2 overflow-y-auto ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}>
              {dayMissions.length > 0 ? (
                dayMissions.map((mission) => (
                  <div 
                    key={mission.id} 
                    className={`mb-2 p-2 border-l-4 rounded cursor-pointer shadow-sm ${getStatusColor(mission.status)}`}
                    onClick={() => onMissionSelected?.(mission)}
                  >
                    <div className="font-medium">{mission.title}</div>
                    <div className="text-xs text-gray-600">{formatTime(mission.date)} {mission.arrival_date ? `- ${formatTime(mission.arrival_date)}` : ''}</div>
                    {mission.driver && <div className="text-xs">{mission.driver}</div>}
                    {mission.company && <div className="text-xs text-gray-500">{mission.company}</div>}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 text-sm">Pas de mission</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
