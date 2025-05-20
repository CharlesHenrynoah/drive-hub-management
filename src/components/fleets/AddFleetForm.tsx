
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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

// Type for new vehicle creation
interface NewVehicle {
  brand: string;
  model: string;
  registration: string;
  type: string;
  capacity: number;
  fuel_type: string;
}

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

// Form schema for new vehicle
const vehicleSchema = z.object({
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  registration: z.string().min(1, "L'immatriculation est requise"),
  type: z.string().min(1, "Le type est requis"),
  capacity: z.coerce.number().min(1, "La capacité doit être au moins 1"),
  fuel_type: z.string().min(1, "Le type de carburant est requis")
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
  const [activeTab, setActiveTab] = useState("existing");
  const [newVehicles, setNewVehicles] = useState<NewVehicle[]>([]);
  const [availableFuelTypes] = useState(['Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL', 'GNV']);
  const [availableVehicleTypes] = useState(['Berline', 'SUV', 'Monospace', 'Utilitaire', 'Minibus', 'Autocar']);
  
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

  const vehicleForm = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brand: "",
      model: "",
      registration: "",
      type: "",
      capacity: 1,
      fuel_type: ""
    }
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
    setNewVehicles([]);
  };

  // Add new vehicle to list
  const handleAddVehicle = (data: z.infer<typeof vehicleSchema>) => {
    setNewVehicles([...newVehicles, data]);
    vehicleForm.reset();
  };

  // Remove vehicle from list
  const handleRemoveVehicle = (index: number) => {
    const updatedVehicles = [...newVehicles];
    updatedVehicles.splice(index, 1);
    setNewVehicles(updatedVehicles);
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
      
      // Create new vehicles if any
      if (newVehicles.length > 0) {
        const vehiclesToCreate = newVehicles.map(vehicle => ({
          brand: vehicle.brand,
          model: vehicle.model,
          registration: vehicle.registration,
          type: vehicle.type,
          capacity: vehicle.capacity,
          fuel_type: vehicle.fuel_type,
          company_id: values.entrepriseId,
          ecological_score: 0, // Default value
          emissions: 0, // Default value
          year: new Date().getFullYear(), // Current year as default
          mileage: 0, // Default value
        }));
        
        const { data: createdVehicles, error: createVehiclesError } = await supabase
          .from('vehicles')
          .insert(vehiclesToCreate)
          .select('id');
          
        if (createVehiclesError) {
          console.error('Error creating vehicles:', createVehiclesError);
          toast.error('Erreur lors de la création des véhicules');
        } else if (createdVehicles) {
          // Associate newly created vehicles with the fleet
          const newVehicleRelations = createdVehicles.map(vehicle => ({
            fleet_id: fleetId,
            vehicle_id: vehicle.id
          }));
          
          const { error: newVehiclesAssocError } = await supabase
            .from('fleet_vehicles')
            .insert(newVehicleRelations);
            
          if (newVehiclesAssocError) {
            console.error('Error associating new vehicles:', newVehiclesAssocError);
            toast.error('Erreur lors de l\'association des nouveaux véhicules');
          }
        }
      }
      
      // Associate existing vehicles if any selected
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
      vehicleForm.reset();
      setNewVehicles([]);
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle flotte</DialogTitle>
          <DialogDescription>
            Créez une nouvelle flotte qui pourra être associée à des véhicules et des chauffeurs.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Chargement des ressources...</span>
              </div>
            )}
            
            {selectedCompanyId && !loading && (
              <>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 w-[400px]">
                    <TabsTrigger value="existing">Véhicules existants</TabsTrigger>
                    <TabsTrigger value="new">Ajouter des véhicules</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="existing">
                    <FormField
                      control={form.control}
                      name="vehicleIds"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Véhicules existants</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Sélectionnez les véhicules à ajouter à cette flotte
                            </div>
                          </div>
                          
                          {vehicles.length === 0 ? (
                            <div className="text-sm text-muted-foreground py-2">
                              Aucun véhicule disponible pour cette entreprise.
                            </div>
                          ) : (
                            <ScrollArea className="h-[200px]">
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
                            </ScrollArea>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="new">
                    <div className="mb-4">
                      <h3 className="text-base font-medium mb-2">Ajouter des nouveaux véhicules</h3>
                      <div className="text-sm text-muted-foreground mb-4">
                        Ces véhicules seront automatiquement créés et associés à la flotte
                      </div>
                      
                      <div className="border p-4 rounded-md mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <FormLabel htmlFor="brand">Marque</FormLabel>
                            <FormControl>
                              <Input 
                                id="brand" 
                                placeholder="Mercedes, Renault..." 
                                {...vehicleForm.register("brand")}
                              />
                            </FormControl>
                            {vehicleForm.formState.errors.brand && (
                              <p className="text-sm font-medium text-destructive">{vehicleForm.formState.errors.brand.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <FormLabel htmlFor="model">Modèle</FormLabel>
                            <FormControl>
                              <Input 
                                id="model" 
                                placeholder="Sprinter, Master..." 
                                {...vehicleForm.register("model")}
                              />
                            </FormControl>
                            {vehicleForm.formState.errors.model && (
                              <p className="text-sm font-medium text-destructive">{vehicleForm.formState.errors.model.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <FormLabel htmlFor="registration">Immatriculation</FormLabel>
                            <FormControl>
                              <Input 
                                id="registration" 
                                placeholder="AA-123-BB" 
                                {...vehicleForm.register("registration")}
                              />
                            </FormControl>
                            {vehicleForm.formState.errors.registration && (
                              <p className="text-sm font-medium text-destructive">{vehicleForm.formState.errors.registration.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <FormLabel htmlFor="type">Type</FormLabel>
                            <Select
                              onValueChange={(value) => vehicleForm.setValue("type", value)}
                              value={vehicleForm.watch("type")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableVehicleTypes.map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {vehicleForm.formState.errors.type && (
                              <p className="text-sm font-medium text-destructive">{vehicleForm.formState.errors.type.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <FormLabel htmlFor="capacity">Capacité</FormLabel>
                            <FormControl>
                              <Input 
                                id="capacity" 
                                type="number" 
                                min="1"
                                {...vehicleForm.register("capacity", { valueAsNumber: true })}
                              />
                            </FormControl>
                            {vehicleForm.formState.errors.capacity && (
                              <p className="text-sm font-medium text-destructive">{vehicleForm.formState.errors.capacity.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <FormLabel htmlFor="fuel_type">Type de carburant</FormLabel>
                            <Select
                              onValueChange={(value) => vehicleForm.setValue("fuel_type", value)}
                              value={vehicleForm.watch("fuel_type")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un carburant" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableFuelTypes.map((fuel) => (
                                  <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {vehicleForm.formState.errors.fuel_type && (
                              <p className="text-sm font-medium text-destructive">{vehicleForm.formState.errors.fuel_type.message}</p>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          type="button" 
                          onClick={vehicleForm.handleSubmit(handleAddVehicle)}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Ajouter ce véhicule
                        </Button>
                      </div>
                      
                      {newVehicles.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Véhicules à créer ({newVehicles.length})</h4>
                          <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                              {newVehicles.map((vehicle, index) => (
                                <div key={index} className="flex justify-between items-center border p-2 rounded-md">
                                  <div>
                                    <span className="font-medium">{vehicle.registration}</span> - {vehicle.brand} {vehicle.model} ({vehicle.capacity} places)
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleRemoveVehicle(index)} 
                                    className="h-8 w-8 text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
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
                        <div className="text-sm text-amber-500 py-2 border border-amber-200 bg-amber-50 rounded-md p-2">
                          <p>Aucun chauffeur disponible pour cette entreprise.</p>
                          <p className="mt-1">Vous pouvez tout de même créer la flotte et y ajouter des chauffeurs ultérieurement.</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[200px]">
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
                        </ScrollArea>
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
                {newVehicles.length > 0 
                  ? `Ajouter la flotte et ${newVehicles.length} véhicule${newVehicles.length > 1 ? 's' : ''}`
                  : 'Ajouter la flotte'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
