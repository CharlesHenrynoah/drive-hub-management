import { useState, useCallback, useEffect } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Driver } from "@/types/driver";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, UploadCloud } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { VehicleTypeSelector } from "@/components/vehicles/VehicleTypeSelector";
import { Database } from "@/integrations/supabase/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = [...ACCEPTED_IMAGE_TYPES, "application/pdf"];

const formSchema = z.object({
  nom: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  prenom: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide",
  }),
  telephone: z.string().min(8, {
    message: "Veuillez entrer un numéro de téléphone valide",
  }),
  dateDebutActivite: z.date({
    required_error: "Veuillez sélectionner une date de début d'activité",
  }),
  entrepriseId: z.string({
    required_error: "Veuillez sélectionner une entreprise",
  }),
  disponible: z.boolean().default(true),
  photo: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "La taille maximale est de 5MB.")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Seuls les formats .jpg, .jpeg, .png et .webp sont acceptés."
    )
    .nullable()
    .optional(),
  permisConduire: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "La taille maximale est de 5MB.")
    .refine(
      (file) => ACCEPTED_DOC_TYPES.includes(file.type),
      "Seuls les formats .jpg, .jpeg, .png, .webp et .pdf sont acceptés."
    )
    .nullable()
    .optional(),
  carteVTC: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "La taille maximale est de 5MB.")
    .refine(
      (file) => ACCEPTED_DOC_TYPES.includes(file.type),
      "Seuls les formats .jpg, .jpeg, .png, .webp et .pdf sont acceptés."
    )
    .nullable()
    .optional(),
});

interface AddDriverFormProps {
  onDriverAdded?: (driver: Driver) => void;
  buttonText?: string;
}

// Interface pour les entreprises
interface Company {
  id: string;
  name: string;
}

// Définir le type VehicleType basé sur l'enum de la base de données
type VehicleType = Database["public"]["Enums"]["vehicle_type"];

