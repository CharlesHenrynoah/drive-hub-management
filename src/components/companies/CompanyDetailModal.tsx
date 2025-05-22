
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
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
    <>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center justify-between">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Button>
              </div>
            </DialogHeader>
          
          <div className="mt-6">
            
            <div className="space-y-4">
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
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>

      {/* Modale d'édition */}
      {isEditModalOpen && (
        <EditCompanyModal 
          company={company} 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={() => {
            if (onUpdate) onUpdate();
            setIsEditModalOpen(false);
          }}
        />
      )}
    </>
  );
}

interface EditCompanyModalProps {
  company: Company;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

function EditCompanyModal({ company, isOpen, onClose, onUpdate }: EditCompanyModalProps) {
  const [formData, setFormData] = useState({
    name: company.name,
    contact_name: company.contact_name || '',
    address: company.address || '',
    email: company.email || '',
    phone: company.phone || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          contact_name: formData.contact_name,
          address: formData.address,
          email: formData.email,
          phone: formData.phone
        })
        .eq('id', company.id);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        toast.error("Une erreur est survenue lors de la mise à jour des informations");
        throw error;
      }

      toast.success("Les informations de l'entreprise ont été mises à jour avec succès");
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'entreprise</DialogTitle>
          <DialogDescription>
            Modifiez les informations de {company.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nom de l'entreprise</label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="contact_name" className="text-sm font-medium">Contact principal</label>
            <Input
              id="contact_name"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">Adresse</label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Téléphone</label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="ml-2">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
