
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
import { supabase } from "@/integrations/supabase/client";

export type Vehicle = {
  id: string;
  type: string;
  capacity: number;
  fuel_type: string;
  ecological_score: number;
  last_maintenance: string;
  registration: string;
  status: string;
  brand: string;
  model: string;
  mileage: number;
  photo_url: string | null;
  company_id: string | null;
  Note_Moyenne_Client?: number; // Keeping for compatibility
};

export type Company = {
  id: string;
  name: string;
};

export function VehiclesManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("Tous");
  const [statusFilter, setStatusFilter] = useState<string>("Tous");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
    fetchCompanies();
  }, []);

  async function fetchVehicles() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Add client-side mock data for now
        const enhancedData = data.map(v => ({
          ...v,
          Note_Moyenne_Client: Math.floor(Math.random() * 20) + 80 // Random score between 80-100
        }));
        setVehicles(enhancedData);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const companyMap: Record<string, string> = {};
        data.forEach(company => {
          companyMap[company.id] = company.name;
        });
        setCompanies(companyMap);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }

  // Filtrage des véhicules
  const filteredVehicles = vehicles.filter((v) => {
    // 1. Recherche textuelle
    const matchesSearch =
      v.id.includes(searchTerm) ||
      v.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filtre par type
    const matchesType = typeFilter === "Tous" || v.type === typeFilter;

    // 3. Filtre par statut
    const matchesStatus = statusFilter === "Tous" || v.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Types de véhicules uniques pour le filtre
  const vehicleTypes = ["Tous", ...Array.from(new Set(vehicles.map((v) => v.type)))];
  
  // Statuts de véhicules uniques pour le filtre
  const vehicleStatuses = ["Tous", ...Array.from(new Set(vehicles.map((v) => v.status)))];

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-6">Chargement des données...</TableCell>
                </TableRow>
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-6">Aucun véhicule trouvé</TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={v.photo_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop"} alt={`${v.brand} ${v.model}`} />
                        <AvatarFallback>{v.brand.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{v.id.substring(0, 8)}...</TableCell>
                    <TableCell>{v.brand} {v.model}</TableCell>
                    <TableCell>{v.registration}</TableCell>
                    <TableCell>{v.type}</TableCell>
                    <TableCell>{v.capacity} places</TableCell>
                    <TableCell>{v.fuel_type}</TableCell>
                    <TableCell>{v.ecological_score}</TableCell>
                    <TableCell>{((v.Note_Moyenne_Client || 85) / 20).toFixed(1)}/5</TableCell>
                    <TableCell>{new Date(v.last_maintenance || Date.now()).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`
                          ${v.status === "Disponible" ? "bg-success text-success-foreground" : ""}
                          ${v.status === "En maintenance" ? "bg-warning text-warning-foreground" : ""}
                        `}
                      >
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{v.mileage?.toLocaleString() || "0"} km</TableCell>
                    <TableCell>{v.company_id ? companies[v.company_id] || "N/A" : "N/A"}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Détails
                          </Button>
                        </DialogTrigger>
                        <VehicleDetailModal vehicle={v} companyName={v.company_id ? companies[v.company_id] : undefined} />
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
