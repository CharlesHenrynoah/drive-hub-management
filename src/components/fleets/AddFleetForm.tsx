
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Type for vehicles
type Vehicle = {
  id: string;
  registration: string;
  brand: string;
  model: string;
};

// Type for drivers
type Driver = {
  id: string;
  id_chauffeur: string;
  nom: string;
  prenom: string;
};

// Form schema for adding a fleet
const formSchema = z.object({
  nomFlotte: z.string().min(3, {
    message: "Le nom de la flotte doit contenir au moins 3 caractères",
  }),
  description: z.string().min(10, {
    message: "La description doit contenir au moins 10 caractères",
  }),
  entrepriseId: z.string({
    required_error: "Veuillez sélectionner une entreprise",
  }),
  vehicleIds: z.array(z.string()).min(0),
  driverIds: z.array(z.string()).min(0),
});

interface AddFleetFormProps {
  companies: Record<string, string>;
  onFleetAdded?: () => void;
}

export function AddFleetForm({ companies, onFleetAdded }: AddFleetFormProps) {
  const [open, setOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomFlotte: "",
      description: "",
      entrepriseId: "",
      vehicleIds: [],
      driverIds: [],
    },
  });

  // Load vehicles and drivers when company changes
  useEffect(() => {
    async function loadCompanyResources() {
      if (!selectedCompanyId) {
        setVehicles([]);
        setDrivers([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch vehicles for selected company
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, registration, brand, model')
          .eq('company_id', selectedCompanyId);
          
        if (vehiclesError) {
          console.error('Error fetching vehicles:', vehiclesError);
          toast.error('Erreur lors du chargement des véhicules');
        } else {
          setVehicles(vehiclesData || []);
        }
        
        // Fetch drivers for selected company
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, id_chauffeur, nom, prenom')
          .eq('id_entreprise', selectedCompanyId);
          
        if (driversError) {
          console.error('Error fetching drivers:', driversError);
          toast.error('Erreur lors du chargement des chauffeurs');
        } else {
          setDrivers(driversData || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    }
    
    loadCompanyResources();
  }, [selectedCompanyId]);

  // Handle company change
  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value);
    form.setValue('entrepriseId', value);
    // Reset vehicle and driver selections when company changes
    form.setValue('vehicleIds', []);
    form.setValue('driverIds', []);
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      
      // Insert the fleet
      const { data: fleetData, error: fleetError } = await supabase
        .from('fleets')
        .insert({
          name: values.nomFlotte,
          company_id: values.entrepriseId,
          description: values.description,
        })
        .select('id')
        .single();
        
      if (fleetError) {
        console.error('Error creating fleet:', fleetError);
        toast.error('Erreur lors de la création de la flotte');
        return;
      }
      
      const fleetId = fleetData.id;
      
      // Associate vehicles if any selected
      if (values.vehicleIds.length > 0) {
        const vehicleRelations = values.vehicleIds.map(vehicleId => ({
          fleet_id: fleetId,
          vehicle_id: vehicleId
        }));
        
        const { error: vehiclesError } = await supabase
          .from('fleet_vehicles')
          .insert(vehicleRelations);
          
        if (vehiclesError) {
          console.error('Error associating vehicles:', vehiclesError);
          toast.error('Erreur lors de l\'association des véhicules');
        }
      }
      
      // Associate drivers if any selected
      if (values.driverIds.length > 0) {
        const driverRelations = values.driverIds.map(driverId => ({
          fleet_id: fleetId,
          driver_id: driverId
        }));
        
        const { error: driversError } = await supabase
          .from('fleet_drivers')
          .insert(driverRelations);
          
        if (driversError) {
          console.error('Error associating drivers:', driversError);
          toast.error('Erreur lors de l\'association des chauffeurs');
        }
      }
      
      toast.success("Flotte ajoutée avec succès", {
        description: `La flotte "${values.nomFlotte}" a été créée.`,
      });
      
      form.reset();
      setOpen(false);
      
      // Notify parent component
      if (onFleetAdded) {
        onFleetAdded();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Ajouter une flotte</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle flotte</DialogTitle>
          <DialogDescription>
            Créez une nouvelle flotte qui pourra être associée à des véhicules et des chauffeurs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nomFlotte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la flotte</FormLabel>
                  <FormControl>
                    <Input placeholder="Flotte urbaine, Flotte express..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="entrepriseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entreprise</FormLabel>
                  <Select 
                    onValueChange={(value) => handleCompanyChange(value)} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une entreprise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(companies).map(([id, name]) => (
                        <SelectItem key={id} value={id}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Chargement des ressources...</span>
              </div>
            )}
            
            {selectedCompanyId && !loading && (
              <>
                <FormField
                  control={form.control}
                  name="vehicleIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Véhicules</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Sélectionnez les véhicules à ajouter à cette flotte
                        </div>
                      </div>
                      
                      {vehicles.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-2">
                          Aucun véhicule disponible pour cette entreprise.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {vehicles.map((vehicle) => (
                            <FormField
                              key={vehicle.id}
                              control={form.control}
                              name="vehicleIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={vehicle.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded-md"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(vehicle.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, vehicle.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== vehicle.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {vehicle.registration} - {vehicle.brand} {vehicle.model}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="driverIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Chauffeurs</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Sélectionnez les chauffeurs à ajouter à cette flotte
                        </div>
                      </div>
                      
                      {drivers.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-2">
                          Aucun chauffeur disponible pour cette entreprise.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {drivers.map((driver) => (
                            <FormField
                              key={driver.id}
                              control={form.control}
                              name="driverIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={driver.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded-md"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(driver.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, driver.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== driver.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {driver.id_chauffeur} - {driver.prenom} {driver.nom}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description de la flotte et de son utilisation..." 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
