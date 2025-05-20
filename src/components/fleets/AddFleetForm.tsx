
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { VehicleTypeSelector } from "../vehicles/VehicleTypeSelector";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  company_id: z.string({ required_error: "L'entreprise est requise" }),
  description: z.string().optional(),
});

export function AddFleetForm({ 
  companies, 
  onFleetAdded 
}: { 
  companies: Record<string, string>;
  onFleetAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: vehicleTypes = [], isLoading: loadingVehicleTypes } = useVehicleTypes();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company_id: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Insert the new fleet
      const { data: fleetData, error: fleetError } = await supabase
        .from('fleets')
        .insert({
          name: data.name,
          company_id: data.company_id,
          description: data.description || null,
        })
        .select('id')
        .single();
        
      if (fleetError) {
        throw new Error(`Erreur lors de la création de la flotte: ${fleetError.message}`);
      }

      // If any vehicle types are selected, query vehicles of these types
      if (selectedTypes.length > 0) {
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id')
          .in('type', selectedTypes);

        if (vehiclesError) {
          console.error('Error fetching vehicles by type:', vehiclesError);
        } else if (vehicles && vehicles.length > 0) {
          // Create fleet_vehicles associations
          const fleetVehiclesData = vehicles.map(vehicle => ({
            fleet_id: fleetData.id,
            vehicle_id: vehicle.id
          }));
          
          const { error: associationError } = await supabase
            .from('fleet_vehicles')
            .insert(fleetVehiclesData);
            
          if (associationError) {
            console.error('Error associating vehicles with fleet:', associationError);
            toast.error('Erreur lors de l\'association des véhicules avec la flotte');
          }
        }
      }
      
      toast.success('Flotte créée avec succès');
      
      // Reset form and close modal
      form.reset();
      setSelectedTypes([]);
      setOpen(false);
      
      // Call callback if provided
      if (onFleetAdded) {
        onFleetAdded();
      }
    } catch (err) {
      console.error('Error creating fleet:', err);
      toast.error("Erreur lors de la création de la flotte");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle flotte
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une flotte</DialogTitle>
          <DialogDescription>
            Créez une nouvelle flotte et associez-y des véhicules.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la flotte</FormLabel>
                  <FormControl>
                    <Input placeholder="Flotte principale" {...field} />
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
                  <FormDescription>
                    Optionnel. Ajoutez des détails sur cette flotte.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Types de véhicules</FormLabel>
              <FormDescription>
                Sélectionnez jusqu'à 6 types de véhicules à inclure automatiquement dans cette flotte
              </FormDescription>
              <VehicleTypeSelector 
                selectedTypes={selectedTypes}
                onChange={setSelectedTypes}
                maxSelections={6}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-2"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer la flotte"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
