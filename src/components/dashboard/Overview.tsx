
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MissionChart } from "./MissionChart";
import { VehicleTypeChart } from "./VehicleTypeChart";
import { OverviewChart } from "./OverviewChart";

export function Overview() {
  const { hasFinanceAccess } = useAuth();

  // Données mockées pour les missions récentes
  const missions = [
    {
      id: "M-001",
      Client: "Ville de Paris",
      Chauffeur: "Jean Martin",
      Vehicule: "Renault Master",
      Etat_Mission: "En cours",
      Montant_Facturé: 350.75,
    },
    {
      id: "M-002",
      Client: "Société ABC",
      Chauffeur: "Maria Garcia",
      Vehicule: "Peugeot Expert",
      Etat_Mission: "Planifiée",
      Montant_Facturé: 220.0,
    },
    {
      id: "M-003",
      Client: "École Primaire Victor Hugo",
      Chauffeur: "Thomas Petit",
      Vehicule: "Mercedes Sprinter",
      Etat_Mission: "Terminée",
      Montant_Facturé: 415.50,
    },
    {
      id: "M-004",
      Client: "Association Culturelle",
      Chauffeur: "Sophie Dubois",
      Vehicule: "Citroën Jumpy",
      Etat_Mission: "Terminée",
      Montant_Facturé: 180.25,
    },
    {
      id: "M-005",
      Client: "Entreprise XYZ",
      Chauffeur: "Michel Lambert",
      Vehicule: "Ford Transit",
      Etat_Mission: "Planifiée",
      Montant_Facturé: 275.0,
    }
  ];

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        <TabsTrigger value="reports">Rapports</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        {/* Bloc métriques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Véhicules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value">42</div>
              <p className="stat-indicator stat-indicator-positive">+2 depuis le mois dernier</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Véhicules Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value">36</div>
              <p className="stat-indicator stat-indicator-neutral">6 véhicules en maintenance</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Missions Aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value">12</div>
              <p className="stat-indicator stat-indicator-neutral">5 en cours, 4 planifiées, 3 terminées</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Note Moyenne Chauffeurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value">4.8/5</div>
              <p className="stat-indicator stat-indicator-positive">+0.2</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Score Écologique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value">78/100</div>
              <p className="stat-indicator stat-indicator-positive">+3</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Bloc graphiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Évolution des missions</CardTitle>
              <CardDescription>Nombre de missions sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <MissionChart />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Types de véhicules</CardTitle>
              <CardDescription>Répartition du parc par catégorie</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <VehicleTypeChart />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-7">
            <CardHeader>
              <CardTitle>Performance globale</CardTitle>
              <CardDescription>Missions vs. Revenus mensuels</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <OverviewChart hideFinancialData={!hasFinanceAccess} />
            </CardContent>
          </Card>
        </div>
        
        {/* Bloc missions récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Missions Récentes</CardTitle>
            <CardDescription>Les 5 dernières missions enregistrées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Chauffeur</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Véhicule</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.map((mission) => (
                    <tr key={mission.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{mission.id}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{mission.Client}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{mission.Chauffeur}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{mission.Vehicule}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`
                            ${mission.Etat_Mission === "En cours" ? "bg-info text-info-foreground" : ""}
                            ${mission.Etat_Mission === "Planifiée" ? "bg-warning text-warning-foreground" : ""}
                            ${mission.Etat_Mission === "Terminée" ? "bg-success text-success-foreground" : ""}
                          `}
                        >
                          {mission.Etat_Mission}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {hasFinanceAccess ? (
                          `${mission.Montant_Facturé.toFixed(2)} €`
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted-foreground cursor-not-allowed">Accès restreint</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Vous n'avez pas les droits d'accès aux données financières</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytiques</CardTitle>
            <CardDescription>Analyse détaillée des performances</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Contenu des analytiques à venir...</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Rapports</CardTitle>
            <CardDescription>Rapports d'activité et synthèses</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Contenu des rapports à venir...</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
