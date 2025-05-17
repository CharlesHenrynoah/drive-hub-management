
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Add these functions at the top
const fetchDriversByCompany = async (
  companyId: string, 
  location: string,
  departureDate?: Date,
  arrivalDate?: Date
) => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id_entreprise', companyId)
      .eq('disponible', true);

    if (error) {
      console.error("Erreur lors de la récupération des chauffeurs:", error);
      throw error;
    }

    // Filter drivers by location if needed
    let filteredDrivers = data || [];
    if (location && location.trim() !== "") {
      filteredDrivers = filteredDrivers.filter(driver => 
        !driver.ville || driver.ville.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Add additional date-based filtering if needed
    // This is a placeholder - actual implementation would depend on your availability tracking

    return filteredDrivers;
  } catch (error) {
    console.error("Erreur lors de la récupération des chauffeurs:", error);
    throw error;
  }
};

const fetchVehiclesByCompany = async (
  companyId: string, 
  location: string,
  passengers?: number,
  departureDate?: Date,
  arrivalDate?: Date
) => {
  try {
    let query = supabase
      .from('vehicles')
      .select('*')
      .eq('company_id', companyId);

    if (passengers) {
      query = query.gte('capacity', passengers);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur lors de la récupération des véhicules:", error);
      throw error;
    }

    // Filter vehicles by location if needed
    let filteredVehicles = data || [];
    if (location && location.trim() !== "") {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        !vehicle.location || vehicle.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Add additional date-based filtering if needed
    // This is a placeholder - actual implementation would depend on your availability tracking

    return filteredVehicles;
  } catch (error) {
    console.error("Erreur lors de la récupération des véhicules:", error);
    throw error;
  }
};

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Le titre doit contenir au moins 2 caractères.",
  }),
  description: z.string().optional(),
  company_id: z.string({
    required_error: "Veuillez sélectionner une entreprise.",
  }),
  client: z.string().optional(),
  client_email: z.string().email().optional(),
  client_phone: z.string().optional(),
  driver_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  start_location: z.string({
    required_error: "Veuillez indiquer le lieu de départ.",
  }),
  end_location: z.string({
    required_error: "Veuillez indiquer le lieu d'arrivée.",
  }),
  date: z.date({
    required_error: "Veuillez sélectionner une date de départ.",
  }),
  arrival_date: z.date({
    required_error: "Veuillez sélectionner une date d'arrivée.",
  }),
  passengers: z.coerce.number().int().positive().optional(),
  status: z.string().default("en_cours"),
});

