
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
import { AddVehicleForm } from "./AddVehicleForm";
import { VehicleDetailModal } from "./VehicleDetailModal";

// Données mockées des entreprises
const entreprises = {
  "E-001": "Ville de Paris",
  "E-002": "Académie de Lyon",
  "E-003": "Transport Express",
  "E-004": "LogiMobile",
  "E-005": "Société ABC",
};

// Données mockées des véhicules
const vehicles = [
  {
    ID_Vehicule: "V-001",
    Type_Vehicule: "Utilitaire",
    Capacite: 3,
    Type_Carburant: "Diesel",
    Score_Ecologique: 65,
    Note_Moyenne_Client: 86,
    Entretien: "2023-05-15",
    Immatriculation: "AB-123-CD",
    Statut: "Disponible",
    Marque: "Renault",
    Modele: "Master",
    Kilometrage: 45000,
    Photo: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&h=200&fit=crop",
    ID_Entreprise: "E-001",
  },
  {
    ID_Vehicule: "V-002",
    Type_Vehicule: "Berline",
    Capacite: 4,
    Type_Carburant: "Essence",
    Score_Ecologique: 70,
    Note_Moyenne_Client: 90,
    Entretien: "2023-06-20",
    Immatriculation: "EF-456-GH",
    Statut: "En maintenance",
    Marque: "Peugeot",
    Modele: "508",
    Kilometrage: 32000,
    Photo: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&h=200&fit=crop",
    ID_Entreprise: "E-003",
  },
  {
    ID_Vehicule: "V-003",
    Type_Vehicule: "Mini Bus",
    Capacite: 9,
    Type_Carburant: "Diesel",
    Score_Ecologique: 55,
    Note_Moyenne_Client: 85,
    Entretien: "2023-07-10",
    Immatriculation: "IJ-789-KL",
    Statut: "Disponible",
    Marque: "Mercedes",
    Modele: "Vito",
    Kilometrage: 58000,
    Photo: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop",
    ID_Entreprise: "E-002",
  },
  {
    ID_Vehicule: "V-004",
    Type_Vehicule: "SUV",
    Capacite: 5,
    Type_Carburant: "Hybride",
    Score_Ecologique: 85,
    Note_Moyenne_Client: 92,
    Entretien: "2023-08-05",
    Immatriculation: "MN-012-OP",
    Statut: "Disponible",
    Marque: "Toyota",
    Modele: "RAV4",
    Kilometrage: 28000,
    Photo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&h=200&fit=crop",
    ID_Entreprise: "E-004",
  },
  {
    ID_Vehicule: "V-005",
    Type_Vehicule: "Berline",
    Capacite: 4,
    Type_Carburant: "Electrique",
    Score_Ecologique: 95,
    Note_Moyenne_Client: 94,
    Entretien: "2023-09-15",
    Immatriculation: "QR-345-ST",
    Statut: "Disponible",
    Marque: "Tesla",
    Modele: "Model 3",
    Kilometrage: 15000,
    Photo: "https://images.unsplash.com/photo-1561580125-028ee3bd62eb?w=300&h=200&fit=crop",
    ID_Entreprise: "E-005",
  },
  {
    ID_Vehicule: "V-006",
    Type_Vehicule: "Bus",
    Capacite: 45,
    Type_Carburant: "Diesel",
    Score_Ecologique: 50,
    Note_Moyenne_Client: 82,
    Entretien: "2023-10-05",
    Immatriculation: "UV-678-WX",
    Statut: "Disponible",
    Marque: "Mercedes",
    Modele: "Citaro",
    Kilometrage: 75000,
    Photo: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&h=200&fit=crop",
    ID_Entreprise: "E-001",
  },
  {
    ID_Vehicule: "V-007",
    Type_Vehicule: "Bus",
    Capacite: 50,
    Type_Carburant: "Electrique",
    Score_Ecologique: 90,
    Note_Moyenne_Client: 95,
    Entretien: "2023-11-20",
    Immatriculation: "YZ-901-AB",
    Statut: "Disponible",
    Marque: "Volvo",
    Modele: "7900 Electric",
    Kilometrage: 32000,
    Photo: "https://images.unsplash.com/photo-1597733153203-a54d0fbc47de?w=300&h=200&fit=crop",
    ID_Entreprise: "E-003",
  },
];

export function VehiclesManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("Tous");
  const [statusFilter, setStatusFilter] = useState<string>("Tous");

  // Filtrage des véhicules
  const filteredVehicles = vehicles.filter((v) => {
    // 1. Recherche textuelle
    const matchesSearch =
      v.ID_Vehicule.includes(searchTerm) ||
      v.Immatriculation.includes(searchTerm) ||
      v.Marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.Modele.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filtre par type
    const matchesType = typeFilter === "Tous" || v.Type_Vehicule === typeFilter;

    // 3. Filtre par statut
    const matchesStatus = statusFilter === "Tous" || v.Statut === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Types de véhicules uniques pour le filtre
  const vehicleTypes = ["Tous", ...Array.from(new Set(vehicles.map((v) => v.Type_Vehicule)))];
  
  // Statuts de véhicules uniques pour le filtre
  const vehicleStatuses = ["Tous", ...Array.from(new Set(vehicles.map((v) => v.Statut)))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Input
            placeholder="Rechercher un véhicule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              {vehicleStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          
          <AddVehicleForm />
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Marque / Modèle</TableHead>
                <TableHead>Immatriculation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacité</TableHead>
                <TableHead>Carburant</TableHead>
                <TableHead>Score Écologique</TableHead>
                <TableHead>Note Moy. Client</TableHead>
                <TableHead>Entretien</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Kilométrage</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((v) => (
                <TableRow key={v.ID_Vehicule}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={v.Photo} alt={`${v.Marque} ${v.Modele}`} />
                      <AvatarFallback>{v.Marque.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{v.ID_Vehicule}</TableCell>
                  <TableCell>{v.Marque} {v.Modele}</TableCell>
                  <TableCell>{v.Immatriculation}</TableCell>
                  <TableCell>{v.Type_Vehicule}</TableCell>
                  <TableCell>{v.Capacite} places</TableCell>
                  <TableCell>{v.Type_Carburant}</TableCell>
                  <TableCell>{v.Score_Ecologique}</TableCell>
                  <TableCell>{(v.Note_Moyenne_Client / 20).toFixed(1)}/5</TableCell>
                  <TableCell>{v.Entretien}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`
                        ${v.Statut === "Disponible" ? "bg-success text-success-foreground" : ""}
                        ${v.Statut === "En maintenance" ? "bg-warning text-warning-foreground" : ""}
                      `}
                    >
                      {v.Statut}
                    </Badge>
                  </TableCell>
                  <TableCell>{v.Kilometrage.toLocaleString()} km</TableCell>
                  <TableCell>{entreprises[v.ID_Entreprise as keyof typeof entreprises]}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Détails
                        </Button>
                      </DialogTrigger>
                      <VehicleDetailModal vehicle={v} />
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
