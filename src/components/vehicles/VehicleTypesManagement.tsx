
import { useState, useEffect } from "react";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, PencilIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type VehicleType = Database["public"]["Enums"]["vehicle_type"];

type VehicleTypeFormData = {
  type: VehicleType;
  description: string;
  capacity_min: number;
  capacity_max: number;
  image_url?: string;
}

export function VehicleTypesManagement() {
  const { data: vehicleTypes, isLoading, refetch } = useVehicleTypes();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VehicleTypeFormData>({
    defaultValues: {
      description: "",
      capacity_min: 0,
      capacity_max: 0,
      image_url: "",
    },
  });

  const openEditDialog = (type: VehicleType) => {
    const vehicleType = vehicleTypes?.find(vt => vt.type === type);
    if (vehicleType) {
      form.reset({
        type: vehicleType.type as VehicleType,
        description: vehicleType.description,
        capacity_min: vehicleType.capacity_min,
        capacity_max: vehicleType.capacity_max,
        image_url: vehicleType.image_url || "",
      });
      setSelectedType(type);
      setIsEditing(true);
    }
  };

  const onSubmit = async (data: VehicleTypeFormData) => {
    if (!selectedType) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("vehicle_types")
        .update({
          description: data.description,
          capacity_min: data.capacity_min,
          capacity_max: data.capacity_max,
          image_url: data.image_url || null,
        })
        .eq("type", selectedType);
        
      if (error) throw error;
      
      toast.success("Type de véhicule mis à jour avec succès");
      refetch();
      setIsEditing(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du type de véhicule");
      console.error("Error updating vehicle type:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Types de véhicules standardisés</h2>
          <p className="text-muted-foreground">
            Gérez les types de véhicules disponibles dans votre flotte.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Capacité</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicleTypes?.map((vehicleType) => (
              <TableRow key={vehicleType.id}>
                <TableCell>{vehicleType.type}</TableCell>
                <TableCell>{vehicleType.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-secondary">
                    {vehicleType.capacity_min} - {vehicleType.capacity_max} places
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(vehicleType.type as VehicleType)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le type de véhicule</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité minimale</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="capacity_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité maximale</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sauvegarder
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
