
import { useState, useEffect, useRef } from "react";
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
import { Vehicle } from "./VehiclesManagement";
import { Image, Upload } from "lucide-react";
import { DatePicker } from "../ui/date-picker";
import { Switch } from "@/components/ui/switch";

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
  placesAssises: z.coerce.number().min(0, {
    message: "Le nombre de places assises doit être positif",
  }),
  placesDebout: z.coerce.number().min(0, {
    message: "Le nombre de places debout doit être positif",
  }),
  accessibilitePMR: z.boolean().default(false),
  annee: z.coerce.number().optional(),
  kilometrage: z.coerce.number().optional(),
  photoUrl: z.string({
    required_error: "Une photo du véhicule est obligatoire",
  }),
  dernierEntretien: z.date().optional(),
  prochainEntretien: z.date().optional(),
});

interface AddVehicleFormProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  vehicleToEdit?: Vehicle | null;
  onSuccess?: () => void;
}

export function AddVehicleForm({ isOpen, onOpenChange, vehicleToEdit, onSuccess }: AddVehicleFormProps) {
  const [open, setOpen] = useState(isOpen || false);
  const [ecologicalScore, setEcologicalScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!vehicleToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marque: vehicleToEdit?.brand || "",
      modele: vehicleToEdit?.model || "",
      immatriculation: vehicleToEdit?.registration || "",
      typeVehicule: (vehicleToEdit?.type as "Mini Bus" | "Bus") || "Mini Bus",
      typeCarburant: vehicleToEdit?.fuel_type || "",
      entrepriseId: vehicleToEdit?.company_id || "",
      capacite: vehicleToEdit?.capacity || 15,
      placesAssises: Math.floor((vehicleToEdit?.capacity || 15) * 0.9) || 13,
      placesDebout: Math.floor((vehicleToEdit?.capacity || 15) * 0.1) || 1,
      accessibilitePMR: vehicleToEdit?.type === "Bus" || false,
      kilometrage: vehicleToEdit?.mileage || 0,
      annee: vehicleToEdit?.year || undefined,
      photoUrl: vehicleToEdit?.photo_url || "",
      dernierEntretien: vehicleToEdit?.last_maintenance ? new Date(vehicleToEdit.last_maintenance) : new Date(),
      prochainEntretien: vehicleToEdit?.last_maintenance ? 
        new Date(new Date(vehicleToEdit.last_maintenance).setMonth(new Date(vehicleToEdit.last_maintenance).getMonth() + 6)) : 
        new Date(new Date().setMonth(new Date().getMonth() + 6)),
    },
  });

  // Function to update total capacity based on seated and standing
  const updateCapacity = () => {
    const values = form.getValues();
    const totalCapacity = (values.placesAssises || 0) + (values.placesDebout || 0);
    if (totalCapacity > 0) {
      form.setValue("capacite", totalCapacity);
    }
  };

  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    if (vehicleToEdit) {
      const lastMaintenance = vehicleToEdit.last_maintenance ? new Date(vehicleToEdit.last_maintenance) : new Date();
      const nextMaintenance = new Date(lastMaintenance);
      nextMaintenance.setMonth(nextMaintenance.getMonth() + 6);

      form.reset({
        marque: vehicleToEdit.brand,
        modele: vehicleToEdit.model,
        immatriculation: vehicleToEdit.registration,
        typeVehicule: vehicleToEdit.type as "Mini Bus" | "Bus",
        typeCarburant: vehicleToEdit.fuel_type,
        entrepriseId: vehicleToEdit.company_id || "",
        capacite: vehicleToEdit.capacity,
        placesAssises: Math.floor(vehicleToEdit.capacity * 0.9),
        placesDebout: Math.floor(vehicleToEdit.capacity * 0.1),
        accessibilitePMR: vehicleToEdit.type === "Bus",
        kilometrage: vehicleToEdit.mileage || 0,
        annee: vehicleToEdit.year || undefined,
        photoUrl: vehicleToEdit.photo_url || "",
        dernierEntretien: lastMaintenance,
        prochainEntretien: nextMaintenance,
      });
      setPreviewImage(vehicleToEdit.photo_url || null);
      setEcologicalScore(vehicleToEdit.ecological_score || null);
    }
  }, [vehicleToEdit, form]);

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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    if (!newOpen && !isEditing) {
      // Reset form when dialog is closed, but only if we're not editing
      form.reset();
      setEcologicalScore(null);
      setPreviewImage(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleFileChange = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    
    // For demo purposes, we're just using the URL
    // In a real app, you would upload the file to storage
    form.setValue("photoUrl", url);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    try {
      // In a real application, you would upload the image to storage here
      // and then save the URL to the database
      
      if (isEditing && vehicleToEdit) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update({
            brand: values.marque,
            model: values.modele,
            registration: values.immatriculation,
            type: values.typeVehicule,
            fuel_type: values.typeCarburant,
            company_id: values.entrepriseId,
            capacity: values.capacite,
            year: values.annee || null,
            mileage: values.kilometrage || 0,
            ecological_score: ecologicalScore || vehicleToEdit.ecological_score || 50,
            photo_url: values.photoUrl,
            last_maintenance: values.dernierEntretien?.toISOString().split('T')[0] || null,
            updated_at: new Date().toISOString(),
            // Add custom properties for specific vehicle types as a JSON field in the database
            // or use a normalized data model with separate tables in a real app
          })
          .eq('id', vehicleToEdit.id);

        if (error) throw error;
        
        toast.success("Véhicule mis à jour avec succès", {
          description: `${values.marque} ${values.modele} a été mis à jour.`,
        });
      } else {
        // Add new vehicle
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
            photo_url: values.photoUrl,
            last_maintenance: values.dernierEntretien?.toISOString().split('T')[0] || null,
          })
          .select();

        if (error) throw error;
        
        toast.success("Véhicule ajouté avec succès", {
          description: `${values.marque} ${values.modele} a été ajouté à la flotte.`,
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleOpenChange(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error(isEditing ? "Erreur lors de la mise à jour du véhicule" : "Erreur lors de l'ajout du véhicule", {
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button>Ajouter un véhicule</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le véhicule" : "Ajouter un nouveau véhicule"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Modifiez les informations du véhicule."
              : "Entrez les informations du nouveau véhicule à ajouter à votre flotte."}
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
                        <FormLabel>Capacité totale (passagers)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={1} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo du véhicule</FormLabel>
                      <FormControl>
                        <div 
                          className={`border-2 border-dashed rounded-md p-6 h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                            isDragging ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
                          }`}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={handleBrowseClick}
                        >
                          {previewImage ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={previewImage} 
                                alt="Aperçu du véhicule" 
                                className="h-full w-full object-contain rounded-md"
                                onError={() => {
                                  setPreviewImage("https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop");
                                }} 
                              />
                            </div>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">
                                Glissez et déposez une image ici, ou cliquez pour parcourir
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, GIF jusqu'à 5MB
                              </p>
                            </>
                          )}
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileInputChange}
                            aria-label="Sélectionner une image"
                          />
                          <input 
                            type="hidden" 
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-3 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Spécifications du véhicule</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="placesAssises"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Places assises</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              min={0}
                              onChange={(e) => {
                                field.onChange(e);
                                setTimeout(updateCapacity, 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="placesDebout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Places debout</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              min={0}
                              onChange={(e) => {
                                field.onChange(e);
                                setTimeout(updateCapacity, 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="accessibilitePMR"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Accessibilité PMR</FormLabel>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dernierEntretien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dernier entretien</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={(date) => field.onChange(date)}
                          placeholder="Sélectionnez une date"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="prochainEntretien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prochain entretien</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={(date) => field.onChange(date)}
                          placeholder="Sélectionnez une date"
                        />
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
              <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (isEditing ? "Mise à jour..." : "Enregistrement...") : (isEditing ? "Mettre à jour" : "Ajouter")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
