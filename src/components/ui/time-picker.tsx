
import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormControl } from "./form"
import { ScrollArea } from "./scroll-area"
import { Input } from "./input"

interface TimePickerProps {
  time: string
  setTime: (time: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
}

export function TimePicker({ 
  time, 
  setTime, 
  placeholder = "Sélectionner une heure", 
  disabled = false,
  className,
  label 
}: TimePickerProps) {
  // Generate time options in 15-minute intervals
  const timeOptions = React.useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  }, []);

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-base mb-2 block font-medium text-gray-800">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full pl-3 text-left font-normal border border-gray-300 min-h-10 bg-white",
                  !time && "text-muted-foreground",
                  className
                )}
                disabled={disabled}
              >
                {time ? time : <span>{placeholder}</span>}
                <Clock className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-0 z-50" align="start">
            <ScrollArea className="h-60 pointer-events-auto">
              <div className="p-1">
                {timeOptions.map((timeOption) => (
                  <Button
                    key={timeOption}
                    variant={time === timeOption ? "default" : "ghost"}
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setTime(timeOption)}
                  >
                    {timeOption}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Alternative direct input for time */}
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="sr-only"
          data-testid="time-input-fallback"
        />
      </div>
    </div>
  )
}
