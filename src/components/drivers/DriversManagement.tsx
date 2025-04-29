
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  const [durationFilter, setDurationFilter] = useState<string>("Tous");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("Tous");

  // Function to add a new driver
  const addDriver = (driver: Driver) => {
    // Calculate availability based on missions
    const isAvailable = !driver.Missions_Futures || driver.Missions_Futures.length === 0;
    
    // Set the driver's availability based on missions
    const newDriver = {
      ...driver,
      Disponible: isAvailable
    };
    
    setDrivers([...drivers, newDriver]);
  };

  // Calculate duration between date of activity start and today
  const calculateActivityDuration = (dateDebut: Date | string): number => {
    const startDate = dateDebut instanceof Date 
      ? dateDebut 
      : new Date(dateDebut);
    
    const today = new Date();
    const diffYears = today.getFullYear() - startDate.getFullYear();
    const isBirthdayPassed = 
      today.getMonth() > startDate.getMonth() || 
      (today.getMonth() === startDate.getMonth() && today.getDate() >= startDate.getDate());
    
    return isBirthdayPassed ? diffYears : diffYears - 1;
  };

  // Format date if it's a string
  const formatDate = (date: Date | string) => {
    if (date instanceof Date) {
      return format(date, "dd/MM/yyyy", { locale: fr });
    } else if (typeof date === 'string') {
      // If it's an ISO string, convert to date first
      try {
        return format(new Date(date), "dd/MM/yyyy", { locale: fr });
      } catch (e) {
        return date; // Return as is if not a valid date
      }
    }
    return "Date inconnue";
  };

  // Filtrage des chauffeurs
  const filteredDrivers = drivers.filter((driver) => {
    // Recherche par Nom, Prénom ou ID
    const matchesSearch =
      driver.Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.Prénom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.ID_Chauffeur.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par durée d'activité
    let matchesDuration = true;
    const activityDuration = calculateActivityDuration(driver.Date_Debut_Activité);
    
    if (durationFilter === "0-5") {
      matchesDuration = activityDuration >= 0 && activityDuration <= 5;
    } else if (durationFilter === "6-10") {
      matchesDuration = activityDuration >= 6 && activityDuration <= 10;
    } else if (durationFilter === "10+") {
      matchesDuration = activityDuration > 10;
    }

    // Filtre par disponibilité
    let matchesAvailability = true;
    if (availabilityFilter === "Disponible") {
      matchesAvailability = driver.Disponible === true;
    } else if (availabilityFilter === "Indisponible") {
      matchesAvailability = driver.Disponible === false;
    }

    return matchesSearch && matchesDuration && matchesAvailability;
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
          
          <Select value={durationFilter} onValueChange={setDurationFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Durée d'activité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Toutes les durées</SelectItem>
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
                  <TableHead>Date de début</TableHead>
                  <TableHead>Durée d'activité</TableHead>
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
                    <TableCell>{formatDate(driver.Date_Debut_Activité)}</TableCell>
                    <TableCell>{calculateActivityDuration(driver.Date_Debut_Activité)} ans</TableCell>
                    <TableCell>{entreprises[driver.ID_Entreprise as keyof typeof entreprises]}</TableCell>
                    <TableCell>
                      {driver.Note_Chauffeur === 0 ? (
                        "Pas encore noté"
                      ) : (
                        `${(driver.Note_Chauffeur / 20).toFixed(1)}/5`
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className={driver.Disponible ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {driver.Disponible ? "Disponible" : "Indisponible"}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {driver.Disponible ? "Pas de mission planifiée" : "A des missions planifiées"}
                        </div>
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
