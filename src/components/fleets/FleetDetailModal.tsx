
import { useEffect, useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Fleet } from "./FleetsManagement";

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

  useEffect(() => {
    async function fetchFleetDetails() {
      try {
        setLoading(true);
        
        // Fetch vehicles for this fleet
        const { data: fleetVehiclesData, error: fleetVehiclesError } = await supabase
          .from('fleet_vehicles')
          .select('vehicle_id')
          .eq('fleet_id', fleet.id);
          
        if (fleetVehiclesError) {
          console.error('Error fetching fleet vehicles:', fleetVehiclesError);
          return;
        }
        
        if (fleetVehiclesData && fleetVehiclesData.length > 0) {
          const vehicleIds = fleetVehiclesData.map(item => item.vehicle_id);
          
          const { data: vehiclesData, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('id, registration, brand, model')
            .in('id', vehicleIds);
            
          if (vehiclesError) {
            console.error('Error fetching vehicles:', vehiclesError);
          } else {
            setVehicles(vehiclesData || []);
          }
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
        
        if (fleetDriversData && fleetDriversData.length > 0) {
          const driverIds = fleetDriversData.map(item => item.driver_id);
          
          const { data: driversData, error: driversError } = await supabase
            .from('drivers')
            .select('id, id_chauffeur, nom, prenom')
            .in('id', driverIds);
            
          if (driversError) {
            console.error('Error fetching drivers:', driversError);
          } else {
            setDrivers(driversData || []);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFleetDetails();
  }, [fleet.id]);

  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-xl">{fleet.name}</DialogTitle>
        <DialogDescription>
          {fleet.id.substring(0, 8)}... - {companies[fleet.company_id] || fleet.company_id}
        </DialogDescription>
      </DialogHeader>
      
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
            <h3 className="text-sm font-medium text-muted-foreground">Liste des véhicules</h3>
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
            <h3 className="text-sm font-medium text-muted-foreground">Liste des chauffeurs</h3>
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
    </DialogContent>
  );
}
