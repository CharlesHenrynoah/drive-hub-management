
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Driver } from "@/types/driver";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useDriverVehicleTypes } from "@/hooks/useDriverVehicleTypes";
import { FileText, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DriverDetailModalProps {
  driver: Driver;
  onEdit: () => void;
  onClose: () => void;
}

export function DriverDetailModal({ driver, onEdit, onClose }: DriverDetailModalProps) {
  const { vehicleTypes, isLoading: isLoadingVehicleTypes } = useDriverVehicleTypes(driver.id);
  
  // Fetch company name
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["company", driver.id_entreprise],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("name")
        .eq("id", driver.id_entreprise)
        .single();
        
      if (error) {
        console.error("Error fetching company:", error);
        return null;
      }
      
      return data;
    },
  });
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Détails du chauffeur</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 pr-4">
            {driver.photo && (
              <div className="col-span-2 flex justify-center mb-4">
                <img 
                  src={driver.photo} 
                  alt={`${driver.prenom} ${driver.nom}`} 
                  className="max-h-[200px] object-contain rounded-full"
                />
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">ID Chauffeur</p>
              <p className="font-medium">{driver.id_chauffeur}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Nom</p>
              <p className="font-medium">{driver.nom}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Prénom</p>
              <p className="font-medium">{driver.prenom}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{driver.email}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <p className="font-medium">{driver.telephone}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Ville</p>
              <p className="font-medium">{driver.ville || "Non spécifié"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Date de début d'activité</p>
              <p className="font-medium">{new Date(driver.date_debut_activite).toLocaleDateString()}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Note</p>
              <p className="font-medium">{driver.note_chauffeur}/5</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Disponibilité</p>
              <p className="font-medium">{driver.disponible ? "Disponible" : "Indisponible"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Entreprise</p>
              {isLoadingCompany ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-sm text-muted-foreground">Chargement...</span>
                </div>
              ) : company ? (
                <p className="font-medium">{company.name}</p>
              ) : (
                <p className="font-medium">{driver.id_entreprise}</p>
              )}
            </div>

            <div className="col-span-2">
              <Separator className="my-4" />
              <h3 className="font-medium mb-2">Types de véhicules</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {isLoadingVehicleTypes ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </div>
                ) : vehicleTypes && vehicleTypes.length > 0 ? (
                  vehicleTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun type de véhicule associé</p>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <Separator className="my-4" />
              <h3 className="font-medium mb-2">Documents</h3>
            </div>
            
            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1.5 rounded-t-lg inline-block mb-0">Permis de conduire</h4>
                <div className="border border-gray-200 rounded-md rounded-tl-none shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 h-14 w-14 rounded-lg bg-blue-50 flex items-center justify-center border-2 border-blue-100">
                      <FileText className="h-7 w-7 text-blue-500" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-sm mb-1 text-gray-800 truncate">
                        {driver.piece_identite || "Aucun document"}
                      </p>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-full" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Document vérifié</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1.5 rounded-t-lg inline-block mb-0">Carte VTC</h4>
                <div className="border border-gray-200 rounded-md rounded-tl-none shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 h-14 w-14 rounded-lg bg-blue-50 flex items-center justify-center border-2 border-blue-100">
                      <FileText className="h-7 w-7 text-blue-500" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-sm mb-1 text-gray-800 truncate">
                        {driver.certificat_medical || "Aucun document"}
                      </p>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-full" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Document vérifié</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-2 flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button onClick={onEdit}>
                Modifier
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
