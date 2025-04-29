
import { useState, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Driver } from "@/types/driver";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, UploadCloud } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
});

interface AddDriverFormProps {
  onDriverAdded?: (driver: Driver) => void;
  buttonText?: string;
}

export function AddDriverForm({ onDriverAdded, buttonText = "Ajouter un chauffeur" }: AddDriverFormProps) {
  const [open, setOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
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
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      form.setValue("photo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [form, setPhotoPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("photo", file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Création d'un nouvel ID chauffeur (dans un vrai système, cela serait géré par la base de données)
    const newDriverId = `C-${Math.floor(1000 + Math.random() * 9000)}`;
    
    let photoUrl = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=300&h=300&fit=crop"; // Photo par défaut
    
    if (photoPreview) {
      photoUrl = photoPreview;
    }
    
    // Création du nouvel objet chauffeur
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
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau chauffeur</DialogTitle>
          <DialogDescription>
            Entrez les informations du nouveau chauffeur à ajouter à votre équipe.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectItem value="E-001">Ville de Paris</SelectItem>
                        <SelectItem value="E-002">Académie de Lyon</SelectItem>
                        <SelectItem value="E-003">Transport Express</SelectItem>
                        <SelectItem value="E-004">LogiMobile</SelectItem>
                        <SelectItem value="E-005">Société ABC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                        onChange={handleFileChange}
                        {...fieldProps}
                      />
                      <label htmlFor="photo" className="cursor-pointer">
                        {photoPreview ? (
                          <div className="flex justify-center">
                            <img 
                              src={photoPreview} 
                              alt="Aperçu" 
                              className="object-cover w-full h-40 rounded-md aspect-[16/9]" 
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-2">
                            <UploadCloud className="h-10 w-10 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              Glissez et déposez une image ou cliquez pour sélectionner
                            </span>
                            <span className="text-xs text-gray-400">
                              PNG, JPG, WEBP (max 5MB)
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
            
            <FormField
              control={form.control}
              name="disponible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Disponibilité</FormLabel>
                    <FormDescription>
                      Définir si le chauffeur est disponible pour des missions
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Ajouter</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
