
import { useState } from "react";
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

// Données mockées des flottes pour le sous-onglet "Flottes" du modal Détails
const fleets = [
  {
    ID_Flotte: "F-001",
    Nom_Flotte: "Flotte urbaine",
    ID_Entreprise: "E-001",
    Liste_Vehicules: ["V-001", "V-006", "V-009", "V-013"],
    Date_Creation: "2023-01-15",
    Derniere_Modification: "2023-09-20",
    Description: "Flotte de véhicules pour déplacements urbains",
  },
  {
    ID_Flotte: "F-002",
    Nom_Flotte: "Flotte scolaire",
    ID_Entreprise: "E-002",
    Liste_Vehicules: ["V-003", "V-008", "V-012"],
    Date_Creation: "2023-02-10",
    Derniere_Modification: "2023-08-25",
    Description: "Flotte dédiée au transport scolaire",
  },
  // ... autres flottes
];

// Données mockées des véhicules pour le sous-onglet "Ressources" du modal Détails
const vehicles = [
  {
    ID_Vehicule: "V-001",
    Type_Vehicule: "Utilitaire",
    Marque: "Renault",
    Modele: "Master",
    ID_Entreprise: "E-001",
  },
  {
    ID_Vehicule: "V-002",
    Type_Vehicule: "Berline",
    Marque: "Peugeot",
    Modele: "508",
    ID_Entreprise: "E-003",
  },
  // ... autres véhicules
];

// Données mockées des chauffeurs pour le sous-onglet "Ressources" du modal Détails
const drivers = [
  {
    ID_Chauffeur: "C-001",
    Nom: "Martin",
    Prénom: "Jean",
    ID_Entreprise: "E-001",
  },
  {
    ID_Chauffeur: "C-002",
    Nom: "Garcia",
    Prénom: "Maria",
    ID_Entreprise: "E-003",
  },
  // ... autres chauffeurs
];

// Données mockées des entreprises
const companies = [
  {
    ID_Entreprise: "E-001",
    Nom: "Ville de Paris",
    Adresse: "Place de l'Hôtel de Ville, 75004 Paris",
    Contact_Principal: "Jean Dupont",
    Email: "contact@paris.fr",
    Téléphone: "01 23 45 67 89",
    Date_Creation: "2021-06-10",
    Nombre_Flottes: 2,
    Nombre_Vehicules: 8,
    Nombre_Chauffeurs: 5,
  },
  {
    ID_Entreprise: "E-002",
    Nom: "Académie de Lyon",
    Adresse: "92 Rue de Marseille, 69007 Lyon",
    Contact_Principal: "Marie Lefevre",
    Email: "contact@ac-lyon.fr",
    Téléphone: "04 78 65 43 21",
    Date_Creation: "2021-09-15",
    Nombre_Flottes: 1,
    Nombre_Vehicules: 5,
    Nombre_Chauffeurs: 3,
  },
  {
    ID_Entreprise: "E-003",
    Nom: "Transport Express",
    Adresse: "45 Avenue des Logisticiens, 33000 Bordeaux",
    Contact_Principal: "Pierre Martin",
    Email: "contact@transport-express.fr",
    Téléphone: "05 56 78 90 12",
    Date_Creation: "2022-01-20",
    Nombre_Flottes: 3,
    Nombre_Vehicules: 12,
    Nombre_Chauffeurs: 8,
  },
  {
    ID_Entreprise: "E-004",
    Nom: "LogiMobile",
    Adresse: "18 Rue de l'Innovation, 59000 Lille",
    Contact_Principal: "Sophie Dubois",
    Email: "contact@logimobile.fr",
    Téléphone: "03 20 45 67 89",
    Date_Creation: "2022-03-05",
    Nombre_Flottes: 2,
    Nombre_Vehicules: 7,
    Nombre_Chauffeurs: 4,
  },
  {
    ID_Entreprise: "E-005",
    Nom: "Société ABC",
    Adresse: "123 Boulevard des Entreprises, 44000 Nantes",
    Contact_Principal: "Thomas Legrand",
    Email: "contact@societeabc.fr",
    Téléphone: "02 40 12 34 56",
    Date_Creation: "2022-05-12",
    Nombre_Flottes: 1,
    Nombre_Vehicules: 4,
    Nombre_Chauffeurs: 2,
  },
];

type Company = typeof companies[0];

export function CompaniesManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

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
              {filteredCompanies.map((company) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
