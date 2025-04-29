
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
import { Download, Loader2 } from "lucide-react";
import { AddCompanyForm } from "./AddCompanyForm";
import { CompanyDetailModal } from "./CompanyDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

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

// Type definition for fleets
export type Fleet = {
  ID_Flotte: string;
  Nom_Flotte: string;
  ID_Entreprise: string;
  Liste_Vehicules: string[];
  Date_Creation: string;
  Derniere_Modification: string;
  Description: string;
};

// Type definition for vehicles
export type Vehicle = {
  ID_Vehicule: string;
  Type_Vehicule: string;
  Marque: string;
  Modele: string;
  ID_Entreprise: string;
};

// Type definition for drivers
export type Driver = {
  ID_Chauffeur: string;
  Nom: string;
  Prénom: string;
  ID_Entreprise: string;
};

export function CompaniesManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch companies from Supabase
  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('companies')
          .select('*');

        if (error) {
          console.error('Error fetching companies:', error);
          toast.error('Erreur lors du chargement des entreprises');
        } else {
          // Transform data to match the Company type
          const transformedData = data.map(company => ({
            id: company.id,
            name: company.name,
            logo_url: company.logo_url,
            // Default values for now, these would come from related tables in a real implementation
            fleet_count: 0,
            vehicle_count: 0,
            driver_count: 0
          }));
          
          setCompanies(transformedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, [refreshTrigger]);

  // Empty arrays for fleets, vehicles, and drivers
  const fleets: Fleet[] = [];
  const vehicles: Vehicle[] = [];
  const drivers: Driver[] = [];

  // Filtrage des entreprises
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.contact_name && company.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Récupération des flottes d'une entreprise
  const getCompanyFleets = (companyId: string) => {
    return fleets.filter((fleet) => fleet.ID_Entreprise === companyId);
  };

  // Récupération des véhicules d'une entreprise
  const getCompanyVehicles = (companyId: string) => {
    return vehicles.filter((vehicle) => vehicle.ID_Entreprise === companyId);
  };

  // Récupération des chauffeurs d'une entreprise
  const getCompanyDrivers = (companyId: string) => {
    return drivers.filter((driver) => driver.ID_Entreprise === companyId);
  };

  // Function to handle company addition
  const handleCompanyAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Entreprise ajoutée avec succès');
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Contact Principal</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Flottes</TableHead>
                <TableHead>Véhicules</TableHead>
                <TableHead>Chauffeurs</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell colSpan={9} className="text-center py-6">Aucune entreprise trouvée</TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        {company.logo_url ? (
                          <AvatarImage src={company.logo_url} alt={company.name} />
                        ) : (
                          <AvatarFallback>{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.contact_name || '-'}</TableCell>
                    <TableCell>{company.email || '-'}</TableCell>
                    <TableCell>{company.phone || '-'}</TableCell>
                    <TableCell>{company.fleet_count || 0}</TableCell>
                    <TableCell>{company.vehicle_count || 0}</TableCell>
                    <TableCell>{company.driver_count || 0}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(company)}>
                            Détails
                          </Button>
                        </DialogTrigger>
                        {selectedCompany && selectedCompany.id === company.id && (
                          <CompanyDetailModal 
                            company={selectedCompany}
                            fleets={getCompanyFleets(company.id)}
                            vehicles={getCompanyVehicles(company.id)}
                            drivers={getCompanyDrivers(company.id)}
                          />
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
