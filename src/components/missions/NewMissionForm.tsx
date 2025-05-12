
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addHours } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarIcon, Clock, MapPin, UserRound, Truck, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewMissionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  date: z.date({ required_error: "La date de départ est requise" }),
  arrivalDate: z.date().optional(),
  driver: z.string().min(1, "Le chauffeur est requis"),
  vehicle: z.string().min(1, "Le véhicule est requis"),
  company: z.string().min(1, "L'entreprise est requise"),
  startLocation: z.string().optional(),
  endLocation: z.string().optional(),
  client: z.string().optional(),
  passengers: z.coerce.number().int().nonnegative().optional(),
  description: z.string().optional(),
  additionalDetails: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
});

export function NewMissionForm({ onSuccess, onCancel }: NewMissionFormProps) {
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  const [arrivalTimePopoverOpen, setArrivalTimePopoverOpen] = useState(false);
  
  const defaultDate = new Date();
  defaultDate.setMinutes(Math.ceil(defaultDate.getMinutes() / 15) * 15); // Round to next 15 min
  
  const defaultArrivalDate = addHours(defaultDate, 1); // Default 1 hour duration

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: defaultDate,
      arrivalDate: defaultArrivalDate,
      driver: "",
      vehicle: "",
      company: "",
      status: "pending",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Here we would normally save to a database
    // For now we'll just simulate success and return the mission with a generated ID
    const newMission = {
      ...data,
      id: `mission-${Math.random().toString(36).substring(2, 9)}`,
    };

    console.log("Nouvelle mission créée:", newMission);
    toast.success("Mission créée avec succès!");
    onSuccess();
  }

  // Helper function for time selection
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return {
      value: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      label: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    };
  });

  // Update time part of the date
  const updateTimeInDate = (date: Date | undefined, timeString: string) => {
    if (!date) return;
    const [hours, minutes] = timeString.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);
    return newDate;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de la mission</FormLabel>
              <FormControl>
                <Input placeholder="Titre de la mission" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Departure Date and Time */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date et heure de départ</FormLabel>
                <div className="flex gap-2">
                  <DatePicker 
                    date={field.value} 
                    setDate={(date) => {
                      if (date) field.onChange(date);
                    }}
                    placeholder="Date de départ"
                  />
                  <Popover open={timePopoverOpen} onOpenChange={setTimePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[120px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "HH:mm") : "Heure"}
                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="h-[300px] overflow-y-auto p-2">
                        {timeOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant="ghost"
                            className="w-full justify-start font-normal"
                            onClick={() => {
                              const newDate = updateTimeInDate(field.value, option.value);
                              if (newDate) field.onChange(newDate);
                              setTimePopoverOpen(false);
                            }}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Arrival Date and Time */}
          <FormField
            control={form.control}
            name="arrivalDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date et heure d'arrivée (optionnel)</FormLabel>
                <div className="flex gap-2">
                  <DatePicker 
                    date={field.value} 
                    setDate={(date) => {
                      field.onChange(date || undefined);
                    }}
                    placeholder="Date d'arrivée"
                  />
                  <Popover open={arrivalTimePopoverOpen} onOpenChange={setArrivalTimePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[120px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!field.value}
                      >
                        {field.value ? format(field.value, "HH:mm") : "Heure"}
                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="h-[300px] overflow-y-auto p-2">
                        {timeOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant="ghost"
                            className="w-full justify-start font-normal"
                            onClick={() => {
                              const newDate = updateTimeInDate(field.value, option.value);
                              if (newDate) field.onChange(newDate);
                              setArrivalTimePopoverOpen(false);
                            }}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Driver */}
          <FormField
            control={form.control}
            name="driver"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    Chauffeur
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Nom du chauffeur" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vehicle */}
          <FormField
            control={form.control}
            name="vehicle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Véhicule
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Modèle du véhicule" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Company */}
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Entreprise
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Nom de l'entreprise" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Start Location */}
          <FormField
            control={form.control}
            name="startLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Lieu de départ (Point A)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Point de départ" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Location */}
          <FormField
            control={form.control}
            name="endLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Destination (Point B)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Point d'arrivée" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Client */}
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    Client
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Nom du client" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Passengers */}
          <FormField
            control={form.control}
            name="passengers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Nombre de passagers
                  </span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="Nombre de passagers" 
                    {...field} 
                    value={field.value === undefined ? "" : field.value} 
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description de la mission" 
                  className="resize-none" 
                  rows={3} 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional Details */}
        <FormField
          control={form.control}
          name="additionalDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Détails supplémentaires</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Détails supplémentaires" 
                  className="resize-none" 
                  rows={3} 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            Créer la mission
          </Button>
        </div>
      </form>
    </Form>
  );
}
