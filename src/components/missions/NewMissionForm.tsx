
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addHours } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarIcon, Clock, MapPin, UserRound, Truck, Users, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

// Define types for our data to avoid circular references
interface Driver {
  id: string;
  nom: string;
  prenom: string;
  disponible: boolean;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration: string;
  disponible: boolean;
}

interface Fleet {
  id: string;
  name: string;
  company_id: string;
  description?: string;
}

interface Company {
  id: string;
  name: string;
}

// Combined type for fleet with company name
interface FleetWithCompany extends Fleet {
  company_name?: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  date: z.date({ required_error: "La date de départ est requise" }),
  arrivalDate: z.date().optional(),
  driver: z.string().min(1, "Le chauffeur est requis"),
  vehicle: z.string().min(1, "Le véhicule est requis"),
  fleet: z.string().min(1, "La flotte est requise"),
  startLocation: z.string().optional(),
  endLocation: z.string().optional(),
  client: z.string().optional(),
  clientEmail: z.string().email("Email invalide").optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  passengers: z.coerce.number().int().nonnegative().optional(),
  description: z.string().optional(),
  additionalDetails: z.string().optional(),
  status: z.enum(["en_cours", "terminee", "annulee"]).default("en_cours"),
});

// Fetch fleets from Supabase with company names
const fetchFleetsWithCompanies = async (): Promise<FleetWithCompany[]> => {
  // First fetch fleets
  const { data: fleets, error } = await supabase
    .from('fleets')
    .select('*');
  
  if (error) throw error;
  if (!fleets) return [];
  
  // Get all unique company IDs
  const companyIds = [...new Set(fleets.map(fleet => fleet.company_id))];
  
  // Fetch companies
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, name')
    .in('id', companyIds);
    
  if (companiesError) {
    console.error('Error fetching companies:', companiesError);
    return fleets;
  }
  
  // Create a lookup map for companies
  const companyMap = new Map();
  companies?.forEach(company => {
    companyMap.set(company.id, company.name);
  });
  
  // Combine fleet with company name
  const fleetsWithCompanies = fleets.map(fleet => ({
    ...fleet,
    company_name: companyMap.get(fleet.company_id) || 'Entreprise inconnue'
  }));
  
  return fleetsWithCompanies;
};

// Fetch drivers based on fleet
const fetchDriversByFleet = async (fleetId: string): Promise<Driver[]> => {
  if (!fleetId) return [];
  
  // Get available drivers in the fleet
  const { data, error } = await supabase
    .from('fleet_drivers')
    .select('driver_id')
    .eq('fleet_id', fleetId);
  
  if (error) {
    console.error('Error fetching fleet drivers:', error);
    return [];
  }
  
  if (!data || data.length === 0) return [];
  
  const driverIds = data.map(item => item.driver_id);
  
  // Get the available drivers from these IDs
  const { data: drivers, error: driversError } = await supabase
    .from('drivers')
    .select('id, nom, prenom, disponible')
    .in('id', driverIds)
    .eq('disponible', true);
  
  if (driversError) throw driversError;
  return drivers || [];
};

// Fetch vehicles based on fleet
const fetchVehiclesByFleet = async (fleetId: string): Promise<Vehicle[]> => {
  if (!fleetId) return [];
  
  const { data, error } = await supabase
    .from('fleet_vehicles')
    .select('vehicle_id')
    .eq('fleet_id', fleetId);
  
  if (error) {
    console.error('Error fetching fleet vehicles:', error);
    return [];
  }
  
  if (!data || data.length === 0) return [];
  
  const vehicleIds = data.map(item => item.vehicle_id);
  
  // Fixed: Only select fields we need and explicitly add disponible field
  const { data: vehiclesData, error: vehiclesError } = await supabase
    .from('vehicles')
    .select('id, brand, model, registration')
    .in('id', vehicleIds);
  
  if (vehiclesError) throw vehiclesError;
  
  // Add the disponible property to match our Vehicle interface
  const vehicles: Vehicle[] = (vehiclesData || []).map(vehicle => ({
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    registration: vehicle.registration,
    disponible: true // We'll assume all fetched vehicles are available
  }));
  
  return vehicles;
};

