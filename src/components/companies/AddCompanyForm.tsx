
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  nom: z.string().min(3, {
    message: "Le nom doit contenir au moins 3 caractères",
  }),
  adresse: z.string().min(10, {
    message: "L'adresse doit être complète",
  }).optional(),
  contactPrincipal: z.string().min(3, {
    message: "Le nom du contact principal est requis",
  }).optional(),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide",
  }).optional(),
  telephone: z.string().min(8, {
    message: "Veuillez entrer un numéro de téléphone valide",
  }).optional(),
  logoFile: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `La taille maximum du fichier est de 5MB`)
    .refine(file => ALLOWED_FILE_TYPES.includes(file.type), 'Seuls les fichiers .jpg, .png et .webp sont acceptés')
    .optional(),
});

interface AddCompanyFormProps {
  onCompanyAdded?: () => void;
}

export function AddCompanyForm({ onCompanyAdded }: AddCompanyFormProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      adresse: "",
      contactPrincipal: "",
      email: "",
      telephone: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validate file size and type
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`La taille maximum du fichier est de 5MB`);
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Seuls les fichiers .jpg, .png et .webp sont acceptés');
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Set the file in the form
    form.setValue("logoFile", file);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setUploading(true);
      
      let logoUrl = null;
      
      // Upload logo if provided
      if (values.logoFile) {
        const fileExt = values.logoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('company_logos')
          .upload(filePath, values.logoFile);
          
        if (uploadError) {
          throw new Error(`Erreur lors du téléchargement du logo: ${uploadError.message}`);
        }
        
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('company_logos')
          .getPublicUrl(filePath);
          
        logoUrl = publicUrl;
      }
      
      // Insert company data into Supabase
      const { error } = await supabase
        .from('companies')
        .insert({
          id: `E-${Math.floor(Math.random() * 1000)}`,
          name: values.nom,
          logo_url: logoUrl
        });
        
      if (error) {
        throw new Error(`Erreur lors de l'ajout de l'entreprise: ${error.message}`);
      }
      
      toast.success("Entreprise ajoutée avec succès", {
        description: `L'entreprise "${values.nom}" a été créée.`,
      });
      
      // Clean up
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      form.reset();
      setOpen(false);
      
      // Notify parent component
      if (onCompanyAdded) {
        onCompanyAdded();
      }
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error("Erreur lors de l'ajout de l'entreprise", {
        description: error instanceof Error ? error.message : "Une erreur inattendue s'est produite",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Ajouter une entreprise</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle entreprise</DialogTitle>
          <DialogDescription>
            Créez un nouveau compte entreprise partenaire.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Logo Upload */}
            <div className="flex flex-col items-center space-y-3 py-4">
              <Avatar className="h-24 w-24">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt="Logo preview" />
                ) : (
                  <AvatarFallback className="text-xl">Logo</AvatarFallback>
                )}
              </Avatar>
              
              <FormItem>
                <FormLabel className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 text-sm text-primary">
                    <Upload size={16} />
                    <span>Télécharger un logo</span>
                  </div>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </FormLabel>
                <FormMessage />
              </FormItem>
            </div>
            
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'entreprise</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'entreprise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adresse complète de l'entreprise" 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactPrincipal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact principal</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom et prénom du contact" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemple.fr" type="email" {...field} />
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
                      <Input placeholder="01 23 45 67 89" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={uploading}>
                Annuler
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <span>Ajouter</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
