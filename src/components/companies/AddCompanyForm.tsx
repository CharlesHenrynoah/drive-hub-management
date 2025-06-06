
import { useState, useRef } from "react";
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
  buttonText?: string;
}

export function AddCompanyForm({ onCompanyAdded, buttonText = "Ajouter une entreprise" }: AddCompanyFormProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        console.log("Uploading file to path:", filePath);
        
        const { error: uploadError, data } = await supabase.storage
          .from('company_logos')
          .upload(filePath, values.logoFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Erreur lors du téléchargement du logo: ${uploadError.message}`);
        }
        
        console.log("Upload successful:", data);
        
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('company_logos')
          .getPublicUrl(filePath);
          
        logoUrl = publicUrl;
        console.log("Logo URL:", logoUrl);
      }
      
      // Générer un ID unique pour l'entreprise
      const companyId = `E-${Math.floor(Math.random() * 10000)}`;
      
      // Insert company data into Supabase with all form fields
      const { error } = await supabase
        .from('companies')
        .insert({
          id: companyId,
          name: values.nom,
          logo_url: logoUrl,
          // Ajout des coordonnées de l'entreprise
          address: values.adresse,
          contact_name: values.contactPrincipal,
          email: values.email,
          phone: values.telephone
        });
        
      if (error) {
        console.error("Insert error:", error);
        throw new Error(`Erreur lors de l'ajout de l'entreprise: ${error.message}`);
      }
      
      toast.success("Entreprise ajoutée avec succès", {
        description: `L'entreprise "${values.nom}" a été créée avec toutes ses coordonnées.`,
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
        <Button>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle entreprise</DialogTitle>
          <DialogDescription>
            Créez un nouveau compte entreprise partenaire.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Logo Upload Section - Left Column */}
              <div className="flex flex-col items-center justify-start space-y-4 pt-2">
                <div className="text-center">
                  <div className="mx-auto bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mb-4">
                    {previewUrl ? (
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={previewUrl} alt="Logo preview" />
                        <AvatarFallback className="text-lg">Logo</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="text-lg text-gray-400">Logo</div>
                    )}
                  </div>
                  
                  <div onClick={handleFileClick} className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 text-sm text-primary">
                      <Upload size={16} />
                      <span>Télécharger un logo</span>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </div>
                  </div>
                  <FormMessage />
                </div>
              </div>
              
              {/* Company Information - Middle and Right Columns */}
              <div className="col-span-2">
                <div className="space-y-4">
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
                  
                  <div className="grid grid-cols-2 gap-4">
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
                    name="adresse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Adresse complète de l'entreprise" 
                            className="min-h-[60px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
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
