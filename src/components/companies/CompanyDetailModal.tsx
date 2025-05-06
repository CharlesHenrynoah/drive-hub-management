
import { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Company {
  id: string;
  name: string;
  address?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  logo_url?: string | null;
  fleet_count?: number;
  vehicle_count?: number;
  driver_count?: number;
}

interface Fleet {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  type: string;
}

interface Driver {
  id: string;
  id_chauffeur: string;
  nom: string;
  prenom: string;
}

interface CompanyDetailModalProps {
  company: Company;
  onUpdate?: () => void;
}

export function CompanyDetailModal({ company, onUpdate }: CompanyDetailModalProps) {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCompanyDetails() {
      try {
        setLoading(true);
        
        // Fetch fleets for this company
        const { data: fleetsData, error: fleetsError } = await supabase
          .from('fleets')
          .select('id, name, description, created_at')
          .eq('company_id', company.id);
          
        if (fleetsError) {
          console.error('Error fetching fleets:', fleetsError);
          return;
        }
        
        setFleets(fleetsData || []);
        
        if (fleetsData && fleetsData.length > 0) {
          const fleetIds = fleetsData.map(fleet => fleet.id);
          
          // Fetch vehicles for these fleets
          const { data: fleetVehiclesData, error: fleetVehiclesError } = await supabase
            .from('fleet_vehicles')
            .select('vehicle_id')
            .in('fleet_id', fleetIds);
            
          if (fleetVehiclesError) {
            console.error('Error fetching fleet vehicles:', fleetVehiclesError);
          } else if (fleetVehiclesData && fleetVehiclesData.length > 0) {
            const vehicleIds = fleetVehiclesData.map(item => item.vehicle_id);
            
            const { data: vehiclesData, error: vehiclesError } = await supabase
              .from('vehicles')
              .select('id, registration, brand, model, type')
              .in('id', vehicleIds);
              
            if (vehiclesError) {
              console.error('Error fetching vehicles:', vehiclesError);
            } else {
              setVehicles(vehiclesData || []);
            }
          }
          
          // Fetch drivers for these fleets
          const { data: fleetDriversData, error: fleetDriversError } = await supabase
            .from('fleet_drivers')
            .select('driver_id')
            .in('fleet_id', fleetIds);
            
          if (fleetDriversError) {
            console.error('Error fetching fleet drivers:', fleetDriversError);
          } else if (fleetDriversData && fleetDriversData.length > 0) {
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
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompanyDetails();
    
    // Set up real-time subscriptions
    const fleetsChannel = supabase
      .channel('company-fleets-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'fleets',
          filter: `company_id=eq.${company.id}`
        }, 
        () => {
          console.log('Company fleets changed, refreshing data...');
          fetchCompanyDetails();
          if (onUpdate) onUpdate();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(fleetsChannel);
    };
  }, [company.id, onUpdate]);

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[80vh] p-0 overflow-hidden">
      <ScrollArea className="max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                {company.logo_url ? (
                  <AvatarImage src={company.logo_url} alt={company.name} />
                ) : (
                  <AvatarFallback>{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{company.name}</DialogTitle>
                <DialogDescription>
                  {company.id} {company.created_at ? ` - Entreprise créée le ${new Date(company.created_at).toLocaleDateString()}` : ''}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="mt-2">
            <TabsList>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="flottes">Flottes</TabsTrigger>
              <TabsTrigger value="ressources">Ressources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Informations générales</h3>
                <Separator className="my-2" />
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium">Contact principal</dt>
                    <dd>{company.contact_name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Adresse</dt>
                    <dd>{company.address || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Email</dt>
                    <dd>{company.email || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Téléphone</dt>
                    <dd>{company.phone || '-'}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Statistiques</h3>
                <Separator className="my-2" />
                <dl className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg border p-3">
                    <dt className="text-muted-foreground text-xs">Flottes</dt>
                    <dd className="text-2xl font-semibold mt-1">{fleets.length}</dd>
                  </div>
                  <div className="rounded-lg border p-3">
                    <dt className="text-muted-foreground text-xs">Véhicules</dt>
                    <dd className="text-2xl font-semibold mt-1">{vehicles.length}</dd>
                  </div>
                  <div className="rounded-lg border p-3">
                    <dt className="text-muted-foreground text-xs">Chauffeurs</dt>
                    <dd className="text-2xl font-semibold mt-1">{drivers.length}</dd>
                  </div>
                </dl>
              </div>
            </TabsContent>
            
            <TabsContent value="flottes" className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Flottes de l'entreprise</h3>
                <Button size="sm">Ajouter une flotte</Button>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Chargement des flottes...</span>
                </div>
              ) : fleets.length > 0 ? (
                <div className="space-y-3">
                  {fleets.map((fleet) => (
                    <Card key={fleet.id}>
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{fleet.name}</CardTitle>
                          <Badge variant="outline">{fleet.id.substring(0, 8)}...</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm text-muted-foreground">{fleet.description || 'Pas de description'}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune flotte n'est associée à cette entreprise</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ressources" className="space-y-6 pt-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Véhicules ({vehicles.length})</h3>
                
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Chargement des véhicules...</span>
                  </div>
                ) : vehicles.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">ID</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Immatriculation</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Marque</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Modèle</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((vehicle) => (
                          <tr key={vehicle.id} className="border-b last:border-0">
                            <td className="p-2 text-sm">{vehicle.id.substring(0, 8)}...</td>
                            <td className="p-2 text-sm">{vehicle.registration}</td>
                            <td className="p-2 text-sm">{vehicle.brand}</td>
                            <td className="p-2 text-sm">{vehicle.model}</td>
                            <td className="p-2 text-sm">{vehicle.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-secondary/30 rounded-md">
                    <p className="text-muted-foreground">Aucun véhicule associé</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Chauffeurs ({drivers.length})</h3>
                
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Chargement des chauffeurs...</span>
                  </div>
                ) : drivers.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">ID</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Matricule</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Nom</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Prénom</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drivers.map((driver) => (
                          <tr key={driver.id} className="border-b last:border-0">
                            <td className="p-2 text-sm">{driver.id.substring(0, 8)}...</td>
                            <td className="p-2 text-sm">{driver.id_chauffeur}</td>
                            <td className="p-2 text-sm">{driver.nom}</td>
                            <td className="p-2 text-sm">{driver.prenom}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-secondary/30 rounded-md">
                    <p className="text-muted-foreground">Aucun chauffeur associé</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}
