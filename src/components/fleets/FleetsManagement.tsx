
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Edit, Loader2, Trash2 } from "lucide-react";
import { AddFleetForm } from "./AddFleetForm";
import { FleetDetailModal } from "./FleetDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditFleetForm } from "./EditFleetForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Driver } from "@/types/driver";

// Type for fleets from the database
export type Fleet = {
  id: string;
  name: string;
  company_id: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: { id: string; registration: string }[];
  drivers?: Partial<Driver>[];
  companyName?: string;
  vehicleCount?: number;
  driverCount?: number;
};

// Type for companies
export type Company = {
  id: string;
  name: string;
};

export function FleetsManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fleetToDelete, setFleetToDelete] = useState<Fleet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [fleetToEdit, setFleetToEdit] = useState<Fleet | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch companies first to get names for lookup
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name');
        
        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
          toast.error('Erreur lors du chargement des entreprises');
          return;
        }
        
        // Create a lookup map for company names
        const companyMap: Record<string, string> = {};
        companiesData.forEach(company => {
          companyMap[company.id] = company.name;
        });
        setCompanies(companyMap);
        
        // Fetch fleets
        const { data: fleetsData, error: fleetsError } = await supabase
          .from('fleets')
          .select('*');
          
        if (fleetsError) {
          console.error('Error fetching fleets:', fleetsError);
          toast.error('Erreur lors du chargement des flottes');
          return;
        }
        
        // Enhance fleet data with company names, counts, and related data
        const enhancedFleets = await Promise.all(
          fleetsData.map(async (fleet) => {
            // Count vehicles for this fleet
            const { count: vehicleCount, error: vehicleError } = await supabase
              .from('fleet_vehicles')
              .select('*', { count: 'exact', head: true })
              .eq('fleet_id', fleet.id);
              
            if (vehicleError) {
              console.error('Error counting vehicles:', vehicleError);
            }
            
            // Count drivers for this fleet
            const { count: driverCount, error: driverError } = await supabase
              .from('fleet_drivers')
              .select('*', { count: 'exact', head: true })
              .eq('fleet_id', fleet.id);
              
            if (driverError) {
              console.error('Error counting drivers:', driverError);
            }
            
            // Get driver details for this fleet
            const { data: fleetDriversData, error: fleetDriversError } = await supabase
              .from('fleet_drivers')
              .select('driver_id')
              .eq('fleet_id', fleet.id);
              
            if (fleetDriversError) {
              console.error('Error fetching fleet drivers:', fleetDriversError);
            }
            
            let drivers: Partial<Driver>[] = [];
            if (fleetDriversData && fleetDriversData.length > 0) {
              const driverIds = fleetDriversData.map(fd => fd.driver_id);
              const { data: driversData, error: driversError } = await supabase
                .from('drivers')
                .select('id, nom, prenom, id_chauffeur, ville')
                .in('id', driverIds);
                
              if (driversError) {
                console.error('Error fetching drivers:', driversError);
              } else {
                drivers = driversData || [];
              }
            }
            
            return {
              ...fleet,
              companyName: companyMap[fleet.company_id] || 'Entreprise inconnue',
              vehicleCount: vehicleCount || 0,
              driverCount: driverCount || 0,
              drivers
            };
          })
        );
        
        setFleets(enhancedFleets);
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [refreshTrigger]);

  // Handle fleet added/updated
  const handleFleetChange = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Les données des flottes ont été mises à jour');
  };

  // Handle delete confirmation
  const handleDeleteClick = (fleet: Fleet, e: React.MouseEvent) => {
    e.stopPropagation();
    setFleetToDelete(fleet);
    setDeleteDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = async () => {
    if (!fleetToDelete) return;

    try {
      setIsDeleting(true);
      
      // First delete all fleet_vehicles and fleet_drivers associations
      const { error: vehicleError } = await supabase
        .from('fleet_vehicles')
        .delete()
        .eq('fleet_id', fleetToDelete.id);
        
      if (vehicleError) {
        console.error('Error deleting fleet vehicles:', vehicleError);
        toast.error("Erreur lors de la suppression des véhicules associés");
        return;
      }
      
      const { error: driverError } = await supabase
        .from('fleet_drivers')
        .delete()
        .eq('fleet_id', fleetToDelete.id);
        
      if (driverError) {
        console.error('Error deleting fleet drivers:', driverError);
        toast.error("Erreur lors de la suppression des chauffeurs associés");
        return;
      }
      
      // Then delete the fleet itself
      const { error } = await supabase
        .from('fleets')
        .delete()
        .eq('id', fleetToDelete.id);
        
      if (error) {
        console.error('Error deleting fleet:', error);
        toast.error("Erreur lors de la suppression de la flotte");
        return;
      }
      
      toast.success("Flotte supprimée avec succès");
      handleFleetChange();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setFleetToDelete(null);
    }
  };

  // Handle edit click
  const handleEditClick = (fleet: Fleet, e: React.MouseEvent) => {
    e.stopPropagation();
    setFleetToEdit(fleet);
    setEditMode(true);
  };

  // Filtrage des flottes
  const filteredFleets = fleets.filter((fleet) =>
    fleet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fleet.companyName && fleet.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format driver information for display
  const formatDriverInfo = (drivers: Partial<Driver>[] | undefined) => {
    if (!drivers || drivers.length === 0) return "Aucun chauffeur";
    
    // Show only the first 2 drivers with their names and locations
    const displayDrivers = drivers.slice(0, 2).map(driver => {
      const location = driver.ville ? ` (${driver.ville})` : '';
      return `${driver.prenom} ${driver.nom}${location}`;
    });
    
    // If there are more than 2 drivers, show a count of additional drivers
    const additionalCount = drivers.length > 2 ? ` +${drivers.length - 2} autres` : '';
    
    return displayDrivers.join(", ") + additionalCount;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Rechercher par nom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64"
        />
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          
          <AddFleetForm 
            companies={companies} 
            onFleetAdded={handleFleetChange} 
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <ScrollArea className="w-full" orientation="both">
          <div className="min-w-[1100px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead className="w-40">Nom</TableHead>
                  <TableHead className="w-40">Entreprise</TableHead>
                  <TableHead className="w-40">Nombre de véhicules</TableHead>
                  <TableHead className="w-40">Chauffeurs</TableHead>
                  <TableHead className="w-40">Date de création</TableHead>
                  <TableHead className="w-40">Dernière modification</TableHead>
                  <TableHead className="w-48">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Chargement des données...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredFleets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center space-y-4">
                        <p className="text-lg font-medium">Aucune flotte disponible</p>
                        <p className="text-muted-foreground">Ajoutez votre première flotte pour démarrer</p>
                        <AddFleetForm 
                          companies={companies} 
                          onFleetAdded={handleFleetChange} 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFleets.map((fleet) => (
                    <TableRow key={fleet.id}>
                      <TableCell>{fleet.id.substring(0, 8)}...</TableCell>
                      <TableCell>{fleet.name}</TableCell>
                      <TableCell>{fleet.companyName}</TableCell>
                      <TableCell>{fleet.vehicleCount || 0}</TableCell>
                      <TableCell>
                        <div className="max-w-[250px] truncate" title={fleet.drivers ? fleet.drivers.map(d => `${d.prenom} ${d.nom} ${d.ville ? `(${d.ville})` : ''}`).join(', ') : 'Aucun chauffeur'}>
                          {formatDriverInfo(fleet.drivers)}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(fleet.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(fleet.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedFleet(fleet)}>
                                Détails
                              </Button>
                            </DialogTrigger>
                            {selectedFleet && selectedFleet.id === fleet.id && (
                              <FleetDetailModal 
                                fleet={selectedFleet} 
                                companies={companies}
                                onUpdate={handleFleetChange}
                              />
                            )}
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleEditClick(fleet, e)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleDeleteClick(fleet, e)} 
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      {/* Edit Fleet Dialog */}
      {editMode && fleetToEdit && (
        <Dialog open={editMode} onOpenChange={setEditMode}>
          <EditFleetForm 
            fleet={fleetToEdit}
            companies={companies}
            onFleetUpdated={() => {
              handleFleetChange();
              setEditMode(false);
              setFleetToEdit(null);
            }}
            onCancel={() => {
              setEditMode(false);
              setFleetToEdit(null);
            }}
          />
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette flotte?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement la flotte "{fleetToDelete?.name}" et toutes ses associations avec les véhicules et chauffeurs.
              Les véhicules et chauffeurs ne seront pas supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setFleetToDelete(null);
            }}>
              Annuler
            </AlertDialogCancel>
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
    </div>
  );
}
