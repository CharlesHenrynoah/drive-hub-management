
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
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Download, Edit, MapPin, Trash2 } from "lucide-react";
import { AddVehicleForm } from "./AddVehicleForm";
import { VehicleDetailModal } from "./VehicleDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  year?: number;
  Note_Moyenne_Client?: number; 
  location?: string;
};

export type Company = {
  id: string;
  name: string;
};

export function VehiclesManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("Tous");
  const [statusFilter, setStatusFilter] = useState<string>("Tous");
  const [locationFilter, setLocationFilter] = useState<string>("Toutes");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (vehicle?: Vehicle) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
    }
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchVehicles(); // Refresh the vehicles list
    setIsEditModalOpen(false);
    setSelectedVehicle(null);
    toast.success("Véhicule modifié avec succès");
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return;
    
    try {
      // First check if the vehicle is used in any fleet
      const { data: fleetVehicles, error: fleetCheckError } = await supabase
        .from('fleet_vehicles')
        .select('*')
        .eq('vehicle_id', selectedVehicle.id);
      
      if (fleetCheckError) {
        throw fleetCheckError;
      }
      
      if (fleetVehicles && fleetVehicles.length > 0) {
        toast.error("Ce véhicule est utilisé dans une ou plusieurs flottes et ne peut pas être supprimé");
        setIsDeleteDialogOpen(false);
        return;
      }
      
      // Proceed with deletion
      const { error: deleteError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', selectedVehicle.id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      toast.success("Véhicule supprimé avec succès");
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      fetchVehicles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error("Erreur lors de la suppression du véhicule");
    }
  };

  // Filtrage des véhicules
  const filteredVehicles = vehicles.filter((v) => {
    // 1. Recherche textuelle
    const matchesSearch =
      v.id?.includes(searchTerm) ||
      v.registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.location && v.location.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Filtre par type
    const matchesType = typeFilter === "Tous" || v.type === typeFilter;

    // 3. Filtre par statut
    const matchesStatus = statusFilter === "Tous" || v.status === statusFilter;
    
    // 4. Filtre par localisation
    const matchesLocation = locationFilter === "Toutes" || v.location === locationFilter;

    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  // Types de véhicules uniques pour le filtre
  const vehicleTypes = ["Tous", ...Array.from(new Set(vehicles.map((v) => v.type)))];
  
  // Statuts de véhicules uniques pour le filtre
  const vehicleStatuses = ["Tous", ...Array.from(new Set(vehicles.map((v) => v.status)))];
  
  // Localisations uniques pour le filtre
  const vehicleLocations = ["Toutes", ...Array.from(new Set(vehicles.filter(v => v.location).map((v) => v.location as string)))];

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
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrer par localisation" />
            </SelectTrigger>
            <SelectContent>
              {vehicleLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
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
          
          {/* Ensure the AddVehicleForm is properly used here */}
          <AddVehicleForm onSuccess={fetchVehicles} />
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <ScrollArea className="w-full h-[calc(100vh-250px)]">
            <div className="min-w-[1200px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Photo</TableHead>
                    <TableHead className="w-24">ID</TableHead>
                    <TableHead className="w-48">Marque / Modèle</TableHead>
                    <TableHead className="w-36">Immatriculation</TableHead>
                    <TableHead className="w-32">Type</TableHead>
                    <TableHead className="w-32">Capacité</TableHead>
                    <TableHead className="w-32">Carburant</TableHead>
                    <TableHead className="w-36">Localisation</TableHead>
                    <TableHead className="w-36">Score Écologique</TableHead>
                    <TableHead className="w-36">Note Moy. Client</TableHead>
                    <TableHead className="w-36">Entretien</TableHead>
                    <TableHead className="w-32">Statut</TableHead>
                    <TableHead className="w-32">Kilométrage</TableHead>
                    <TableHead className="w-36">Entreprise</TableHead>
                    <TableHead className="w-40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center py-6">Chargement des données...</TableCell>
                    </TableRow>
                  ) : filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center py-6">Aucun véhicule trouvé</TableCell>
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
                        <TableCell>
                          {v.location ? (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {v.location}
                            </span>
                          ) : "N/A"}
                        </TableCell>
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
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleVehicleClick(v)}>
                              Détails
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(v)} className="text-blue-500">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(v)} className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Detail Modal */}
      {selectedVehicle && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <VehicleDetailModal 
            vehicle={selectedVehicle} 
            companyName={selectedVehicle.company_id ? companies[selectedVehicle.company_id] : undefined} 
            onEdit={handleEditClick}
          />
        </Dialog>
      )}
      
      {/* Edit Modal */}
      {selectedVehicle && (
        <AddVehicleForm 
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          vehicleToEdit={selectedVehicle}
          onSuccess={handleEditSuccess}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce véhicule ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le véhicule {selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.registration}) sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
