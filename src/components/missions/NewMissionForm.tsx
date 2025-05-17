import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarIcon, Clock, MapPin, UserRound, Truck, Building2, Users, Mail, Phone, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { calculateDistance, calculateEstimatedArrival } from "@/utils/distanceCalculator";

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
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";

interface NewMissionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  date: z.date({ required_error: "La date de départ est requise" }),
  arrival_date: z.date().optional(),
  driver: z.string().min(1, "Le chauffeur est requis"),
  vehicle: z.string().min(1, "Le véhicule est requis"),
  company: z.string().min(1, "L'entreprise est requise"),
  startLocation: z.string().min(1, "Le lieu de départ est requis"),
  endLocation: z.string().min(1, "La destination est requise"),
  client: z.string().optional(),
  clientEmail: z.string().email("Email invalide").optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  passengers: z.coerce.number().int().nonnegative().optional(),
  description: z.string().optional(),
  additionalDetails: z.string().optional(),
});

// Villes françaises et européennes pour les suggestions
const frenchCities = [
  { label: "🇫🇷 Paris", value: "Paris" },
  { label: "🇫🇷 Marseille", value: "Marseille" },
  { label: "🇫🇷 Lyon", value: "Lyon" },
  { label: "🇫🇷 Toulouse", value: "Toulouse" },
  { label: "🇫🇷 Nice", value: "Nice" },
  { label: "🇫🇷 Nantes", value: "Nantes" },
  { label: "🇫🇷 Strasbourg", value: "Strasbourg" },
  { label: "🇫🇷 Montpellier", value: "Montpellier" },
  { label: "🇫🇷 Bordeaux", value: "Bordeaux" },
  { label: "🇫🇷 Lille", value: "Lille" },
  { label: "🇫🇷 Rennes", value: "Rennes" },
  { label: "🇫🇷 Reims", value: "Reims" },
  { label: "🇫🇷 Le Havre", value: "Le Havre" },
  { label: "🇫🇷 Saint-Étienne", value: "Saint-Étienne" },
  { label: "🇫🇷 Toulon", value: "Toulon" },
  { label: "🇫🇷 Grenoble", value: "Grenoble" },
  { label: "🇫🇷 Dijon", value: "Dijon" },
  { label: "🇫🇷 Angers", value: "Angers" },
  { label: "🇫🇷 Nîmes", value: "Nîmes" },
  { label: "🇫🇷 Clermont-Ferrand", value: "Clermont-Ferrand" },
];

const europeanCities = [
  { label: "🇩🇪 Berlin", value: "Berlin" },
  { label: "🇦🇹 Vienne", value: "Vienne" },
  { label: "🇧🇪 Bruxelles", value: "Bruxelles" },
  { label: "🇧🇬 Sofia", value: "Sofia" },
  { label: "🇨🇾 Nicosie", value: "Nicosie" },
  { label: "🇭🇷 Zagreb", value: "Zagreb" },
  { label: "🇩🇰 Copenhague", value: "Copenhague" },
  { label: "🇪🇸 Madrid", value: "Madrid" },
  { label: "🇪🇪 Tallinn", value: "Tallinn" },
  { label: "🇫🇮 Helsinki", value: "Helsinki" },
  { label: "🇬🇷 Athènes", value: "Athènes" },
  { label: "🇭🇺 Budapest", value: "Budapest" },
  { label: "🇮🇪 Dublin", value: "Dublin" },
  { label: "🇮🇹 Rome", value: "Rome" },
  { label: "🇱🇻 Riga", value: "Riga" },
  { label: "🇱🇹 Vilnius", value: "Vilnius" },
  { label: "🇱🇺 Luxembourg", value: "Luxembourg" },
  { label: "🇲🇹 La Valette", value: "La Valette" },
  { label: "🇳🇱 Amsterdam", value: "Amsterdam" },
  { label: "🇵🇱 Varsovie", value: "Varsovie" },
  { label: "🇵🇹 Lisbonne", value: "Lisbonne" },
  { label: "🇨🇿 Prague", value: "Prague" },
  { label: "🇷🇴 Bucarest", value: "Bucarest" },
  { label: "🇸🇰 Bratislava", value: "Bratislava" },
  { label: "🇸🇮 Ljubljana", value: "Ljubljana" },
  { label: "🇸🇪 Stockholm", value: "Stockholm" },
  { label: "🇳🇴 Oslo", value: "Oslo" },
  { label: "🇨🇭 Berne", value: "Berne" },
  { label: "🇬🇧 Londres", value: "Londres" },
  { label: "🇮🇸 Reykjavik", value: "Reykjavik" },
  { label: "🇦🇱 Tirana", value: "Tirana" },
  { label: "🇷🇸 Belgrade", value: "Belgrade" },
  { label: "🇧🇦 Sarajevo", value: "Sarajevo" },
  { label: "🇲🇪 Podgorica", value: "Podgorica" },
  { label: "🇲🇰 Skopje", value: "Skopje" },
  { label: "🇽🇰 Pristina", value: "Pristina" },
  { label: "🇺🇦 Kyiv", value: "Kyiv" },
  { label: "🇲🇩 Chisinau", value: "Chisinau" },
];

