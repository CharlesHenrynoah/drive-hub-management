
import { Button } from "@/components/ui/button";
import { addMonths, format, isValid, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarNavProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export function CalendarNav({ currentDate, setCurrentDate }: CalendarNavProps) {
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Ensure we have a valid date before formatting
  const formattedDate = isValid(currentDate) 
    ? format(currentDate, 'MMMM', { locale: fr })
    : 'Date invalide';

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={goToToday}>
        {formattedDate}
      </Button>
      <Button variant="outline" size="icon" onClick={goToNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
