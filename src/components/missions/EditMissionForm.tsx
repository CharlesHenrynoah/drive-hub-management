import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarIcon, Clock, MapPin, UserRound, Truck, Building2, Users, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Mission } from "./MissionsCalendar";

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

interface EditMissionFormProps {
  mission: Mission;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  date: z.date({ required_error: "La date de départ est requise" }),
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
  status: z.enum(["en_cours", "terminee", "annulee"]).default("en_cours"),
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

// Fetch all companies (for initial load when editing)
const fetchAllCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

// Fetch drivers based on company
const fetchDriversByCompany = async (companyId: string, city: string) => {
  if (!companyId) return [];

  let query = supabase
    .from('drivers')
    .select('*')
    .eq('id_entreprise', companyId);
    
  if (city) {
    query = query.eq('ville', city);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

// Fetch vehicles based on company
const fetchVehiclesByCompany = async (companyId: string, city: string) => {
  if (!companyId) return [];

  let query = supabase
    .from('vehicles')
    .select('*')
    .eq('company_id', companyId);
    
  if (city) {
    query = query.eq('location', city);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

export function EditMissionForm({ mission, onSuccess, onCancel }: EditMissionFormProps) {
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>(mission.company_id || "");
  const [selectedLocation, setSelectedLocation] = useState<string>(mission.start_location || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: mission.title,
      date: mission.date instanceof Date ? mission.date : new Date(mission.date),
      driver: mission.driver_id || "",
      vehicle: mission.vehicle_id || "",
      company: mission.company_id || "",
      startLocation: mission.start_location || "",
      endLocation: mission.end_location || "",
      client: mission.client || "",
      clientEmail: mission.client_email || "",
      clientPhone: mission.client_phone || "",
      passengers: mission.passengers,
      description: mission.description || "",
      additionalDetails: mission.additional_details || "",
      status: mission.status as "en_cours" | "terminee" | "annulee",
    },
  });

  // Fetch companies for given city from Edge Function
  const fetchCompaniesWithResources = async (departureCity: string) => {
    setLoadingCompanies(true);
    try {
      const { data, error } = await supabase.functions.invoke("companies-with-resources", {
        body: { city: departureCity }
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

  // Charger toutes les entreprises pour l'initialisation 
  useEffect(() => {
    const loadInitialCompanies = async () => {
      if (initialLoaded) return;
      
      try {
        const companies = await fetchAllCompanies();
        setAvailableCompanies(companies);
        setInitialLoaded(true);
      } catch (error) {
        console.error("Erreur lors du chargement initial des entreprises:", error);
      }
    };
    
    loadInitialCompanies();
  }, [initialLoaded]);

  // Query for drivers based on selected company and potentially location
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', selectedCompany, selectedLocation],
    queryFn: () => fetchDriversByCompany(selectedCompany, selectedLocation),
    enabled: !!selectedCompany,
  });

  // Query for vehicles based on selected company and potentially location
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', selectedCompany, selectedLocation],
    queryFn: () => fetchVehiclesByCompany(selectedCompany, selectedLocation),
    enabled: !!selectedCompany,
  });

  // Fetch companies when location changes (only in edit mode if location changes)
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!selectedLocation) {
        if (!mission.start_location) {
          setAvailableCompanies([]);
        }
        return;
      }
      
      // Si on est en mode édition et que la localisation n'a pas changé par rapport à l'originale,
      // on garde les entreprises déjà chargées
      if (mission.start_location === selectedLocation && initialLoaded) {
        return;
      }
      
      setLoadingCompanies(true);
      try {
        const companies = await fetchCompaniesWithResources(selectedLocation);
        setAvailableCompanies(companies);
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
        toast.error("Erreur lors du chargement des entreprises");
      } finally {
        setLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, [selectedLocation, mission.start_location, initialLoaded]);

  // Update selected location when startLocation changes
  const handleLocationChange = (location: string) => {
    // Si la localisation change par rapport à celle d'origine
    if (location !== mission.start_location) {
      setSelectedLocation(location);
      form.setValue("startLocation", location);
      // Reset company, driver and vehicle when location changes
      form.setValue("company", "");
      form.setValue("driver", "");
      form.setValue("vehicle", "");
      setSelectedCompany("");
    } else {
      // Si on revient à la localisation d'origine, restaurer les valeurs d'origine
      setSelectedLocation(location);
      form.setValue("startLocation", location);
      form.setValue("company", mission.company_id || "");
      form.setValue("driver", mission.driver_id || "");
      form.setValue("vehicle", mission.vehicle_id || "");
      setSelectedCompany(mission.company_id || "");
    }
  };

  // Handle company selection
  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    // Reset driver and vehicle fields when company changes
    if (value !== mission.company_id) {
      form.setValue('driver', '');
      form.setValue('vehicle', '');
    }
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      // Mettre à jour la mission dans la base de données
      const { error } = await supabase
        .from('missions')
        .update({
          title: data.title,
          date: data.date.toISOString(),
          driver_id: data.driver,
          vehicle_id: data.vehicle,
          company_id: data.company,
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
        .eq('id', mission.id);

      if (error) {
        throw error;
      }

      toast.success("Mission mise à jour avec succès!");
      onSuccess();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la mission:", error);
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
        
        {/* Locations - Now before date/time */}
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
                    onChange={field.onChange}
                    placeholder="Point d'arrivée"
                    emptyMessage="Aucune ville trouvée"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Departure Date and Time only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Company - Now after date/time */}
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
                disabled={!initialLoaded || (selectedLocation !== mission.start_location && (!selectedLocation || loadingCompanies || availableCompanies.length === 0))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCompanies 
                      ? "Chargement..." 
                      : (!selectedLocation || selectedLocation !== mission.start_location && availableCompanies.length === 0) 
                        ? "Aucune entreprise disponible dans cette ville" 
                        : "Sélectionner une entreprise"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {availableCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Driver - Filtered by company and location in case of change */}
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
                  disabled={!selectedCompany}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedCompany 
                        ? "Sélectionnez d'abord une entreprise"
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

          {/* Vehicle - Filtered by company and location in case of change */}
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
                  disabled={!selectedCompany}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedCompany
                        ? "Sélectionnez d'abord une entreprise"
                        : "Sélectionner un véhicule"
                      } />
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
            {isSubmitting ? "Mise à jour en cours..." : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