export function AddDriverForm({ onDriverAdded, buttonText = "Ajouter un chauffeur" }: AddDriverFormProps) {
  const [open, setOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [permisPreview, setPermisPreview] = useState<string | null>(null);
  const [carteVTCPreview, setCarteVTCPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  
  // Chargement des entreprises depuis Supabase
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
          setCompanies(data || []);
        }
      } catch (err) {
        console.error("Exception lors du chargement des entreprises:", err);
        toast.error("Erreur lors du chargement des entreprises");
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    
    if (open) {
      fetchCompanies();
    }
  }, [open]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      entrepriseId: "",
      disponible: true,
      photo: undefined,
      permisConduire: undefined,
      carteVTC: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue(field as any, file);
      
      // Ne pas créer de prévisualisation pour les PDF
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (field === 'photo') {
            setPhotoPreview(reader.result as string);
          } else if (field === 'permisConduire') {
            setPermisPreview(reader.result as string);
          } else if (field === 'carteVTC') {
            setCarteVTCPreview(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // Pour les PDF, on utilise juste une icône
        if (field === 'permisConduire') {
          setPermisPreview('/placeholder.svg'); // Utiliser une icône PDF
        } else if (field === 'carteVTC') {
          setCarteVTCPreview('/placeholder.svg'); // Utiliser une icône PDF
        }
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Création d'un nouvel ID chauffeur
      const newDriverId = `C-${Math.floor(1000 + Math.random() * 9000)}`;
      
      let photoUrl = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=300&h=300&fit=crop"; // Photo par défaut
      
      // Télécharger la photo si disponible
      if (values.photo) {
        const file = values.photo;
        const fileExt = file.name.split('.').pop();
        const fileName = `${newDriverId}-photo-${Date.now()}.${fileExt}`;
        
        try {
          // Téléchargement de la photo sur Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('drivers_documents')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            console.error("Erreur lors du téléchargement de la photo:", uploadError);
            toast.error("Impossible de télécharger la photo");
          } else if (uploadData) {
            // Récupérer l'URL publique de la photo
            const { data: urlData } = supabase.storage
              .from('drivers_documents')
              .getPublicUrl(fileName);
            
            if (urlData) {
              photoUrl = urlData.publicUrl;
            }
          }
        } catch (error) {
          console.error("Exception lors du téléchargement de la photo:", error);
          toast.error("Erreur lors du téléchargement de la photo");
        }
      }
      
      // Préparation des données du chauffeur pour l'insertion dans la base de données
      const driverData = {
        id_chauffeur: newDriverId,
        nom: values.nom,
        prenom: values.prenom,
        email: values.email,
        telephone: values.telephone,
        piece_identite: `ID${Math.floor(10000000 + Math.random() * 90000000)}`,
        certificat_medical: `CM${Math.floor(10000000 + Math.random() * 90000000)}`,
        justificatif_domicile: `JD${Math.floor(10000000 + Math.random() * 90000000)}`,
        date_debut_activite: values.dateDebutActivite.toISOString().split('T')[0],
        note_chauffeur: 0,
        photo: photoUrl,
        id_entreprise: values.entrepriseId,
        disponible: values.disponible,
      };
      
      console.log("Insertion du chauffeur:", driverData);
      
      // Insérer le chauffeur dans la base de données
      const { data: insertedDriver, error: insertError } = await supabase
        .from('drivers')
        .insert(driverData)
        .select('id')
        .single();
      
      if (insertError) {
        console.error("Erreur lors de l'insertion du chauffeur:", insertError);
        toast.error("Impossible d'ajouter le chauffeur à la base de données");
        setIsSubmitting(false);
        return;
      }
      
      // Ajouter les types de véhicules associés au chauffeur
      if (selectedVehicleTypes.length > 0 && insertedDriver) {
        const driverId = insertedDriver.id;
        
        // Convertir les strings en valeurs de l'enum
        const vehicleTypeAssociations = selectedVehicleTypes.map(type => ({
          driver_id: driverId,
          vehicle_type: type as VehicleType
        }));
        
        const { error: vehicleTypesError } = await supabase
          .from('driver_vehicle_types')
          .insert(vehicleTypeAssociations);
          
        if (vehicleTypesError) {
          console.error("Erreur lors de l'ajout des types de véhicules:", vehicleTypesError);
          toast.error("Erreur lors de l'association des types de véhicules");
        }
      }
      
      // Création du nouvel objet chauffeur pour l'interface
      const newDriver: Driver = {
        ID_Chauffeur: newDriverId,
        Nom: values.nom,
        Prénom: values.prenom,
        Email: values.email,
        Téléphone: values.telephone,
        Pièce_Identité: `ID${Math.floor(10000000 + Math.random() * 90000000)}`,
        Certificat_Médical: `CM${Math.floor(10000000 + Math.random() * 90000000)}`,
        Justificatif_Domicile: `JD${Math.floor(10000000 + Math.random() * 90000000)}`,
        Date_Debut_Activité: values.dateDebutActivite,
        Note_Chauffeur: 0, // Pas encore noté
        Missions_Futures: [],
        Photo: photoUrl,
        ID_Entreprise: values.entrepriseId,
        Disponible: values.disponible,
      };
      
      // Appel de la callback pour ajouter le chauffeur
      if (onDriverAdded) {
        onDriverAdded(newDriver);
      }
      
      toast.success("Chauffeur ajouté avec succès", {
        description: `${values.prenom} ${values.nom} a été ajouté à l'équipe.`,
      });
      
      setPhotoPreview(null);
      setPermisPreview(null);
      setCarteVTCPreview(null);
      setSelectedVehicleTypes([]);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du chauffeur:", error);
      toast.error("Une erreur est survenue lors de l'ajout du chauffeur");
    }
    
    setIsSubmitting(false);
  }

  const FileUploadField = ({ name, label, accept, preview, iconClass }: { name: string, label: string, accept: string, preview: string | null, iconClass?: string }) => (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field: { value, onChange, ...fieldProps } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Input
                id={name}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => handleFileChange(e, name)}
                {...fieldProps}
              />
              <label htmlFor={name} className="cursor-pointer h-full">
                {preview ? (
                  <div className="flex justify-center">
                    {preview.startsWith('data:image/') ? (
                      <img 
                        src={preview} 
                        alt={`Aperçu ${name}`} 
                        className="object-cover h-24 rounded-md" 
                      />
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm">Document téléchargé</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <UploadCloud className={`h-8 w-8 text-gray-400 ${iconClass || ''}`} />
                    <span className="text-xs text-gray-500">
                      Glissez et déposez ou cliquez pour sélectionner
                    </span>
                    <span className="text-xs text-gray-400">
                      PNG, JPG, WEBP, PDF (max 5MB)
                    </span>
                  </div>
                )}
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau chauffeur</DialogTitle>
          <DialogDescription>
            Entrez les informations du nouveau chauffeur à ajouter à votre équipe.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colonne de gauche - Informations personnelles */}
              <div className="space-y-4">
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
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateDebutActivite"
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
                    name="entrepriseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entreprise</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une entreprise" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingCompanies ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                                Chargement...
                              </div>
                            ) : companies.length === 0 ? (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                Aucune entreprise disponible
                              </div>
                            ) : (
                              companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
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
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Photo du chauffeur (format paysage)</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                          <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'photo')}
                            {...fieldProps}
                          />
                          <label htmlFor="photo" className="cursor-pointer h-full">
                            {photoPreview ? (
                              <div className="flex justify-center">
                                <AspectRatio ratio={16/9} className="w-full">
                                  <img 
                                    src={photoPreview} 
                                    alt="Aperçu" 
                                    className="object-cover w-full h-full rounded-md" 
                                  />
                                </AspectRatio>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center space-y-4 h-full justify-center py-10">
                                <UploadCloud className="h-16 w-16 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  Glissez et déposez une image ou cliquez pour sélectionner
                                </span>
                                <span className="text-xs text-gray-400">
                                  PNG, JPG, WEBP (max 5MB)
                                </span>
                                <span className="text-xs text-gray-400 mt-2">
                                  Format paysage recommandé (16:9)
                                </span>
                              </div>
                            )}
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUploadField 
                    name="permisConduire" 
                    label="Permis de conduire" 
                    accept="image/*,application/pdf" 
                    preview={permisPreview} 
                  />

                  <FileUploadField 
                    name="carteVTC" 
                    label="Carte VTC" 
                    accept="image/*,application/pdf" 
                    preview={carteVTCPreview}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6 pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