export function NewMissionForm({ onSuccess }: { onSuccess: () => void }) {
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openCompany, setOpenCompany] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [openDriver, setOpenDriver] = useState(false);
  const [openVehicle, setOpenVehicle] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "en_cours",
    },
  });

  const watchCompanyId = form.watch("company_id");
  const watchStartLocation = form.watch("start_location");
  const watchPassengers = form.watch("passengers");
  const watchDate = form.watch("date");
  const watchArrivalDate = form.watch("arrival_date");

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (watchCompanyId) {
      // We don't fetch clients since the table doesn't exist
      // Just create some dummy clients for the company if needed
      setClients([
        { id: '1', name: 'Client 1', email: 'client1@example.com', phone: '0601020304' },
        { id: '2', name: 'Client 2', email: 'client2@example.com', phone: '0605060708' },
      ]);
      
      if (watchStartLocation) {
        fetchDriversForForm(watchCompanyId, watchStartLocation, watchDate, watchArrivalDate);
        fetchVehiclesForForm(watchCompanyId, watchStartLocation, watchPassengers, watchDate, watchArrivalDate);
      }
    }
  }, [watchCompanyId, watchStartLocation, watchPassengers, watchDate, watchArrivalDate]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des entreprises:", error);
      toast.error("Erreur lors de la récupération des entreprises");
    }
  };

  const fetchDriversForForm = async (
    companyId: string, 
    location: string,
    departureDate?: Date,
    arrivalDate?: Date
  ) => {
    try {
      const driversData = await fetchDriversByCompany(companyId, location, departureDate, arrivalDate);
      const formattedDrivers = driversData.map(driver => ({
        id: driver.id,
        name: `${driver.prenom} ${driver.nom}`
      }));
      setDrivers(formattedDrivers);
    } catch (error) {
      console.error("Erreur lors de la récupération des chauffeurs:", error);
      toast.error("Erreur lors de la récupération des chauffeurs");
    }
  };

  const fetchVehiclesForForm = async (
    companyId: string, 
    location: string,
    passengers?: number,
    departureDate?: Date,
    arrivalDate?: Date
  ) => {
    try {
      const vehiclesData = await fetchVehiclesByCompany(companyId, location, passengers, departureDate, arrivalDate);
      const formattedVehicles = vehiclesData.map(vehicle => ({
        id: vehicle.id,
        name: `${vehicle.brand} ${vehicle.model} (${vehicle.registration})`
      }));
      setVehicles(formattedVehicles);
    } catch (error) {
      console.error("Erreur lors de la récupération des véhicules:", error);
      toast.error("Erreur lors de la récupération des véhicules");
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Convert form values to match missions table structure
      const missionData = {
        title: values.title,
        description: values.description,
        company_id: values.company_id,
        client: values.client,
        client_email: values.client_email,
        client_phone: values.client_phone,
        driver_id: values.driver_id,
        vehicle_id: values.vehicle_id,
        start_location: values.start_location,
        end_location: values.end_location,
        date: values.date.toISOString(),
        arrival_date: values.arrival_date.toISOString(),
        passengers: values.passengers,
        status: values.status,
      };

      const { error } = await supabase
        .from('missions')
        .insert(missionData);

      if (error) throw error;
      
      toast.success("Mission créée avec succès");
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la création de la mission:", error);
      toast.error("Erreur lors de la création de la mission");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entreprise</FormLabel>
                <Popover open={openCompany} onOpenChange={setOpenCompany}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCompany}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? companies.find((company) => company.id === field.value)?.name
                          : "Sélectionner une entreprise"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Rechercher une entreprise..." />
                      <CommandEmpty>Aucune entreprise trouvée.</CommandEmpty>
                      <CommandGroup>
                        {companies.map((company) => (
                          <CommandItem
                            key={company.id}
                            value={company.name}
                            onSelect={() => {
                              form.setValue("company_id", company.id);
                              setOpenCompany(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                company.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {company.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu de départ</FormLabel>
                <FormControl>
                  <Input placeholder="Lieu de départ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu d'arrivée</FormLabel>
                <FormControl>
                  <Input placeholder="Lieu d'arrivée" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de départ</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arrival_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date d'arrivée</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const departureDate = form.getValues("date");
                        return (
                          date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          (departureDate && date < departureDate)
                        );
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="passengers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de passagers</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nombre de passagers"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du client" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="client_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email du client</FormLabel>
                <FormControl>
                  <Input placeholder="Email du client" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="client_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone du client</FormLabel>
                <FormControl>
                  <Input placeholder="Téléphone du client" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="driver_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chauffeur</FormLabel>
                <Popover open={openDriver} onOpenChange={setOpenDriver}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openDriver}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!watchCompanyId || !watchStartLocation}
                      >
                        {field.value
                          ? drivers.find((driver) => driver.id === field.value)?.name
                          : "Sélectionner un chauffeur"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Rechercher un chauffeur..." />
                      <CommandEmpty>Aucun chauffeur disponible.</CommandEmpty>
                      <CommandGroup>
                        {drivers.map((driver) => (
                          <CommandItem
                            key={driver.id}
                            value={driver.name}
                            onSelect={() => {
                              form.setValue("driver_id", driver.id);
                              setOpenDriver(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                driver.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {driver.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Sélectionnez une entreprise et un lieu de départ pour voir les chauffeurs disponibles.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Véhicule</FormLabel>
                <Popover open={openVehicle} onOpenChange={setOpenVehicle}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openVehicle}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!watchCompanyId || !watchStartLocation}
                      >
                        {field.value
                          ? vehicles.find((vehicle) => vehicle.id === field.value)?.name
                          : "Sélectionner un véhicule"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Rechercher un véhicule..." />
                      <CommandEmpty>Aucun véhicule disponible.</CommandEmpty>
                      <CommandGroup>
                        {vehicles.map((vehicle) => (
                          <CommandItem
                            key={vehicle.id}
                            value={vehicle.name}
                            onSelect={() => {
                              form.setValue("vehicle_id", vehicle.id);
                              setOpenVehicle(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                vehicle.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {vehicle.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Sélectionnez une entreprise et un lieu de départ pour voir les véhicules disponibles.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="confirmee">Confirmée</SelectItem>
                  <SelectItem value="terminee">Terminée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Création en cours..." : "Créer la mission"}
        </Button>
      </form>
    </Form>
  );
}
