
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Driver } from "@/types/driver";
import { VehicleTypeSelector } from "@/components/vehicles/VehicleTypeSelector";
import { Database } from "@/integrations/supabase/types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Combobox } from "@/components/ui/combobox";

// Liste des villes par défaut
const DEFAULT_CITIES = [
  "Paris",
  "Marseille",
  "Lyon",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
  "Montpellier",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Reims",
  "Le Havre",
  "Saint-Étienne",
  "Toulon",
  "Grenoble",
  "Dijon",
  "Angers",
  "Nîmes",
  "Clermont-Ferrand",
];

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

// Type VehicleType basé sur l'enum de la base de données
type VehicleType = Database["public"]["Enums"]["vehicle_type"];

export function EditDriverForm({ 
  driver,
  onSuccess,
  buttonText = "Mettre à jour"
}: EditDriverFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);

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
      ville: driver.ville || "",
      piece_identite: driver.piece_identite,
      certificat_medical: driver.certificat_medical,
      justificatif_domicile: driver.justificatif_domicile,
      photo: driver.photo || "",
      note_chauffeur: driver.note_chauffeur,
    },
  });

  // Charger les types de véhicules associés au chauffeur
  useEffect(() => {
    const fetchDriverVehicleTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('driver_vehicle_types')
          .select('vehicle_type')
          .eq('driver_id', driver.id);
          
        if (error) {
          console.error("Error fetching driver vehicle types:", error);
          return;
        }
        
        if (data) {
          const types = data.map((item) => item.vehicle_type);
          setSelectedVehicleTypes(types);
        }
      } catch (error) {
        console.error("Exception while fetching driver vehicle types:", error);
      }
    };
    
    fetchDriverVehicleTypes();
  }, [driver.id]);

  // Effet pour charger la liste des entreprises
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error("Erreur lors du chargement des entreprises:", error);
          toast.error("Impossible de charger la liste des entreprises");
        } else {
          console.log("Companies loaded:", data);
          setCompanies(data || []);
        }
      } catch (error) {
        console.error("Exception lors du chargement des entreprises:", error);
        toast.error("Erreur lors du chargement des entreprises");
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);

  // Soumettre le formulaire
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      console.log("Submitting form with values:", values);
      
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
      
      if (error) {
        console.error("Error updating driver:", error);
        throw error;
      }
      
      console.log("Driver updated successfully");
      
      // Mise à jour des types de véhicules
      // D'abord, supprimer toutes les anciennes associations
      const { error: deleteError } = await supabase
        .from('driver_vehicle_types')
        .delete()
        .eq('driver_id', driver.id);
        
      if (deleteError) {
        console.error("Erreur lors de la suppression des types de véhicules:", deleteError);
        toast.error("Erreur lors de la mise à jour des qualifications");
      }
      
      // Ensuite, ajouter les nouvelles associations
      if (selectedVehicleTypes.length > 0) {
        const vehicleTypeAssociations = selectedVehicleTypes.map(type => ({
          driver_id: driver.id,
          vehicle_type: type as VehicleType
        }));
        
        const { error: insertError } = await supabase
          .from('driver_vehicle_types')
          .insert(vehicleTypeAssociations);
          
        if (insertError) {
          console.error("Erreur lors de l'ajout des types de véhicules:", insertError);
          toast.error("Erreur lors de l'ajout des qualifications");
        }
      }
      
      toast.success("Chauffeur mis à jour avec succès !");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Convertir les entreprises en format compatible avec le Combobox
  const companyItems = companies.map((company) => ({
    label: company.name,
    value: company.id,
  }));

  // Convertir les villes en format compatible avec le Combobox
  const cityItems = DEFAULT_CITIES.map((city) => ({
    label: city,
    value: city,
  }));
  
  // Pour le débogage seulement
  console.log("Entreprise actuelle:", driver.id_entreprise);
  console.log("Ville actuelle:", driver.ville);
  console.log("Companies disponibles:", companies);
  console.log("Form values:", form.getValues());

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne de gauche - Informations personnelles */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id_chauffeur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Chauffeur</FormLabel>
                    <FormControl>
                      <Input placeholder="C-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="disponible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disponibilité</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "true")} 
                      value={field.value ? "true" : "false"}
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="jean.dupont@exemple.fr" type="email" {...field} />
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
                    <Input placeholder="06 12 34 56 78" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ville"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <Combobox
                      items={cityItems}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Sélectionnez une ville"
                      emptyMessage="Aucune ville trouvée"
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Ville où le chauffeur opère principalement
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: fr })
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
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
                name="id_entreprise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entreprise</FormLabel>
                    <FormControl>
                      <Combobox
                        items={companyItems}
                        value={field.value} 
                        onChange={field.onChange}
                        placeholder="Sélectionnez une entreprise"
                        emptyMessage="Aucune entreprise disponible"
                        loading={isLoadingCompanies}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Types de véhicules (max 6)</FormLabel>
              <VehicleTypeSelector 
                selectedTypes={selectedVehicleTypes} 
                onChange={setSelectedVehicleTypes} 
                maxSelections={6} 
              />
              <FormDescription className="text-xs">
                Sélectionnez jusqu'à 6 types de véhicules que ce chauffeur peut conduire
              </FormDescription>
            </div>
          </div>
          
          {/* Colonne de droite - Documents */}
          <div className="space-y-4">
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
                  {field.value && (
                    <div className="mt-2 p-2 border rounded-md">
                      <img 
                        src={field.value} 
                        alt="Aperçu" 
                        className="w-full h-40 object-cover rounded-md" 
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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
                  <FormDescription>
                    Note attribuée au chauffeur (0-5)
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bouton de soumission */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mise à jour en cours...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>
    </Form>
  );
}
