
import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fleet } from "./FleetsManagement";
import { supabase } from "@/integrations/supabase/client";
import { VehicleTypeSelector } from "../vehicles/VehicleTypeSelector";

export function FleetDetailModal({ 
  fleet, 
  companies, 
  onUpdate 
}: { 
  fleet: Fleet; 
  companies: Record<string, string>;
  onUpdate?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fleetDetails, setFleetDetails] = useState<any>(null);
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  
  // Get token for API calls
  async function getApiToken() {
    const { data, error } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('revoked', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      console.error("Error fetching API token:", error);
      throw new Error("Impossible de récupérer un token API");
    }
    
    return data?.api_key;
  }
  
  useEffect(() => {
    async function fetchFleetDetails() {
      try {
        setLoading(true);
        setError(null);
        
        // Get API token
        const token = await getApiToken();
        
        if (!token) {
          setError("Token API non disponible");
          return;
        }
        
        // Fetch fleet details
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/fleets-vehicles/${fleet.id}/vehicles`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        setFleetDetails(data);
        
        // Extract vehicle types from the API response
        if (data.vehicle_types && Array.isArray(data.vehicle_types)) {
          setVehicleTypes(data.vehicle_types);
        }
        
        setVehiclesLoaded(true);
      } catch (err) {
        console.error("Error fetching fleet details:", err);
        setError(`Erreur lors du chargement des détails: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFleetDetails();
  }, [fleet.id]);

  return (
    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Détails de la flotte</DialogTitle>
        <DialogDescription>
          Consultez les véhicules et chauffeurs de cette flotte
        </DialogDescription>
      </DialogHeader>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Chargement des détails...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => {
              setLoading(true);
              setError(null);
              // Re-fetch data
              setTimeout(() => {
                setLoading(false);
                setError("Erreur persistante, veuillez réessayer ultérieurement.");
              }, 1000);
            }}
          >
            Réessayer
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium">Informations générales</h3>
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Nom:</span> {fleet.name}</p>
                <p><span className="font-medium">Entreprise:</span> {fleet.companyName || 'Non spécifiée'}</p>
                <p><span className="font-medium">Description:</span> {fleet.description || 'Aucune description'}</p>
                <p><span className="font-medium">Véhicules:</span> {fleetDetails?.total_vehicles || 0}</p>
                <p><span className="font-medium">Chauffeurs:</span> {fleetDetails?.total_drivers || 0}</p>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="vehicles">
            <TabsList>
              <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
              <TabsTrigger value="drivers">Chauffeurs</TabsTrigger>
              <TabsTrigger value="types">Types de véhicules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vehicles" className="py-4">
              {vehiclesLoaded && fleetDetails?.vehicles?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {fleetDetails.vehicles.map((vehicle: any) => (
                    <div key={vehicle.id} className="border rounded-md p-4 flex flex-col">
                      <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.registration}</div>
                      <div className="text-sm mt-1">Type: {vehicle.type}</div>
                      <div className="text-sm">Capacité: {vehicle.capacity} places</div>
                      <div className="text-sm">Carburant: {vehicle.fuel_type}</div>
                      <div className="text-sm mt-auto pt-2">
                        Status: 
                        <span className={`ml-1 ${vehicle.status === 'Disponible' ? 'text-green-600' : 'text-amber-600'}`}>
                          {vehicle.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Aucun véhicule dans cette flotte</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="drivers" className="py-4">
              {vehiclesLoaded && fleetDetails?.drivers?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {fleetDetails.drivers.map((driver: any) => (
                    <div key={driver.id} className="border rounded-md p-4 flex flex-col">
                      <div className="font-medium">{driver.prenom} {driver.nom}</div>
                      <div className="text-sm text-muted-foreground">{driver.id_chauffeur}</div>
                      {driver.ville && <div className="text-sm">Ville: {driver.ville}</div>}
                      <div className="text-sm">Email: {driver.email}</div>
                      <div className="text-sm">Téléphone: {driver.telephone}</div>
                      <div className="text-sm mt-auto pt-2">
                        Status: 
                        <span className={`ml-1 ${driver.disponible ? 'text-green-600' : 'text-amber-600'}`}>
                          {driver.disponible ? 'Disponible' : 'Indisponible'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Aucun chauffeur dans cette flotte</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="types" className="py-4">
              <div className="pb-6">
                <h3 className="text-lg font-medium mb-4">Types de véhicules disponibles</h3>
                {vehicleTypes.length > 0 ? (
                  <VehicleTypeSelector 
                    vehicleTypesOverride={vehicleTypes}
                    maxSelections={6}
                    selectedTypes={[]}
                  />
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Aucun type de véhicule disponible</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DialogContent>
  );
}
