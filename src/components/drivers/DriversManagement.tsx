
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
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Download, Loader2, Edit, Trash2 } from "lucide-react";
import { AddDriverForm } from "./AddDriverForm";
import { DriverDetailModal } from "./DriverDetailModal";
import { Driver } from "@/types/driver";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interface pour les entreprises
interface Company {
  id: string;
  name: string;
}

export function DriversManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [durationFilter, setDurationFilter] = useState<string>("Tous");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("Tous");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fonction pour charger les entreprises depuis Supabase
  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');
      
      if (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
        toast.error("Impossible de charger les entreprises");
        return;
      }

      if (data) {
        // Convertir le tableau en objet pour un accès facile
        const companiesMap: Record<string, string> = {};
        data.forEach((company: Company) => {
          companiesMap[company.id] = company.name;
        });
        setCompanies(companiesMap);
      }
    } catch (error) {
      console.error("Erreur inattendue:", error);
    }
    setIsLoadingCompanies(false);
  };

  // Fonction pour charger les chauffeurs depuis Supabase
  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Erreur lors du chargement des chauffeurs:", error);
        toast.error("Impossible de charger les chauffeurs");
        setIsLoading(false);
        return;
      }

      if (data) {
        // Transformer les données pour correspondre à notre structure Driver
        const transformedDrivers: Driver[] = data.map(driver => ({
          ID_Chauffeur: driver.id_chauffeur,
          Nom: driver.nom,
          Prénom: driver.prenom,
          Email: driver.email,
          Téléphone: driver.telephone,
          Pièce_Identité: driver.piece_identite,
          Certificat_Médical: driver.certificat_medical,
          Justificatif_Domicile: driver.justificatif_domicile,
          Date_Debut_Activité: new Date(driver.date_debut_activite),
          Note_Chauffeur: driver.note_chauffeur,
          Missions_Futures: [], // Nous n'avons pas ce champ dans la base de données pour l'instant
          Photo: driver.photo || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=300&h=300&fit=crop",
          ID_Entreprise: driver.id_entreprise,
          Disponible: driver.disponible,
        }));
        
        setDrivers(transformedDrivers);
      }
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast.error("Une erreur est survenue lors du chargement des chauffeurs");
    }
    setIsLoading(false);
  };

  // Vérifier si le chauffeur est utilisé dans des flottes
  const checkDriverInFleets = async (driverId: string) => {
    try {
      const { data, error, count } = await supabase
        .from('fleet_drivers')
        .select('*', { count: 'exact' })
        .eq('driver_id', driverId);
      
      if (error) {
        console.error("Erreur lors de la vérification des flottes:", error);
        return true; // En cas d'erreur, on considère que le chauffeur est utilisé par sécurité
      }
      
      return count !== null && count > 0;
    } catch (error) {
      console.error("Erreur inattendue:", error);
      return true; // En cas d'erreur, on considère que le chauffeur est utilisé par sécurité
    }
  };

  // Fonction pour supprimer un chauffeur
  const deleteDriver = async () => {
    if (!driverToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Vérifier si le chauffeur est utilisé dans des flottes
      const isUsedInFleets = await checkDriverInFleets(driverToDelete.ID_Chauffeur);
      
      if (isUsedInFleets) {
        toast.error("Impossible de supprimer ce chauffeur car il fait partie d'une ou plusieurs flottes.");
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        return;
      }
      
      // Supprimer le chauffeur de la base de données
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id_chauffeur', driverToDelete.ID_Chauffeur);
      
      if (error) {
        console.error("Erreur lors de la suppression du chauffeur:", error);
        toast.error("Impossible de supprimer le chauffeur");
        setIsDeleting(false);
        return;
      }
      
      // Supprimer le chauffeur de notre état local
      setDrivers(prevDrivers => prevDrivers.filter(driver => driver.ID_Chauffeur !== driverToDelete.ID_Chauffeur));
      toast.success("Chauffeur supprimé avec succès");
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast.error("Une erreur est survenue lors de la suppression du chauffeur");
    }
    
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
    setDriverToDelete(null);
  };

  // Charger les entreprises et les chauffeurs au chargement du composant
  useEffect(() => {
    loadCompanies();
    loadDrivers();
  }, []);

  // Function to add a new driver
  const addDriver = (driver: Driver) => {
    // Set the driver's availability
    const newDriver = {
      ...driver,
      Disponible: !driver.Missions_Futures || driver.Missions_Futures.length === 0
    };
    
    // Ajouter le chauffeur à notre état local et à Supabase
    setDrivers(prevDrivers => [newDriver, ...prevDrivers]);
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

  // Obtenir le nom de l'entreprise à partir de son ID
  const getCompanyName = (id: string): string => {
    if (isLoadingCompanies) return "Chargement...";
    return companies[id] || "Entreprise inconnue";
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
      
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Chargement des chauffeurs...</span>
        </div>
      ) : drivers.length === 0 ? (
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
                    <TableCell>{getCompanyName(driver.ID_Entreprise)}</TableCell>
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
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setSelectedDriver(driver)}>
                              <Edit className="h-4 w-4" />
                              Modifier
                            </Button>
                          </DialogTrigger>
                          {selectedDriver && selectedDriver.ID_Chauffeur === driver.ID_Chauffeur && (
                            <DriverDetailModal driver={selectedDriver} companies={companies} />
                          )}
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDriverToDelete(driver);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {driverToDelete?.Prénom} {driverToDelete?.Nom} ({driverToDelete?.ID_Chauffeur}) ?
              <br />
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteDriver}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
