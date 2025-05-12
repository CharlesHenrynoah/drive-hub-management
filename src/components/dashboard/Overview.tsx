import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MissionChart } from "./MissionChart";
import { VehicleTypeChart } from "./VehicleTypeChart";
import { OverviewChart } from "./OverviewChart";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function Overview() {
  const { hasFinanceAccess } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    missionsToday: 0,
    driverRating: 0,
    ecologicalScore: 0,
    missionsInProgress: 0,
    missionsPlanned: 0,
    missionsCompleted: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les véhicules
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*');
        
        if (vehiclesError) throw vehiclesError;
        
        // Récupérer les chauffeurs
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*');
        
        if (driversError) throw driversError;
        
        // Récupérer les missions avec les informations des chauffeurs, véhicules et entreprises
        const { data: missionsData, error: missionsError } = await supabase
          .from('missions')
          .select(`
            *,
            drivers:driver_id(prenom, nom),
            vehicles:vehicle_id(brand, model, registration),
            companies:company_id(name)
          `)
          .order('date', { ascending: false })
          .limit(5);
        
        if (missionsError) throw missionsError;

        // Calculer les statistiques
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const missionsByDate = missionsData.filter(mission => {
          const missionDate = new Date(mission.date);
          missionDate.setHours(0, 0, 0, 0);
          return missionDate.getTime() === today.getTime();
        });
        
        const missionsInProgress = missionsByDate.filter(m => m.status === 'en_cours').length;
        const missionsPlanned = missionsByDate.filter(m => m.status === 'planifiee').length;
        const missionsCompleted = missionsByDate.filter(m => m.status === 'terminee').length;

        const availableVehicles = vehiclesData.filter(v => v.status === 'Disponible').length;
        
        // Calculer le score écologique moyen
        const ecologicalScores = vehiclesData
          .filter(v => v.ecological_score !== null)
          .map(v => v.ecological_score);
          
        const avgEcoScore = ecologicalScores.length 
          ? Math.round(ecologicalScores.reduce((acc, score) => acc + score, 0) / ecologicalScores.length) 
          : 0;
        
        // Mettre à jour l'état
        setVehicles(vehiclesData);
        setDrivers(driversData);
        setMissions(missionsData);
        setStats({
          totalVehicles: vehiclesData.length,
          availableVehicles,
          missionsToday: missionsByDate.length,
          driverRating: 4.8, // Note: Valeur mockée car pas encore implémentée dans la base
          ecologicalScore: avgEcoScore,
          missionsInProgress,
          missionsPlanned,
          missionsCompleted
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour formater correctement le statut d'une mission
  const formatMissionStatus = (status) => {
    switch (status) {
      case "en_cours": return "En cours";
      case "planifiee": return "Planifiée";
      case "terminee": return "Terminée";
      case "annulee": return "Annulée";
      default: return status;
    }
  };

  // Fonction pour obtenir la classe CSS du statut
  const getMissionStatusClass = (status) => {
    switch (status) {
      case "en_cours": return "bg-info text-info-foreground";
      case "planifiee": return "bg-warning text-warning-foreground";
      case "terminee": return "bg-success text-success-foreground";
      case "annulee": return "bg-destructive text-destructive-foreground";
      default: return "";
    }
  };

  // Fonction pour formater le nom complet du chauffeur
  const formatDriverName = (driver) => {
    if (!driver) return "Non assigné";
    return `${driver.prenom} ${driver.nom}`;
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Chargement des données...</p>
        </div>
      ) : (
        <>
          {/* Bloc métriques */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Véhicules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVehicles}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {vehicles.length > 0 ? `${vehicles.length} véhicules enregistrés` : "Aucun véhicule"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Véhicules Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.availableVehicles}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalVehicles - stats.availableVehicles} véhicules indisponibles
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Missions Aujourd'hui</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.missionsToday}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.missionsInProgress} en cours, {stats.missionsPlanned} planifiées, {stats.missionsCompleted} terminées
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Chauffeurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{drivers.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {drivers.filter(d => d.disponible).length} disponibles
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Score Écologique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ecologicalScore}/100</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.ecologicalScore > 70 ? "Bon" : stats.ecologicalScore > 50 ? "Moyen" : "À améliorer"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Bloc graphiques */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Évolution des missions</CardTitle>
                <CardDescription>Nombre de missions sur les 6 derniers mois</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <MissionChart />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Types de véhicules</CardTitle>
                <CardDescription>Répartition du parc par catégorie</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <VehicleTypeChart />
              </CardContent>
            </Card>
          </div>
          
          {/* Bloc missions récentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Missions Récentes</CardTitle>
                <CardDescription>Les dernières missions enregistrées</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Chauffeur</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    {hasFinanceAccess && <TableHead>Montant</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={hasFinanceAccess ? 7 : 6} className="text-center py-4">
                        Aucune mission enregistrée
                      </TableCell>
                    </TableRow>
                  ) : (
                    missions.map((mission) => (
                      <TableRow key={mission.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{mission.id.substring(0, 8)}</TableCell>
                        <TableCell>{mission.client || (mission.companies?.name || "N/A")}</TableCell>
                        <TableCell>{formatDriverName(mission.drivers)}</TableCell>
                        <TableCell>
                          {mission.vehicles 
                            ? `${mission.vehicles.brand} ${mission.vehicles.model} (${mission.vehicles.registration})` 
                            : "Non assigné"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(mission.date), "dd MMM yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getMissionStatusClass(mission.status)}>
                            {formatMissionStatus(mission.status)}
                          </Badge>
                        </TableCell>
                        {hasFinanceAccess && (
                          <TableCell>
                            {/* Montant serait ajouté ici si nous l'avions dans la base de données */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-muted-foreground cursor-not-allowed">N/A</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Information non disponible</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
