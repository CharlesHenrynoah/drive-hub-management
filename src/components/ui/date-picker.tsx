
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { addDays } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormControl } from "./form"
import { Input } from "./input"
import { TimePicker } from "./time-picker"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  showTimeInput?: boolean
  time?: string
  setTime?: (time: string) => void
}

export function DatePicker({ 
  date, 
  setDate, 
  placeholder = "Sélectionner une date", 
  disabled = false,
  className,
  minDate: propMinDate,
  showTimeInput = false,
  time = "",
  setTime
}: DatePickerProps) {
  // Calculate default minimum date (1 day from now)
  const defaultMinDate = React.useMemo(() => {
    const tomorrow = addDays(new Date(), 1);
    // Set time to start of day to ensure full day comparison
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }, []);
  
  // Use provided minDate or the default minimum date
  const minDate = React.useMemo(() => {
    return propMinDate && propMinDate > defaultMinDate ? propMinDate : defaultMinDate;
  }, [propMinDate, defaultMinDate]);

  // Set default date to tomorrow if no date is provided
  React.useEffect(() => {
    if (!date && !disabled && setDate) {
      setDate(defaultMinDate);
    }
  }, [date, disabled, setDate, defaultMinDate]);

  return (
    <div className="space-y-4 w-full">
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal border border-gray-300 min-h-10 bg-white",
                !date && "text-muted-foreground",
                className
              )}
              disabled={disabled}
            >
              {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            className="pointer-events-auto"
            disabled={(date) => {
              // Disable dates before minimum date
              return date < minDate;
            }}
          />
        </PopoverContent>
      </Popover>

      {showTimeInput && setTime && (
        <div className="mt-4">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Heure de départ
            </label>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md p-2">
            <Clock className="h-4 w-4 opacity-50" />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border-0 focus:ring-0 p-0 h-8 bg-transparent"
              disabled={disabled}
              placeholder="HH:MM"
            />
          </div>
        </div>
      )}
    </div>
  );
}
