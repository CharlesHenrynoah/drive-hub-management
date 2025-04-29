
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

const formSchema = z.object({
  marque: z.string().min(2, {
    message: "La marque doit contenir au moins 2 caractères",
  }),
  modele: z.string().min(2, {
    message: "Le modèle doit contenir au moins 2 caractères",
  }),
  immatriculation: z.string().min(5, {
    message: "L'immatriculation doit être valide",
  }),
  typeVehicule: z.string({
    required_error: "Veuillez sélectionner un type de véhicule",
  }),
  typeCarburant: z.string({
    required_error: "Veuillez sélectionner un type de carburant",
  }),
  entrepriseId: z.string({
    required_error: "Veuillez sélectionner une entreprise",
  }),
});

export function AddVehicleForm() {
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marque: "",
      modele: "",
      immatriculation: "",
      typeVehicule: "",
      typeCarburant: "",
      entrepriseId: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Ici vous enverriez normalement les données à votre API
    console.log(values);
    
    toast.success("Véhicule ajouté avec succès", {
      description: `${values.marque} ${values.modele} a été ajouté à la flotte.`,
    });
    
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Ajouter un véhicule</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau véhicule</DialogTitle>
          <DialogDescription>
            Entrez les informations du nouveau véhicule à ajouter à votre flotte.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="marque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marque</FormLabel>
                    <FormControl>
                      <Input placeholder="Renault, Peugeot..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modele"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modèle</FormLabel>
                    <FormControl>
                      <Input placeholder="Master, 508..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="immatriculation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Immatriculation</FormLabel>
                  <FormControl>
                    <Input placeholder="AB-123-CD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="typeVehicule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de véhicule</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Utilitaire">Utilitaire</SelectItem>
                        <SelectItem value="Berline">Berline</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Minibus">Minibus</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="typeCarburant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de carburant</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Essence">Essence</SelectItem>
                        <SelectItem value="Electrique">Électrique</SelectItem>
                        <SelectItem value="Hybride">Hybride</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
