
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCcw, MapPin, Truck, Trash2 } from "lucide-react";
import { VehiclesAddModal } from "./VehiclesAddModal";
import { VehiclesEditModal } from "./VehiclesEditModal";
import { VehicleDetailModal } from "./VehicleDetailModal";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function VehiclesManagement() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      toast.error(`Erreur lors du chargement des véhicules: ${error.message}`);
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = () => {
    setIsAddingVehicle(true);
  };

  const handleEditVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsEditing(true);
  };

  const handleViewDetails = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsViewingDetails(true);
  };

  const handleDeleteClick = (vehicle: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Check if the vehicle is associated with any fleets first
      const { data: fleetVehicles, error: fleetError } = await supabase
        .from('fleet_vehicles')
        .select('id')
        .eq('vehicle_id', vehicleToDelete.id);
        
      if (fleetError) {
        throw fleetError;
      }
      
      // If vehicle is assigned to fleets, remove those associations first
      if (fleetVehicles && fleetVehicles.length > 0) {
        const { error: deleteAssocError } = await supabase
          .from('fleet_vehicles')
          .delete()
          .eq('vehicle_id', vehicleToDelete.id);
          
        if (deleteAssocError) {
          throw deleteAssocError;
        }
        console.log(`Removed ${fleetVehicles.length} fleet associations for vehicle ${vehicleToDelete.id}`);
      }
      
      // Check if vehicle is assigned to any missions
      const { data: missionVehicles, error: missionError } = await supabase
        .from('missions')
        .select('id')
        .eq('vehicle_id', vehicleToDelete.id);
        
      if (missionError) {
        throw missionError;
      }
      
      // If vehicle is used in missions, warn user but proceed with deletion
      if (missionVehicles && missionVehicles.length > 0) {
        console.log(`Warning: Deleting vehicle used in ${missionVehicles.length} missions`);
        // We could update mission vehicle_id to null here if needed
      }
      
      // Now delete the vehicle
      const { error: deleteError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleToDelete.id);
        
      if (deleteError) throw deleteError;
      
      toast.success("Véhicule supprimé avec succès");
      
      // Refresh the vehicles list
      fetchVehicles();
      
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponible":
        return "bg-green-500 hover:bg-green-600";
      case "En mission":
        return "bg-blue-500 hover:bg-blue-600";
      case "En maintenance":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Hors service":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicle.location &&
        vehicle.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <Input
            placeholder="Rechercher un véhicule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchVehicles}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleAddVehicle}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un véhicule
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marque & Modèle</TableHead>
              <TableHead>Immatriculation</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacité</TableHead>
              <TableHead>Score écologique</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Chargement des véhicules...
                </TableCell>
              </TableRow>
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Aucun véhicule trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">
                    {vehicle.brand} {vehicle.model}
                  </TableCell>
                  <TableCell>{vehicle.registration}</TableCell>
                  <TableCell>{vehicle.vehicle_type || vehicle.type}</TableCell>
                  <TableCell>{vehicle.capacity} places</TableCell>
                  <TableCell>
                    {vehicle.ecological_score !== null ? (
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            vehicle.ecological_score >= 80
                              ? "bg-green-500"
                              : vehicle.ecological_score >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></span>
                        {vehicle.ecological_score}/100
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {vehicle.location ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                        {vehicle.location}
                      </div>
                    ) : (
                      "Non définie"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(vehicle.status)} text-white`}
                    >
                      {vehicle.status || "Disponible"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(vehicle)}
                      >
                        <Truck className="h-4 w-4" />
                        <span className="sr-only">Détails</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                        onClick={(e) => handleDeleteClick(vehicle, e)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isAddingVehicle && (
        <VehiclesAddModal
          isOpen={isAddingVehicle}
          onClose={() => setIsAddingVehicle(false)}
          onSuccess={() => {
            fetchVehicles();
            setIsAddingVehicle(false);
          }}
        />
      )}

      {isEditing && selectedVehicle && (
        <VehiclesEditModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          vehicle={selectedVehicle}
          onSuccess={() => {
            fetchVehicles();
            setIsEditing(false);
          }}
        />
      )}

      {isViewingDetails && selectedVehicle && (
        <VehicleDetailModal
          isOpen={isViewingDetails}
          onClose={() => setIsViewingDetails(false)}
          vehicle={selectedVehicle}
          onEdit={() => {
            setIsViewingDetails(false);
            handleEditVehicle(selectedVehicle);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce véhicule?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement le véhicule {vehicleToDelete?.brand} {vehicleToDelete?.model} ({vehicleToDelete?.registration}).
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setVehicleToDelete(null);
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
