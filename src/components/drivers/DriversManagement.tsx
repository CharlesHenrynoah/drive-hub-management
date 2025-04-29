
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
import { Driver } from "@/types/driver";
import { Toggle } from "@/components/ui/toggle";
import { Switch } from "@/components/ui/switch";

// Données mockées des entreprises
const entreprises = {
  "E-001": "Ville de Paris",
  "E-002": "Académie de Lyon",
  "E-003": "Transport Express",
  "E-004": "LogiMobile",
  "E-005": "Société ABC",
};

// Initial empty array for drivers - no more fake data
const initialDrivers: Driver[] = [];

export function DriversManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [experienceFilter, setExperienceFilter] = useState<string>("Tous");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("Tous");

  // Function to add a new driver
  const addDriver = (driver: Driver) => {
    setDrivers([...drivers, driver]);
  };

  // Function to update a driver's availability
  const updateDriverAvailability = (driverId: string, available: boolean) => {
    setDrivers(
      drivers.map(driver => 
        driver.ID_Chauffeur === driverId 
          ? { ...driver, Disponible: available } 
          : driver
      )
    );
  };

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

    // Filtre par disponibilité
    let matchesAvailability = true;
    if (availabilityFilter === "Disponible") {
      matchesAvailability = driver.Disponible === true;
    } else if (availabilityFilter === "Indisponible") {
      matchesAvailability = driver.Disponible === false;
    }

    return matchesSearch && matchesExperience && matchesAvailability;
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

          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Disponibilité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Tous</SelectItem>
              <SelectItem value="Disponible">Disponible</SelectItem>
              <SelectItem value="Indisponible">Indisponible</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          
          <AddDriverForm onDriverAdded={addDriver} />
        </div>
      </div>
      
      {drivers.length === 0 ? (
        <div className="text-center p-10 border rounded-md">
          <h3 className="text-xl font-semibold mb-2">Aucun chauffeur</h3>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas encore ajouté de chauffeurs à votre équipe.
          </p>
          <AddDriverForm onDriverAdded={addDriver} buttonText="Ajouter votre premier chauffeur" />
        </div>
      ) : (
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
                  <TableHead>Disponibilité</TableHead>
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
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={driver.Disponible} 
                          onCheckedChange={(checked) => updateDriverAvailability(driver.ID_Chauffeur, checked)}
                        />
                        <span className={driver.Disponible ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {driver.Disponible ? "Disponible" : "Indisponible"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {driver.Missions_Futures && driver.Missions_Futures.length > 0 ? (
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
      )}
    </div>
  );
}