// Combinaison de toutes les villes pour la recherche
const allCities = [...frenchCities, ...europeanCities];

// Fetch drivers based on company, location and passenger count
const fetchDriversByCompany = async (companyId: string, city: string, date?: Date, arrival_date?: Date) => {
  if (!companyId || !city) return [];
  
  const params: Record<string, any> = {
    id_entreprise: companyId,
    ville: city,
    disponible: true
  };
  
  // Add date params if provided
  if (date) {
    params.date = date.toISOString();
  }
  
  if (arrival_date) {
    params.arrival_date = arrival_date.toISOString();
  }
  
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id_entreprise', companyId)
    .eq('ville', city)
    .eq('disponible', true);
  
  if (error) throw error;
  
  // If we have dates, filter out drivers who already have missions at that time
  if (date) {
    const departureDate = date.toISOString().split('T')[0];
    const arrivalDate = arrival_date ? arrival_date.toISOString().split('T')[0] : departureDate;
    
    // Fetch missions during this timeframe
    const { data: busyDrivers, error: missionsError } = await supabase
      .from('missions')
      .select('driver_id')
      .gte('date', `${departureDate}T00:00:00`)
      .lte('date', `${arrivalDate}T23:59:59`)
      .neq('status', 'annulee');
      
    if (missionsError) throw missionsError;
    
    // Filter out busy drivers
    const busyDriverIds = busyDrivers.map(mission => mission.driver_id);
    return data.filter(driver => !busyDriverIds.includes(driver.id));
  }
  
  return data || [];
};

