
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
import { Download, Loader2, Plus, Trash2 } from "lucide-react";
import { AddCompanyForm } from "./AddCompanyForm";
import { CompanyDetailModal } from "./CompanyDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
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

// Types for companies
export type Company = {
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
};

export function CompaniesManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch companies from Supabase with related counts
  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        
        // Fetch basic company data
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*');

        if (companyError) {
          console.error('Error fetching companies:', companyError);
          toast.error('Erreur lors du chargement des entreprises');
          return;
        }
        
        // Transform and enhance company data with counts
        const enhancedCompanies = await Promise.all(companyData.map(async (company) => {
          // Count fleets for this company
          const { count: fleetCount, error: fleetError } = await supabase
            .from('fleets')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id);
            
          if (fleetError) {
            console.error(`Error counting fleets for company ${company.id}:`, fleetError);
          }
          
          // Get all fleet IDs for this company to count related vehicles and drivers
          const { data: fleetIds, error: fleetIdsError } = await supabase
            .from('fleets')
            .select('id')
            .eq('company_id', company.id);
            
          if (fleetIdsError) {
            console.error(`Error fetching fleet IDs for company ${company.id}:`, fleetIdsError);
          }
          
          let vehicleCount = 0;
          let driverCount = 0;
          
          if (fleetIds && fleetIds.length > 0) {
            // Extract just the IDs
            const ids = fleetIds.map(f => f.id);
            
            // Count vehicles associated with these fleets
            const { count: vCount, error: vError } = await supabase
              .from('fleet_vehicles')
              .select('*', { count: 'exact', head: true })
              .in('fleet_id', ids);
              
            if (vError) {
              console.error(`Error counting vehicles for company ${company.id}:`, vError);
            } else {
              vehicleCount = vCount || 0;
            }
            
            // Count drivers associated with these fleets
            const { count: dCount, error: dError } = await supabase
              .from('fleet_drivers')
              .select('*', { count: 'exact', head: true })
              .in('fleet_id', ids);
              
            if (dError) {
              console.error(`Error counting drivers for company ${company.id}:`, dError);
            } else {
              driverCount = dCount || 0;
            }
          }
          
          return {
            ...company,
            fleet_count: fleetCount || 0,
            vehicle_count: vehicleCount,
            driver_count: driverCount
          };
        }));
        
        setCompanies(enhancedCompanies);
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
    
    // Set up real-time subscription for companies table
    const companiesChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'companies' 
        }, 
        () => {
          console.log('Companies table changed, refreshing data...');
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();
      
    // Set up real-time subscription for fleets table  
    const fleetsChannel = supabase
      .channel('fleets-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'fleets' 
        }, 
        () => {
          console.log('Fleets table changed, refreshing data...');
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();
      
    // Set up real-time subscription for fleet_vehicles table
    const fleetVehiclesChannel = supabase
      .channel('fleet-vehicles-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'fleet_vehicles' 
        }, 
        () => {
          console.log('Fleet vehicles changed, refreshing data...');
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();
      
    // Set up real-time subscription for fleet_drivers table  
    const fleetDriversChannel = supabase
      .channel('fleet-drivers-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'fleet_drivers' 
        }, 
        () => {
          console.log('Fleet drivers changed, refreshing data...');
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    // Cleanup function to remove subscriptions
    return () => {
      supabase.removeChannel(companiesChannel);
      supabase.removeChannel(fleetsChannel);
      supabase.removeChannel(fleetVehiclesChannel);
      supabase.removeChannel(fleetDriversChannel);
    };
  }, [refreshTrigger]);

  // Filtrage des entreprises
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.contact_name && company.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Function to handle company addition
  const handleCompanyAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Entreprise ajoutée avec succès');
  };

  // Handle delete confirmation
  const handleDeleteClick = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = async () => {
    if (!companyToDelete) return;

    try {
      setIsDeleting(true);
      
      // Check if there are any fleets associated with this company
      const { data: fleets, error: fleetError } = await supabase
        .from('fleets')
        .select('id')
        .eq('company_id', companyToDelete.id);
        
      if (fleetError) {
        console.error('Error checking fleets:', fleetError);
        toast.error("Erreur lors de la vérification des flottes associées");
        return;
      }
      
      // If there are fleets, delete all fleet associations first
      if (fleets && fleets.length > 0) {
        const fleetIds = fleets.map(fleet => fleet.id);
        
        // Delete fleet_vehicles associations
        const { error: vehicleError } = await supabase
          .from('fleet_vehicles')
          .delete()
          .in('fleet_id', fleetIds);
          
        if (vehicleError) {
          console.error('Error deleting fleet vehicles:', vehicleError);
          toast.error("Erreur lors de la suppression des véhicules associés aux flottes");
          return;
        }
        
        // Delete fleet_drivers associations
        const { error: driverError } = await supabase
          .from('fleet_drivers')
          .delete()
          .in('fleet_id', fleetIds);
          
        if (driverError) {
          console.error('Error deleting fleet drivers:', driverError);
          toast.error("Erreur lors de la suppression des chauffeurs associés aux flottes");
          return;
        }
        
        // Delete all fleets
        const { error: deleteFleetError } = await supabase
          .from('fleets')
          .delete()
          .eq('company_id', companyToDelete.id);
          
        if (deleteFleetError) {
          console.error('Error deleting fleets:', deleteFleetError);
          toast.error("Erreur lors de la suppression des flottes");
          return;
        }
      }
      
      // Finally, delete the company
      const { error: deleteCompanyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyToDelete.id);
        
      if (deleteCompanyError) {
        console.error('Error deleting company:', deleteCompanyError);
        toast.error("Erreur lors de la suppression de l'entreprise");
        return;
      }
      
      toast.success("Entreprise supprimée avec succès");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Rechercher par nom ou contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64"
        />
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          
          <AddCompanyForm onCompanyAdded={handleCompanyAdded} />
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Logo</TableHead>
                <TableHead className="w-48">Nom</TableHead>
                <TableHead className="w-48">Contact Principal</TableHead>
                <TableHead className="w-48">Email</TableHead>
                <TableHead className="w-36">Téléphone</TableHead>
                <TableHead className="w-24 text-center">Flottes</TableHead>
                <TableHead className="w-24 text-center">Véhicules</TableHead>
                <TableHead className="w-24 text-center">Chauffeurs</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Chargement des données...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div className="flex flex-col items-center space-y-4">
                      <p className="text-lg font-medium">Aucune entreprise disponible</p>
                      <p className="text-muted-foreground">Ajoutez votre première entreprise pour démarrer</p>
                      <AddCompanyForm onCompanyAdded={handleCompanyAdded} />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id} className="h-16">
                    <TableCell className="py-2">
                      <Avatar className="h-10 w-10">
                        {company.logo_url ? (
                          <AvatarImage src={company.logo_url} alt={company.name} />
                        ) : (
                          <AvatarFallback>{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.contact_name || '-'}</TableCell>
                    <TableCell>{company.email || '-'}</TableCell>
                    <TableCell>{company.phone || '-'}</TableCell>
                    <TableCell className="text-center">{company.fleet_count || 0}</TableCell>
                    <TableCell className="text-center">{company.vehicle_count || 0}</TableCell>
                    <TableCell className="text-center">{company.driver_count || 0}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(company)}>
                              Détails
                            </Button>
                          </DialogTrigger>
                          {selectedCompany && selectedCompany.id === company.id && (
                            <CompanyDetailModal 
                              company={selectedCompany}
                              onUpdate={() => setRefreshTrigger(prev => prev + 1)}
                            />
                          )}
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => handleDeleteClick(company, e)} 
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette entreprise?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l'entreprise "{companyToDelete?.name}" et toutes ses associations avec les flottes, véhicules et chauffeurs.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setCompanyToDelete(null);
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
