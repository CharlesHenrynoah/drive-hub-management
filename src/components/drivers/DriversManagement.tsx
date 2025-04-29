
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Download } from "lucide-react";
import { AddDriverForm } from "./AddDriverForm";
import { DriverDetailModal } from "./DriverDetailModal";

// Données mockées des entreprises
const entreprises = {
  "E-001": "Ville de Paris",
  "E-002": "Académie de Lyon",
  "E-003": "Transport Express",
  "E-004": "LogiMobile",
  "E-005": "Société ABC",
};

// Données mockées des chauffeurs
const drivers = [
  {
    ID_Chauffeur: "C-001",
    Nom: "Martin",
    Prénom: "Jean",
    Email: "jean.martin@example.com",
    Téléphone: "06 12 34 56 78",
    Pièce_Identité: "ID12345678",
    Certificat_Médical: "CM987654321",
    Justificatif_Domicile: "JD456789123",
    Expérience: 8,
    Note_Chauffeur: 86,
    Missions_Futures: ["M-004", "M-007", "M-012"],
    Photo: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=300&h=300&fit=crop",
    ID_Entreprise: "E-001",
  },
  {
    ID_Chauffeur: "C-002",
    Nom: "Garcia",
    Prénom: "Maria",
    Email: "maria.garcia@example.com",
    Téléphone: "06 23 45 67 89",
    Pièce_Identité: "ID23456789",
    Certificat_Médical: "CM876543210",
    Justificatif_Domicile: "JD345678912",
    Expérience: 5,
    Note_Chauffeur: 90,
    Missions_Futures: ["M-003", "M-010"],
    Photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    ID_Entreprise: "E-003",
  },
  {
    ID_Chauffeur: "C-003",
    Nom: "Petit",
    Prénom: "Thomas",
    Email: "thomas.petit@example.com",
    Téléphone: "06 34 56 78 90",
    Pièce_Identité: "ID34567890",
    Certificat_Médical: "CM765432109",
    Justificatif_Domicile: "JD234567891",
    Expérience: 12,
    Note_Chauffeur: 92,
    Missions_Futures: [],
    Photo: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&h=300&fit=crop",
    ID_Entreprise: "E-002",
  },
  {
    ID_Chauffeur: "C-004",
    Nom: "Dubois",
    Prénom: "Sophie",
    Email: "sophie.dubois@example.com",
    Téléphone: "06 45 67 89 01",
    Pièce_Identité: "ID45678901",
    Certificat_Médical: "CM654321098",
    Justificatif_Domicile: "JD123456789",
    Expérience: 3,
    Note_Chauffeur: 80,
    Missions_Futures: ["M-005", "M-008", "M-011"],
    Photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop",
    ID_Entreprise: "E-004",
  },
  {
    ID_Chauffeur: "C-005",
    Nom: "Lambert",
    Prénom: "Michel",
    Email: "michel.lambert@example.com",
    Téléphone: "06 56 78 90 12",
    Pièce_Identité: "ID56789012",
    Certificat_Médical: "CM543210987",
    Justificatif_Domicile: "JD012345678",
    Expérience: 15,
    Note_Chauffeur: 95,
    Missions_Futures: ["M-001", "M-006", "M-009", "M-013"],
    Photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&h=300&fit=crop",
    ID_Entreprise: "E-005",
  },
];

type Driver = typeof drivers[0];

export function DriversManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [experienceFilter, setExperienceFilter] = useState<string>("Tous");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Filtrage des chauffeurs
  const filteredDrivers = drivers.filter((driver) => {
    // Recherche par Nom, Prénom ou ID
    const matchesSearch =
      driver.Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.Prénom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.ID_Chauffeur.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par tranche d'expérience
    let matchesExperience = true;
    if (experienceFilter === "0-5") {
      matchesExperience = driver.Expérience >= 0 && driver.Expérience <= 5;
    } else if (experienceFilter === "6-10") {
      matchesExperience = driver.Expérience >= 6 && driver.Expérience <= 10;
    } else if (experienceFilter === "10+") {
      matchesExperience = driver.Expérience > 10;
    }

    return matchesSearch && matchesExperience;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Input
            placeholder="Rechercher un chauffeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          
          <Select value={experienceFilter} onValueChange={setExperienceFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Expérience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Toutes les expériences</SelectItem>
              <SelectItem value="0-5">0-5 ans</SelectItem>
              <SelectItem value="6-10">6-10 ans</SelectItem>
              <SelectItem value="10+">10+ ans</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          
          <AddDriverForm />
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Expérience (années)</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Missions futures</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.ID_Chauffeur}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={driver.Photo} alt={`${driver.Prénom} ${driver.Nom}`} />
                      <AvatarFallback>{driver.Prénom.charAt(0)}{driver.Nom.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{driver.ID_Chauffeur}</TableCell>
                  <TableCell>{driver.Nom}</TableCell>
                  <TableCell>{driver.Prénom}</TableCell>
                  <TableCell>{driver.Expérience} ans</TableCell>
                  <TableCell>{entreprises[driver.ID_Entreprise as keyof typeof entreprises]}</TableCell>
                  <TableCell>
                    {driver.Note_Chauffeur === 0 ? (
                      "Pas encore noté"
                    ) : (
                      `${(driver.Note_Chauffeur / 20).toFixed(1)}/5`
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {driver.Missions_Futures.length > 0 ? (
                        driver.Missions_Futures.map((mission, index) => (
                          <Badge key={index} variant="outline" className="bg-secondary">
                            {mission}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Aucune mission</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDriver(driver)}>
                          Détails
                        </Button>
                      </DialogTrigger>
                      {selectedDriver && selectedDriver.ID_Chauffeur === driver.ID_Chauffeur && (
                        <DriverDetailModal driver={selectedDriver} />
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
