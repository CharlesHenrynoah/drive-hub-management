
import { useState, useEffect } from "react";
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
import { calculateEcologicalScore } from "@/utils/ecologicalScoreCalculator";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

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
  typeVehicule: z.enum(["Mini Bus", "Bus"], {
    required_error: "Veuillez sélectionner un type de véhicule",
  }),
  typeCarburant: z.string({
    required_error: "Veuillez sélectionner un type de carburant",
  }),
  entrepriseId: z.string({
    required_error: "Veuillez sélectionner une entreprise",
  }),
  capacite: z.coerce.number().min(1, {
    message: "La capacité doit être d'au moins 1 passager",
  }),
  annee: z.coerce.number().optional(),
  kilometrage: z.coerce.number().optional(),
});

export function AddVehicleForm() {
  const [open, setOpen] = useState(false);
  const [ecologicalScore, setEcologicalScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marque: "",
      modele: "",
      immatriculation: "",
      typeVehicule: "Mini Bus",
      typeCarburant: "",
      entrepriseId: "",
      capacite: 15,
      kilometrage: 0,
    },
  });

  useEffect(() => {
    // Fetch companies from Supabase
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }
      
      if (data) {
        setCompanies(data);
      }
    };
    
    fetchCompanies();
  }, []);

  // Calculate ecological score when relevant form values change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only recalculate when these specific fields change
      if (["typeVehicule", "typeCarburant", "capacite", "annee"].includes(name || "")) {
        calculateScore();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const calculateScore = async () => {
    const values = form.getValues();
    
    // Only calculate if we have the minimum required data
    if (values.typeVehicule && values.typeCarburant && values.capacite) {
      setIsCalculating(true);
      
      try {
        const score = await calculateEcologicalScore({
          type: values.typeVehicule,
          fuel: values.typeCarburant,
          capacity: values.capacite,
          year: values.annee
        });
        
        setEcologicalScore(score);
      } catch (error) {
        console.error("Error calculating ecological score:", error);
      } finally {
        setIsCalculating(false);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    try {
      // Save vehicle to Supabase
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          brand: values.marque,
          model: values.modele,
          registration: values.immatriculation,
          type: values.typeVehicule,
          fuel_type: values.typeCarburant,
          company_id: values.entrepriseId,
          capacity: values.capacite,
          year: values.annee || null,
          mileage: values.kilometrage || 0,
          ecological_score: ecologicalScore || 50,
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success("Véhicule ajouté avec succès", {
        description: `${values.marque} ${values.modele} a été ajouté à la flotte.`,
      });
      
      form.reset();
      setEcologicalScore(null);
      setOpen(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error("Erreur lors de l'ajout du véhicule", {
        description: "Veuillez réessayer ou contacter l'assistance.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const getScoreColorClass = (score: number | null) => {
    if (score === null) return "bg-gray-300";
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-info";
    return "bg-warning";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Ajouter un véhicule</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau véhicule</DialogTitle>
          <DialogDescription>
            Entrez les informations du nouveau véhicule à ajouter à votre flotte.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Colonne de gauche */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marque</FormLabel>
                        <FormControl>
                          <Input placeholder="Renault, Mercedes..." {...field} />
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
                          <Input placeholder="Travego, Urbanway..." {...field} />
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
                            <SelectItem value="Mini Bus">Mini Bus</SelectItem>
                            <SelectItem value="Bus">Bus</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="capacite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacité (passagers)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={1} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Colonne de droite */}
              <div className="space-y-4">
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
                          <SelectItem value="GNV">GNV (Gaz Naturel)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="annee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Année de fabrication</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Ex: 2022" 
                            min={1990} 
                            max={new Date().getFullYear()}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="kilometrage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kilométrage parcouru</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Ex: 50000" 
                            min={0}
                            {...field} 
                          />
                        </FormControl>
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
                
                <div className="space-y-2">
                  <FormLabel>Score écologique</FormLabel>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Progress 
                        value={ecologicalScore ?? 0} 
                        max={100}
                        className={`h-2 ${getScoreColorClass(ecologicalScore)}`} 
                      />
                    </div>
                    <div className="w-10 text-center font-medium">
                      {isCalculating ? "..." : ecologicalScore ?? "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Enregistrement..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
