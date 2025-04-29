
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
import { AddFleetForm } from "./AddFleetForm";
import { FleetDetailModal } from "./FleetDetailModal";

// Données mockées des entreprises
const entreprises = {
  "E-001": "Ville de Paris",
  "E-002": "Académie de Lyon",
  "E-003": "Transport Express",
  "E-004": "LogiMobile",
  "E-005": "Société ABC",
};

// Données mockées des flottes
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
  {
    ID_Flotte: "F-003",
    Nom_Flotte: "Flotte express",
    ID_Entreprise: "E-003",
    Liste_Vehicules: ["V-002", "V-007", "V-010", "V-014", "V-018"],
    Date_Creation: "2023-03-05",
    Derniere_Modification: "2023-10-10",
    Description: "Flotte pour livraisons et transports express",
  },
  {
    ID_Flotte: "F-004",
    Nom_Flotte: "Flotte Premium",
    ID_Entreprise: "E-004",
    Liste_Vehicules: ["V-004", "V-015", "V-016", "V-017"],
    Date_Creation: "2023-04-20",
    Derniere_Modification: "2023-09-15",
    Description: "Véhicules haut de gamme pour transport VIP",
  },
  {
    ID_Flotte: "F-005",
    Nom_Flotte: "Flotte corporate",
    ID_Entreprise: "E-005",
    Liste_Vehicules: ["V-005", "V-011", "V-019", "V-020"],
    Date_Creation: "2023-05-12",
    Derniere_Modification: "2023-10-05",
    Description: "Flotte dédiée aux besoins des entreprises",
  },
];

type Fleet = typeof fleets[0];

export function FleetsManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);

  // Filtrage des flottes
  const filteredFleets = fleets.filter((fleet) =>
    fleet.Nom_Flotte.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entreprises[fleet.ID_Entreprise as keyof typeof entreprises]
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Rechercher par nom ou entreprise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64"
        />
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          
          <AddFleetForm />
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Nombre de véhicules</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Dernière modification</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFleets.map((fleet) => (
                <TableRow key={fleet.ID_Flotte}>
                  <TableCell>{fleet.ID_Flotte}</TableCell>
                  <TableCell>{fleet.Nom_Flotte}</TableCell>
                  <TableCell>{entreprises[fleet.ID_Entreprise as keyof typeof entreprises]}</TableCell>
                  <TableCell>{fleet.Liste_Vehicules.length}</TableCell>
                  <TableCell>{fleet.Date_Creation}</TableCell>
                  <TableCell>{fleet.Derniere_Modification}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedFleet(fleet)}>
                          Détails
                        </Button>
                      </DialogTrigger>
                      {selectedFleet && selectedFleet.ID_Flotte === fleet.ID_Flotte && (
                        <FleetDetailModal fleet={selectedFleet} />
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
