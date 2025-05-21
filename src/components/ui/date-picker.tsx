
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormControl } from "./form"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
}

export function DatePicker({ 
  date, 
  setDate, 
  placeholder = "Sélectionner une date", 
  disabled = false,
  className,
  minDate
}: DatePickerProps) {
  // Calculate default minimum date (24 hours from now) if not provided
  const defaultMinDate = React.useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return tomorrow;
  }, []);
  
  // Use provided minDate or default
  const effectiveMinDate = minDate || defaultMinDate;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn(
              "w-full pl-3 text-left font-normal border-dashed border-gray-300 min-h-10",
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
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className="pointer-events-auto"
          disabled={(date) => {
            // Disable dates before effectiveMinDate
            return date < effectiveMinDate;
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
