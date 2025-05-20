
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Fleet } from "./FleetsManagement";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Form schema for validation
const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  company_id: z.string().min(1, "L'entreprise est requise"),
  description: z.string().optional()
});

interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
}

interface Driver {
  id: string;
  id_chauffeur: string;
  nom: string;
  prenom: string;
}

interface EditFleetFormProps {
  fleet: Fleet;
  companies: Record<string, string>;
  onFleetUpdated: () => void;
  onCancel: () => void;
}

export function EditFleetForm({ fleet, companies, onFleetUpdated, onCancel }: EditFleetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: fleet.name,
      company_id: fleet.company_id,
      description: fleet.description || ""
    }
  });

  useEffect(() => {
    async function fetchFleetDetails() {
      try {
        setLoading(true);
        console.log("Fetching details for fleet ID:", fleet.id);
        
        // Fetch vehicles for this fleet
        const { data: fleetVehiclesData, error: fleetVehiclesError } = await supabase
          .from('fleet_vehicles')
          .select('vehicle_id')
          .eq('fleet_id', fleet.id);
          
        if (fleetVehiclesError) {
          console.error('Error fetching fleet vehicles:', fleetVehiclesError);
          return;
        }
        
        console.log("Fleet vehicles data:", fleetVehiclesData);
        
        if (fleetVehiclesData && fleetVehiclesData.length > 0) {
          const vehicleIds = fleetVehiclesData.map(item => item.vehicle_id);
          console.log("Vehicle IDs:", vehicleIds);
          
          const { data: vehiclesData, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('id, registration, brand, model')
            .in('id', vehicleIds);
            
          if (vehiclesError) {
            console.error('Error fetching vehicles:', vehiclesError);
          } else {
            console.log("Vehicles data:", vehiclesData);
            setVehicles(vehiclesData || []);
          }
        } else {
          console.log("No vehicles found for this fleet");
          setVehicles([]);
        }
        
        // Fetch drivers for this fleet
        const { data: fleetDriversData, error: fleetDriversError } = await supabase
          .from('fleet_drivers')
          .select('driver_id')
          .eq('fleet_id', fleet.id);
          
        if (fleetDriversError) {
          console.error('Error fetching fleet drivers:', fleetDriversError);
          return;
        }
        
        console.log("Fleet drivers data:", fleetDriversData);
        
        if (fleetDriversData && fleetDriversData.length > 0) {
          const driverIds = fleetDriversData.map(item => item.driver_id);
          console.log("Driver IDs:", driverIds);
          
          const { data: driversData, error: driversError } = await supabase
            .from('drivers')
            .select('id, id_chauffeur, nom, prenom')
            .in('id', driverIds);
            
          if (driversError) {
            console.error('Error fetching drivers:', driversError);
          } else {
            console.log("Drivers data:", driversData);
            setDrivers(driversData || []);
          }
        } else {
          console.log("No drivers found for this fleet");
          setDrivers([]);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFleetDetails();
  }, [fleet.id]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      // Update fleet in Supabase
      const { error } = await supabase
        .from('fleets')
        .update({
          name: values.name,
          company_id: values.company_id,
          description: values.description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', fleet.id);
        
      if (error) {
        console.error('Error updating fleet:', error);
        toast.error("Erreur lors de la mise à jour de la flotte");
        return;
      }
      
      toast.success("Flotte mise à jour avec succès");
      onFleetUpdated();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle delete action
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // First delete all fleet_vehicles and fleet_drivers associations
      const { error: vehicleError } = await supabase
        .from('fleet_vehicles')
        .delete()
        .eq('fleet_id', fleet.id);
        
      if (vehicleError) {
        console.error('Error deleting fleet vehicles:', vehicleError);
        toast.error("Erreur lors de la suppression des véhicules associés");
        return;
      }
      
      const { error: driverError } = await supabase
        .from('fleet_drivers')
        .delete()
        .eq('fleet_id', fleet.id);
        
      if (driverError) {
        console.error('Error deleting fleet drivers:', driverError);
        toast.error("Erreur lors de la suppression des chauffeurs associés");
        return;
      }
      
      // Then delete the fleet itself
      const { error } = await supabase
        .from('fleets')
        .delete()
        .eq('id', fleet.id);
        
      if (error) {
        console.error('Error deleting fleet:', error);
        toast.error("Erreur lors de la suppression de la flotte");
        return;
      }
      
      toast.success("Flotte supprimée avec succès");
      onFleetUpdated();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[550px] max-h-[80vh] p-0 overflow-hidden">
      <ScrollArea className="max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Modifier la flotte</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la flotte</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la flotte" {...field} />
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une entreprise" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(companies).map(([id, name]) => (
                          <SelectItem key={id} value={id}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description de la flotte" 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Véhicules associés</h3>
                <Separator className="my-2" />
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Chargement des véhicules...</span>
                  </div>
                ) : vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {vehicles.map((vehicle) => (
                      <Card key={vehicle.id} className="bg-secondary/50">
                        <CardContent className="p-3">
                          <div className="font-medium">{vehicle.registration}</div>
                          <div className="text-sm text-muted-foreground">
                            {vehicle.brand} {vehicle.model}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun véhicule associé à cette flotte</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Chauffeurs associés</h3>
                <Separator className="my-2" />
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Chargement des chauffeurs...</span>
                  </div>
                ) : drivers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {drivers.map((driver) => (
                      <Card key={driver.id} className="bg-secondary/50">
                        <CardContent className="p-3">
                          <div className="font-medium">{driver.prenom} {driver.nom}</div>
                          <Badge variant="outline" className="mt-1">
                            {driver.id_chauffeur}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun chauffeur associé à cette flotte</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-6">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isSubmitting || isDeleting}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer la flotte
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting || isDeleting}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </ScrollArea>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette flotte?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement la flotte "{fleet.name}" et toutes ses associations avec les véhicules et chauffeurs.
              Les véhicules et chauffeurs ne seront pas supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContent>
  );
}
