
import { useState } from "react";
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
  experience: z.string().min(1, {
    message: "Veuillez renseigner l'expérience",
  }),
  entrepriseId: z.string({
    required_error: "Veuillez sélectionner une entreprise",
  }),
  disponible: z.boolean().default(true),
});

interface AddDriverFormProps {
  onDriverAdded?: (driver: Driver) => void;
  buttonText?: string;
}

export function AddDriverForm({ onDriverAdded, buttonText = "Ajouter un chauffeur" }: AddDriverFormProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      experience: "",
      entrepriseId: "",
      disponible: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Création d'un nouvel ID chauffeur (dans un vrai système, cela serait géré par la base de données)
    const newDriverId = `C-${Math.floor(1000 + Math.random() * 9000)}`;
    
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
      Expérience: parseInt(values.experience),
      Note_Chauffeur: 0, // Pas encore noté
      Missions_Futures: [],
      Photo: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=300&h=300&fit=crop", // Photo par défaut
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
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expérience (années)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
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
