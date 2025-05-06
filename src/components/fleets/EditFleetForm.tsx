
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fleet } from "./FleetsManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const fleetFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  company_id: z.string().min(1, { message: "Veuillez sélectionner une entreprise" }),
  description: z.string().optional(),
});

type FleetFormValues = z.infer<typeof fleetFormSchema>;

interface EditFleetFormProps {
  fleet: Fleet;
  companies: Record<string, string>;
  onFleetUpdated: () => void;
  onCancel: () => void;
}

export function EditFleetForm({ fleet, companies, onFleetUpdated, onCancel }: EditFleetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FleetFormValues>({
    resolver: zodResolver(fleetFormSchema),
    defaultValues: {
      name: fleet.name,
      company_id: fleet.company_id,
      description: fleet.description || "",
    },
  });

  const onSubmit = async (values: FleetFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('fleets')
        .update({
          name: values.name,
          company_id: values.company_id,
          description: values.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fleet.id);
        
      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        toast.error("La mise à jour de la flotte a échoué");
        return;
      }
      
      toast.success("Flotte mise à jour avec succès");
      onFleetUpdated();
    } catch (err) {
      console.error('Erreur inattendue:', err);
      toast.error("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle>Modifier la flotte</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la flotte</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez un nom" {...field} />
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
                      <SelectValue placeholder="Sélectionnez une entreprise" />
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
                    placeholder="Description de la flotte (optionnel)"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
