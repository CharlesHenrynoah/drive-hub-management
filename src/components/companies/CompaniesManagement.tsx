
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
import { Download } from "lucide-react";
import { AddCompanyForm } from "./AddCompanyForm";
import { CompanyDetailModal } from "./CompanyDetailModal";
import { supabase } from "@/integrations/supabase/client";

// Types for companies
export type Company = {
  ID_Entreprise: string;
  Nom: string;
  Adresse: string;
  Contact_Principal: string;
  Email: string;
  Téléphone: string;
  Date_Creation: string;
  Nombre_Flottes: number;
  Nombre_Vehicules: number;
  Nombre_Chauffeurs: number;
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

  // Empty arrays for fleets, vehicles, and drivers
  const fleets: Fleet[] = [];
  const vehicles: Vehicle[] = [];
  const drivers: Driver[] = [];

  useEffect(() => {
    // In the future, this would fetch real company data from Supabase
    // For now, we're just setting the loading state to false
    setLoading(false);
  }, []);

  // Filtrage des entreprises
  const filteredCompanies = companies.filter((company) =>
    company.Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.Contact_Principal.toLowerCase().includes(searchTerm.toLowerCase())
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
          
          <AddCompanyForm />
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
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
                  <TableCell colSpan={9} className="text-center py-6">Chargement des données...</TableCell>
                </TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">Aucune entreprise trouvée</TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.ID_Entreprise}>
                    <TableCell>{company.ID_Entreprise}</TableCell>
                    <TableCell>{company.Nom}</TableCell>
                    <TableCell>{company.Contact_Principal}</TableCell>
                    <TableCell>{company.Email}</TableCell>
                    <TableCell>{company.Téléphone}</TableCell>
                    <TableCell>{company.Nombre_Flottes}</TableCell>
                    <TableCell>{company.Nombre_Vehicules}</TableCell>
                    <TableCell>{company.Nombre_Chauffeurs}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(company)}>
                            Détails
                          </Button>
                        </DialogTrigger>
                        {selectedCompany && selectedCompany.ID_Entreprise === company.ID_Entreprise && (
                          <CompanyDetailModal 
                            company={selectedCompany}
                            fleets={getCompanyFleets(company.ID_Entreprise)}
                            vehicles={getCompanyVehicles(company.ID_Entreprise)}
                            drivers={getCompanyDrivers(company.ID_Entreprise)}
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