// Fetch vehicles based on company, location, and passenger count
const fetchVehiclesByCompany = async (companyId: string, city: string, passengers?: number, date?: Date, arrival_date?: Date) => {
  if (!companyId || !city) return [];
  
  let query = supabase
    .from('vehicles')
    .select('*')
    .eq('company_id', companyId)
    .eq('location', city)
    .eq('status', 'Disponible');
  
  // Filter by passenger capacity if provided
  if (passengers && passengers > 0) {
    query = query.gte('capacity', passengers);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // If we have dates, filter out vehicles that already have missions at that time
  if (date) {
    const departureDate = date.toISOString().split('T')[0];
    const arrivalDate = arrival_date ? arrival_date.toISOString().split('T')[0] : departureDate;
    
    // Fetch missions during this timeframe
    const { data: busyVehicles, error: missionsError } = await supabase
      .from('missions')
      .select('vehicle_id')
      .gte('date', `${departureDate}T00:00:00`)
      .lte('date', `${arrivalDate}T23:59:59`)
      .neq('status', 'annulee');
      
    if (missionsError) throw missionsError;
    
    // Filter out busy vehicles
    const busyVehicleIds = busyVehicles.map(mission => mission.vehicle_id);
    return data.filter(vehicle => !busyVehicleIds.includes(vehicle.id));
  }
  
  return data || [];
};

export function NewMissionForm({ onSuccess, onCancel }: NewMissionFormProps) {
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  const [arrivalTimePopoverOpen, setArrivalTimePopoverOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [passengerCount, setPassengerCount] = useState<number | undefined>(undefined);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<string | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | undefined>(undefined);
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      arrival_date: undefined,
      company: "",
      driver: "",
      vehicle: "",
      startLocation: "",
      endLocation: "",
      passengers: undefined,
    },
  });

  // Fetch companies for given city and passenger count from Edge Function
  const fetchCompaniesWithResources = async (departureCity: string, passengers?: number) => {
    setLoadingCompanies(true);
    try {
      // Pass passenger count as an additional parameter
      const { data, error } = await supabase.functions.invoke("companies-with-resources", {
        body: { 
          city: departureCity,
          passengers: passengers
        }
      });
      
      if (error) {
        console.error("Error fetching companies with resources:", error);
        toast.error("Erreur lors de la récupération des entreprises");
        return [];
      }
      
      return data || [];
    } catch (e) {
      console.error("Error in fetchCompaniesWithResources:", e);
      toast.error("Erreur lors de la récupération des entreprises");
      return [];
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Get form values
  const departureDate = form.watch('date');
  const arrivalDate = form.watch('arrival_date');
  const startLocation = form.watch('startLocation');
  const endLocation = form.watch('endLocation');
  const selectedVehicleId = form.watch('vehicle');
  const passengers = form.watch('passengers');

  // Fonction pour récupérer les informations du véhicule sélectionné
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (selectedVehicleId) {
        try {
          const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', selectedVehicleId)
            .single();
            
          if (!error && data) {
            setSelectedVehicleType(data.vehicle_type || undefined);
            
            // Recalculer l'heure d'arrivée avec le type de véhicule
            if (distance && departureDate) {
              updateEstimatedArrival(departureDate, distance, data.vehicle_type);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des détails du véhicule:", error);
        }
      }
    };
    
    fetchVehicleDetails();
  }, [selectedVehicleId]);

  // Calcul de la distance et de l'heure d'arrivée lorsque les localisations changent
  useEffect(() => {
    const calculateDistanceAndArrival = async () => {
      if (startLocation && endLocation) {
        setCalculatingDistance(true);
        try {
          const distanceKm = await calculateDistance(startLocation, endLocation);
          setDistance(distanceKm);
          
          if (departureDate) {
            updateEstimatedArrival(departureDate, distanceKm, selectedVehicleType);
          }
        } catch (error) {
          console.error("Erreur lors du calcul de la distance:", error);
          toast.error("Impossible de calculer la distance entre les deux villes");
        } finally {
          setCalculatingDistance(false);
        }
      }
    };
    
    calculateDistanceAndArrival();
  }, [startLocation, endLocation, selectedVehicleType]);

  // Mettre à jour l'heure d'arrivée lorsque l'heure de départ change
  useEffect(() => {
    if (distance && departureDate) {
      updateEstimatedArrival(departureDate, distance, selectedVehicleType);
    }
  }, [departureDate]);

  // Fonction pour mettre à jour l'heure d'arrivée estimée
  const updateEstimatedArrival = (departureTime: Date, distanceKm: number, vehicleType?: string) => {
    try {
      const estimatedArrival = calculateEstimatedArrival(departureTime, distanceKm, vehicleType);
      
      // Calculer la durée en heures et minutes
      const durationMinutes = (estimatedArrival.getTime() - departureTime.getTime()) / 60000;
      const hours = Math.floor(durationMinutes / 60);
      const minutes = Math.round(durationMinutes % 60);
      
      setEstimatedDuration(`${hours}h${minutes.toString().padStart(2, '0')}`);
      
      // Mettre à jour le champ arrival_date du formulaire
      form.setValue('arrival_date', estimatedArrival);
    } catch (error) {
      console.error("Erreur lors du calcul de l'heure d'arrivée estimée:", error);
    }
  };

  // Fetch companies when location changes or passenger count changes
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!selectedLocation) {
        setAvailableCompanies([]);
        return;
      }
      
      setLoadingCompanies(true);
      try {
        // Pass current passenger count to filter companies with appropriate vehicles
        const companies = await fetchCompaniesWithResources(selectedLocation, passengers);
        setAvailableCompanies(companies);
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
        toast.error("Erreur lors du chargement des entreprises");
      } finally {
        setLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, [selectedLocation, passengers]);

  // Update selected location when startLocation changes
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    form.setValue("startLocation", location);
    // Reset company, driver and vehicle when location changes
    form.setValue("company", "");
    form.setValue("driver", "");
    form.setValue("vehicle", "");
    setSelectedCompany("");
  };

  // Handle destination change
  const handleDestinationChange = (location: string) => {
    setSelectedDestination(location);
    form.setValue("endLocation", location);
  };

  // Handle company selection
  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    // Reset driver and vehicle fields when company changes
    form.setValue('driver', '');
    form.setValue('vehicle', '');
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      // Create a new mission in the database
      const { error } = await supabase
        .from('missions')
        .insert({
          title: data.title,
          date: data.date.toISOString(),
          arrival_date: data.arrival_date ? data.arrival_date.toISOString() : null,
          driver_id: data.driver,
          vehicle_id: data.vehicle,
          company_id: data.company,
          status: 'en_cours',
          start_location: data.startLocation || null,
          end_location: data.endLocation || null,
          client: data.client || null,
          client_email: data.clientEmail || null,
          client_phone: data.clientPhone || null,
          passengers: data.passengers || null,
          description: data.description || null,
          additional_details: data.additionalDetails || null
        });

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
        
        {/* Locations with distance info */}
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
                  <Combobox
                    items={frenchCities}
                    value={field.value}
                    onChange={handleLocationChange}
                    placeholder="Point de départ"
                    emptyMessage="Aucune ville trouvée"
                  />
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
                  <Combobox
                    items={allCities}
                    value={field.value}
                    onChange={handleDestinationChange}
                    placeholder="Point d'arrivée"
                    emptyMessage="Aucune ville trouvée"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Distance et durée estimée */}
        {(startLocation && endLocation) && (
          <div className="flex flex-wrap items-center gap-3 text-sm bg-muted/50 p-3 rounded-lg">
            {calculatingDistance ? (
              <span className="text-muted-foreground">Calcul de la distance...</span>
            ) : distance ? (
              <>
                <Badge variant="outline" className="px-2 py-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  Distance: {distance} km
                </Badge>
                {estimatedDuration && (
                  <Badge variant="outline" className="px-2 py-1">
                    <Timer className="h-3.5 w-3.5 mr-1" />
                    Durée estimée: {estimatedDuration}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  *L'heure d'arrivée est calculée automatiquement
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Impossible de calculer la distance</span>
            )}
          </div>
        )}
        
        {/* Departure Date and Time */}
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

          {/* Arrival Date and Time (read-only) */}
          <FormField
            control={form.control}
            name="arrival_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date et heure d'arrivée (calculée)</FormLabel>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={true}
                  >
                    {field.value 
                      ? `${format(field.value, "dd/MM/yyyy")} à ${format(field.value, "HH:mm")}`
                      : "Calculé automatiquement"}
                    <Clock className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Passengers - Now placed before company to influence company selection */}
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
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleCompanyChange(value);
                }}
                value={field.value}
                disabled={!selectedLocation || loadingCompanies || availableCompanies.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCompanies 
                      ? "Chargement..." 
                      : availableCompanies.length === 0 
                        ? passengers ? `Aucune entreprise avec véhicules pour ${passengers} passager(s)` : "Aucune entreprise disponible dans cette ville"
                        : "Sélectionner une entreprise"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {availableCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {`${company.name} (${company.drivers_count} chauffeur(s), ${company.vehicles_count} véhicule(s)${
                        passengers ? `, ${company.suitable_vehicles_count || 0} véhicule(s) adapté(s)` : ''
                      })`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Driver - Filtered by company and location */}
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
                  disabled={!selectedCompany || !selectedLocation || drivers.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedCompany || !selectedLocation
                        ? "Sélectionnez d'abord une entreprise et un lieu de départ" 
                        : drivers.length === 0
                        ? "Aucun chauffeur disponible pour ces dates"
                        : "Sélectionner un chauffeur"
                      } />
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

          {/* Vehicle - Filtered by company, location, and passenger count */}
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
                  disabled={!selectedCompany || !selectedLocation || vehicles.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedCompany || !selectedLocation
                        ? "Sélectionnez d'abord une entreprise et un lieu de départ" 
                        : vehicles.length === 0
                        ? `Aucun véhicule disponible${passengers ? " pour " + passengers + " passager(s)" : ""}`
                        : "Sélectionner un véhicule"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {`${vehicle.brand} ${vehicle.model} (${vehicle.registration})${vehicle.capacity ? " - " + vehicle.capacity + " places" : ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Client Email */}
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

          {/* Client Phone */}
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
