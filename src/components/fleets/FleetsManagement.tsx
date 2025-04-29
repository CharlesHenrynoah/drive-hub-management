
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

// Données des flottes
const fleets: Array<{
  ID_Flotte: string;
  Nom_Flotte: string;
  ID_Entreprise: string;
  Liste_Vehicules: string[];
  Date_Creation: string;
  Derniere_Modification: string;
  Description: string;
}> = [];

type Fleet = typeof fleets[0];

export function FleetsManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);

  // Filtrage des flottes
  const filteredFleets = fleets.filter((fleet) =>
    fleet.Nom_Flotte.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredFleets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center space-y-4">
                      <p className="text-lg font-medium">Aucune flotte disponible</p>
                      <p className="text-muted-foreground">Ajoutez votre première flotte pour démarrer</p>
                      <AddFleetForm />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFleets.map((fleet) => (
                  <TableRow key={fleet.ID_Flotte}>
                    <TableCell>{fleet.ID_Flotte}</TableCell>
                    <TableCell>{fleet.Nom_Flotte}</TableCell>
                    <TableCell>{fleet.ID_Entreprise}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
