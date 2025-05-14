
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Driver } from "@/types/driver";
import { VehicleTypeSelector } from "@/components/vehicles/VehicleTypeSelector";
import { useDriverVehicleTypes } from "@/hooks/useDriverVehicleTypes";

// Schéma de validation pour le formulaire d'édition de chauffeur
const driverFormSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Numéro de téléphone invalide"),
  date_debut_activite: z.date({
    required_error: "La date de début d'activité est requise",
  }),
  id_entreprise: z.string().min(1, "L'entreprise est requise"),
  disponible: z.boolean().default(true),
  piece_identite: z.string().min(1, "Le numéro de pièce d'identité est requis"),
  certificat_medical: z.string().min(1, "Le certificat médical est requis"),
  justificatif_domicile: z.string().min(1, "Le justificatif de domicile est requis"),
  photo: z.string().optional(),
  note_chauffeur: z.number().min(0).max(100).default(0),
});

interface EditDriverFormProps {
  driver: Driver;
  companies: Record<string, string>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditDriverForm({ driver, companies, onSuccess, onCancel }: EditDriverFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { vehicleTypes, updateVehicleTypes } = useDriverVehicleTypes(driver.ID_Chauffeur);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>(vehicleTypes || []);

  const form = useForm<z.infer<typeof driverFormSchema>>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      nom: driver.Nom,
      prenom: driver.Prénom,
      email: driver.Email,
      telephone: driver.Téléphone,
      date_debut_activite: typeof driver.Date_Debut_Activité === 'string' 
        ? new Date(driver.Date_Debut_Activité) 
        : driver.Date_Debut_Activité,
      id_entreprise: driver.ID_Entreprise,
      disponible: driver.Disponible,
      piece_identite: driver.Pièce_Identité,
      certificat_medical: driver.Certificat_Médical,
      justificatif_domicile: driver.Justificatif_Domicile,
      photo: driver.Photo,
      note_chauffeur: driver.Note_Chauffeur,
    },
  });

  const onSubmit = async (data: z.infer<typeof driverFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Chercher l'ID interne du chauffeur à partir de son ID_Chauffeur
      const { data: driverData, error: fetchError } = await supabase
        .from('drivers')
        .select('id')
        .eq('id_chauffeur', driver.ID_Chauffeur)
        .single();
      
      if (fetchError) {
        throw new Error("Impossible de trouver le chauffeur à mettre à jour");
      }
      
      const driverId = driverData.id;
      
      // Mise à jour du chauffeur dans la base de données
      const { error: updateError } = await supabase
        .from('drivers')
        .update({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
          date_debut_activite: format(data.date_debut_activite, 'yyyy-MM-dd'),
          id_entreprise: data.id_entreprise,
          disponible: data.disponible,
          piece_identite: data.piece_identite,
          certificat_medical: data.certificat_medical,
          justificatif_domicile: data.justificatif_domicile,
          photo: data.photo,
          note_chauffeur: data.note_chauffeur,
        })
        .eq('id', driverId);

      if (updateError) {
        throw new Error("Erreur lors de la mise à jour du chauffeur");
      }

      // Mise à jour des types de véhicules
      updateVehicleTypes(selectedVehicleTypes);

      toast.success("Chauffeur mis à jour avec succès");
      onSuccess();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la mise à jour du chauffeur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_debut_activite"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début d'activité</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  placeholder="Sélectionner une date"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="id_entreprise"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entreprise</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="piece_identite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pièce d'identité</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="certificat_medical"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificat médical</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="justificatif_domicile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Justificatif de domicile</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la photo</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Types de véhicules (max 6)</FormLabel>
          <VehicleTypeSelector 
            selectedTypes={selectedVehicleTypes} 
            onChange={setSelectedVehicleTypes} 
            maxSelections={6} 
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              "Mettre à jour"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