// Fetch company info for a fleet
const fetchCompanyForFleet = async (fleetId: string): Promise<string | null> => {
  if (!fleetId) return null;
  
  const { data, error } = await supabase
    .from('fleets')
    .select('company_id')
    .eq('id', fleetId)
    .single();
  
  if (error) {
    console.error('Error fetching company for fleet:', error);
    return null;
  }
  
  return data?.company_id || null;
};

export function NewMissionForm({ onSuccess, onCancel }: NewMissionFormProps) {
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  const [arrivalTimePopoverOpen, setArrivalTimePopoverOpen] = useState(false);
  const [selectedFleet, setSelectedFleet] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      fleet: "",
      clientEmail: "",
      clientPhone: "",
      status: "en_cours",
    },
  });

  // Query for fleets with company names
  const { data: fleets = [] } = useQuery({
    queryKey: ['fleets-with-companies'],
    queryFn: fetchFleetsWithCompanies,
  });

  // Query for drivers based on selected fleet
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', selectedFleet],
    queryFn: () => fetchDriversByFleet(selectedFleet),
    enabled: !!selectedFleet,
  });

  // Query for vehicles based on selected fleet
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', selectedFleet],
    queryFn: () => fetchVehiclesByFleet(selectedFleet),
    enabled: !!selectedFleet,
  });

  // Handle fleet selection
  const handleFleetChange = (value: string) => {
    setSelectedFleet(value);
    // Reset driver and vehicle fields when fleet changes
    form.setValue('driver', '');
    form.setValue('vehicle', '');
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      // Get company_id from the selected fleet
      const companyId = await fetchCompanyForFleet(data.fleet);
      
      // Insérer la nouvelle mission dans la base de données
      const { data: mission, error } = await supabase
        .from('missions')
        .insert({
          title: data.title,
          date: data.date.toISOString(),
          arrival_date: data.arrivalDate?.toISOString(),
          driver_id: data.driver,
          vehicle_id: data.vehicle,
          company_id: companyId,
          status: data.status,
          start_location: data.startLocation || null,
          end_location: data.endLocation || null,
          client: data.client || null,
          client_email: data.clientEmail || null, 
          client_phone: data.clientPhone || null,
          passengers: data.passengers || null,
          description: data.description || null,
          additional_details: data.additionalDetails || null
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      toast.success("Mission créée avec succès!");
      onSuccess();
    } catch (error: any) {
      console.error("Erreur lors de la création de la mission:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsSubmitting(false);
    }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
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

        {/* Fleet - Now as the first selection field */}
        <FormField
          control={form.control}
          name="fleet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Flotte
                </span>
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFleetChange(value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une flotte" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {fleets.map((fleet) => (
                    <SelectItem key={fleet.id} value={fleet.id}>
                      {fleet.name} - {fleet.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="h-[200px] overflow-y-auto p-2">
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
                      <div className="h-[200px] overflow-y-auto p-2">
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
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="terminee">Terminée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Driver - Now dependent on fleet */}
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedFleet}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un chauffeur" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {`${driver.prenom} ${driver.nom}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vehicle - Now dependent on fleet */}
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedFleet}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un véhicule" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {`${vehicle.brand} ${vehicle.model} (${vehicle.registration})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Client information section */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Email - New field */}
          <FormField
            control={form.control}
            name="clientEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email du client
                  </span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Email du client" 
                    {...field} 
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Client Phone - New field */}
          <FormField
            control={form.control}
            name="clientPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone du client
                  </span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="tel" 
                    placeholder="Téléphone du client" 
                    {...field} 
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  rows={2} 
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
                  rows={2} 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Création en cours..." : "Créer la mission"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
