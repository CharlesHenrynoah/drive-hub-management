import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Vehicle } from "@/types/vehicle";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VehicleTypeSelector } from "./VehicleTypeSelector";
import { useForm } from "react-hook-form";

interface VehiclesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSuccess: () => void;
}

export function VehiclesEditModal({ isOpen, onClose, vehicle, onSuccess }: VehiclesEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    defaultValues: {
      brand: vehicle.brand,
      model: vehicle.model,
      type: vehicle.type,
      vehicle_type: vehicle.vehicle_type || "",
      capacity: vehicle.capacity,
      registration: vehicle.registration,
      fuel_type: vehicle.fuel_type,
      year: vehicle.year,
      emissions: vehicle.emissions,
      mileage: vehicle.mileage,
      ecological_score: vehicle.ecological_score,
      last_maintenance: vehicle.last_maintenance.split('T')[0], // Format date to YYYY-MM-DD
      status: vehicle.status || "Disponible",
      location: vehicle.location || "",
    },
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("vehicles")
        .update({
          brand: values.brand,
          model: values.model,
          type: values.type,
          vehicle_type: values.vehicle_type,
          capacity: values.capacity,
          registration: values.registration,
          fuel_type: values.fuel_type,
          year: values.year,
          emissions: values.emissions,
          mileage: values.mileage,
          ecological_score: values.ecological_score,
          last_maintenance: values.last_maintenance,
          status: values.status,
          location: values.location,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vehicle.id);

      if (error) {
        console.error("Erreur lors de la mise à jour du véhicule:", error);
        toast.error("Erreur lors de la mise à jour du véhicule");
      } else {
        toast.success("Véhicule mis à jour avec succès");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du véhicule:", error);
      toast.error("Erreur lors de la mise à jour du véhicule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = ["Disponible", "En service", "En maintenance", "Hors service"];
  const fuelOptions = ["Diesel", "Essence", "Hybride", "Électrique", "Gaz naturel"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le véhicule</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marque</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modèle</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="registration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Immatriculation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type standardisé</FormLabel>
                    <FormControl>
                      <VehicleTypeSelector
                        selectedType={field.value}
                        onTypeChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacité</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="fuel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de carburant</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le carburant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fuelOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Émissions CO₂ (g/km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilométrage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ecological_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score écologique (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="last_maintenance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dernière maintenance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Sélectionner le statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
        
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sauvegarder
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
