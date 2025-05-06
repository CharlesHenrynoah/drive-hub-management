
import { useEffect, useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Fleet } from "./FleetsManagement";
import { EditFleetForm } from "./EditFleetForm";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
}

interface Driver {
  id: string;
  id_chauffeur: string;
  nom: string;
  prenom: string;
}

interface FleetDetailModalProps {
  fleet: Fleet;
  companies: Record<string, string>;
  onUpdate?: () => void;
}

export function FleetDetailModal({ fleet, companies, onUpdate }: FleetDetailModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchFleetDetails() {
      try {
        setLoading(true);
        console.log("Fetching details for fleet ID:", fleet.id);
        
        // Fetch vehicles for this fleet
        const { data: fleetVehiclesData, error: fleetVehiclesError } = await supabase
          .from('fleet_vehicles')
          .select('vehicle_id')
          .eq('fleet_id', fleet.id);
          
        if (fleetVehiclesError) {
          console.error('Error fetching fleet vehicles:', fleetVehiclesError);
          return;
        }
        
        console.log("Fleet vehicles data:", fleetVehiclesData);
        
        if (fleetVehiclesData && fleetVehiclesData.length > 0) {
          const vehicleIds = fleetVehiclesData.map(item => item.vehicle_id);
          console.log("Vehicle IDs:", vehicleIds);
          
          const { data: vehiclesData, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('id, registration, brand, model')
            .in('id', vehicleIds);
            
          if (vehiclesError) {
            console.error('Error fetching vehicles:', vehiclesError);
          } else {
            console.log("Vehicles data:", vehiclesData);
            setVehicles(vehiclesData || []);
          }
        } else {
          console.log("No vehicles found for this fleet");
        }
        
        // Fetch drivers for this fleet
        const { data: fleetDriversData, error: fleetDriversError } = await supabase
          .from('fleet_drivers')
          .select('driver_id')
          .eq('fleet_id', fleet.id);
          
        if (fleetDriversError) {
          console.error('Error fetching fleet drivers:', fleetDriversError);
          return;
        }
        
        console.log("Fleet drivers data:", fleetDriversData);
        
        if (fleetDriversData && fleetDriversData.length > 0) {
          const driverIds = fleetDriversData.map(item => item.driver_id);
          console.log("Driver IDs:", driverIds);
          
          const { data: driversData, error: driversError } = await supabase
            .from('drivers')
            .select('id, id_chauffeur, nom, prenom')
            .in('id', driverIds);
            
          if (driversError) {
            console.error('Error fetching drivers:', driversError);
          } else {
            console.log("Drivers data:", driversData);
            setDrivers(driversData || []);
          }
        } else {
          console.log("No drivers found for this fleet");
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFleetDetails();
  }, [fleet.id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // First delete all fleet_vehicles and fleet_drivers associations
      const { error: vehicleError } = await supabase
        .from('fleet_vehicles')
        .delete()
        .eq('fleet_id', fleet.id);
        
      if (vehicleError) {
        console.error('Error deleting fleet vehicles:', vehicleError);
        toast.error("Erreur lors de la suppression des véhicules associés");
        return;
      }
      
      const { error: driverError } = await supabase
        .from('fleet_drivers')
        .delete()
        .eq('fleet_id', fleet.id);
        
      if (driverError) {
        console.error('Error deleting fleet drivers:', driverError);
        toast.error("Erreur lors de la suppression des chauffeurs associés");
        return;
      }
      
      // Then delete the fleet itself
      const { error } = await supabase
        .from('fleets')
        .delete()
        .eq('id', fleet.id);
        
      if (error) {
        console.error('Error deleting fleet:', error);
        toast.error("Erreur lors de la suppression de la flotte");
        return;
      }
      
      toast.success("Flotte supprimée avec succès");
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isEditing) {
    return (
      <EditFleetForm 
        fleet={fleet} 
        companies={companies} 
        onFleetUpdated={() => {
          setIsEditing(false);
          if (onUpdate) onUpdate();
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl">{fleet.name}</DialogTitle>
        <DialogDescription>
          {fleet.id.substring(0, 8)}... - {companies[fleet.company_id] || fleet.company_id}
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1"
        >
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Chargement des détails...</span>
        </div>
      ) : (
        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Informations générales</h3>
            <Separator className="my-2" />
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">ID</dt>
                <dd>{fleet.id.substring(0, 8)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Entreprise</dt>
                <dd>{companies[fleet.company_id] || 'Entreprise inconnue'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Date de création</dt>
                <dd>{formatDate(fleet.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Dernière modification</dt>
                <dd>{formatDate(fleet.updated_at)}</dd>
              </div>
              <div className="pt-2">
                <dt className="font-medium">Description</dt>
                <dd className="mt-1 text-muted-foreground">{fleet.description || 'Aucune description'}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Liste des véhicules ({vehicles.length})</h3>
            <Separator className="my-2" />
            {vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="bg-secondary/50">
                    <CardContent className="p-3">
                      <div className="font-medium">{vehicle.registration}</div>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.brand} {vehicle.model}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun véhicule associé à cette flotte</p>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Liste des chauffeurs ({drivers.length})</h3>
            <Separator className="my-2" />
            {drivers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {drivers.map((driver) => (
                  <Card key={driver.id} className="bg-secondary/50">
                    <CardContent className="p-3">
                      <div className="font-medium">{driver.prenom} {driver.nom}</div>
                      <Badge variant="outline" className="mt-1">
                        {driver.id_chauffeur}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun chauffeur associé à cette flotte</p>
            )}
          </div>
        </div>
      )}
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette flotte?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement la flotte "{fleet.name}" et toutes ses associations avec les véhicules et chauffeurs.
              Les véhicules et chauffeurs ne seront pas supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContent>
  );
}
