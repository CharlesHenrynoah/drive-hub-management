
// Importez les modules et composants nécessaires
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Driver } from "@/types/driver";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

// Définir les props pour le composant
export interface EditDriverFormProps {
  driver: Driver;
  onSuccess?: () => void;
  buttonText?: string;
}

// Schéma de validation Zod pour le formulaire
const formSchema = z.object({
  id_chauffeur: z.string().min(1, "L'identifiant est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Format d'email invalide").min(1, "L'email est requis"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  date_debut_activite: z.date({
    required_error: "La date de début d'activité est requise",
  }),
  id_entreprise: z.string().min(1, "L'entreprise est requise"),
  disponible: z.boolean(),
  ville: z.string().optional(),
  piece_identite: z.string().min(1, "La pièce d'identité est requise"),
  certificat_medical: z.string().min(1, "Le certificat médical est requis"),
  justificatif_domicile: z.string().min(1, "Le justificatif de domicile est requis"),
  photo: z.string().optional(),
  note_chauffeur: z.number(),
});

export function EditDriverForm({ 
  driver,
  onSuccess,
  buttonText = "Mettre à jour"
}: EditDriverFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  // Initialiser le formulaire avec les valeurs du chauffeur
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id_chauffeur: driver.id_chauffeur,
      nom: driver.nom,
      prenom: driver.prenom,
      email: driver.email,
      telephone: driver.telephone,
      date_debut_activite: new Date(driver.date_debut_activite),
      id_entreprise: driver.id_entreprise,
      disponible: driver.disponible,
      ville: driver.ville,
      piece_identite: driver.piece_identite,
      certificat_medical: driver.certificat_medical,
      justificatif_domicile: driver.justificatif_domicile,
      photo: driver.photo,
      note_chauffeur: driver.note_chauffeur,
    },
  });

  // Soumettre le formulaire
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      // Mise à jour du chauffeur dans Supabase
      const { error } = await supabase
        .from('drivers')
        .update({
          id_chauffeur: values.id_chauffeur,
          nom: values.nom,
          prenom: values.prenom,
          email: values.email,
          telephone: values.telephone,
          date_debut_activite: values.date_debut_activite.toISOString().split('T')[0],
          id_entreprise: values.id_entreprise,
          disponible: values.disponible,
          ville: values.ville,
          piece_identite: values.piece_identite,
          certificat_medical: values.certificat_medical,
          justificatif_domicile: values.justificatif_domicile,
          photo: values.photo,
          note_chauffeur: values.note_chauffeur,
        })
        .eq('id', driver.id);
      
      if (error) throw error;
      
      toast.success("Chauffeur mis à jour avec succès !");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Effet pour charger la liste des entreprises
  useState(() => {
    async function fetchCompanies() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name');
        
        if (error) throw error;
        
        setCompanies(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
      }
    }
    
    fetchCompanies();
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ID Chauffeur */}
          <FormField
            control={form.control}
            name="id_chauffeur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Chauffeur</FormLabel>
                <FormControl>
                  <Input placeholder="ID Chauffeur" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Disponibilité */}
          <FormField
            control={form.control}
            name="disponible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Disponibilité</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "true")} 
                  defaultValue={field.value ? "true" : "false"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une disponibilité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Disponible</SelectItem>
                    <SelectItem value="false">Indisponible</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom */}
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prénom */}
          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Prénom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Téléphone */}
          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="Téléphone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date de début d'activité */}
          <FormField
            control={form.control}
            name="date_debut_activite"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début d'activité</FormLabel>
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
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Sélectionner une date</span>
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ville */}
          <FormField
            control={form.control}
            name="ville"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input placeholder="Ville" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Entreprise */}
          <FormField
            control={form.control}
            name="id_entreprise"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entreprise</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une entreprise" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((company) => (
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

          {/* Note */}
          <FormField
            control={form.control}
            name="note_chauffeur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Note" 
                    min="0" 
                    max="5" 
                    step="0.5" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pièce d'identité et Certificat Médical sur la même ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="piece_identite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pièce d'identité</FormLabel>
                <FormControl>
                  <Input placeholder="Référence pièce d'identité" {...field} />
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
                  <Input placeholder="Référence certificat médical" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Justificatif de domicile et Photo sur la même ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="justificatif_domicile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Justificatif de domicile</FormLabel>
                <FormControl>
                  <Input placeholder="Référence justificatif de domicile" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="URL de la photo" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bouton de soumission */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Mise à jour en cours..." : buttonText}
        </Button>
      </form>
    </Form>
  );
}
