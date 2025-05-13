
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, Download, RefreshCw, HardDrive, Server, AlertCircle } from "lucide-react";
import { useTableData } from "@/hooks/useTableData";
import { useDbStats } from "@/hooks/useDbStats";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

export default function AdminDatabasePage() {
  const { data: tables = [], isLoading: isTablesLoading, isError: isTablesError, refetch: refetchTables } = useTableData();
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError, refetch: refetchStats } = useDbStats();

  const handleRefresh = async () => {
    await Promise.all([refetchTables(), refetchStats()]);
    toast({
      title: "Données actualisées",
      description: "Les informations de la base de données ont été mises à jour avec succès.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export lancé",
      description: "L'export des données a été initialisé. Vous recevrez une notification quand il sera terminé.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Base de Données</h2>
          <p className="text-zinc-400">
            Gérez la base de données et les sauvegardes
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Espace disque</CardTitle>
              <HardDrive className="h-4 w-4 text-hermes-green" />
            </CardHeader>
            <CardContent className="pt-2">
              {isStatsLoading ? (
                <>
                  <Skeleton className="h-8 w-full bg-zinc-700 mb-2" />
                  <Skeleton className="h-2 w-full bg-zinc-700 mb-2" />
                  <Skeleton className="h-4 w-20 bg-zinc-700" />
                </>
              ) : isStatsError ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <p className="text-sm text-red-400">Erreur de chargement</p>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.diskUsage.used} GB / {stats.diskUsage.total} GB</div>
                  <Progress className="mt-2" value={stats.diskUsage.percentage} />
                  <p className="text-xs text-zinc-400 mt-2">{stats.diskUsage.percentage}% d'espace utilisé</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tables</CardTitle>
              <Database className="h-4 w-4 text-hermes-green" />
            </CardHeader>
            <CardContent className="pt-2">
              {isStatsLoading ? (
                <>
                  <Skeleton className="h-8 w-16 bg-zinc-700 mb-2" />
                  <Skeleton className="h-4 w-48 bg-zinc-700" />
                </>
              ) : isStatsError ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <p className="text-sm text-red-400">Erreur de chargement</p>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.tableCount}</div>
                  <p className="text-xs text-zinc-400 mt-2">{stats.totalRows} enregistrements au total</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dernière sauvegarde</CardTitle>
              <Server className="h-4 w-4 text-hermes-green" />
            </CardHeader>
            <CardContent className="pt-2">
              {isStatsLoading ? (
                <>
                  <Skeleton className="h-8 w-32 bg-zinc-700 mb-2" />
                  <Skeleton className="h-4 w-48 bg-zinc-700" />
                </>
              ) : isStatsError ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <p className="text-sm text-red-400">Erreur de chargement</p>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{new Date(stats.lastBackupDate).toLocaleDateString('fr-FR')}</div>
                  <p className="text-xs text-zinc-400 mt-2">Sauvegarde automatique quotidienne</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-800 border-zinc-700 text-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-hermes-green" />
                <CardTitle>Tables de la base de données</CardTitle>
              </div>
              <Button 
                variant="outline" 
                className="h-8 border-zinc-700 text-zinc-300 hover:text-white"
                onClick={handleRefresh}
                disabled={isTablesLoading || isStatsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(isTablesLoading || isStatsLoading) ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
            <CardDescription className="text-zinc-400">
              Liste des tables principales et leur statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isTablesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full bg-zinc-700" />
                <Skeleton className="h-12 w-full bg-zinc-700" />
                <Skeleton className="h-12 w-full bg-zinc-700" />
                <Skeleton className="h-12 w-full bg-zinc-700" />
              </div>
            ) : isTablesError ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
                <p className="text-red-400">Erreur lors du chargement des données des tables.</p>
                <Button variant="outline" onClick={() => refetchTables()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Database className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Aucune table trouvée dans la base de données.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-900">
                  <TableRow>
                    <TableHead className="text-zinc-400">Nom de la table</TableHead>
                    <TableHead className="text-zinc-400 text-right">Lignes</TableHead>
                    <TableHead className="text-zinc-400 text-right">Taille estimée</TableHead>
                    <TableHead className="text-zinc-400 text-right">Dernière sauvegarde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map(table => (
                    <TableRow key={table.name} className="border-zinc-700">
                      <TableCell className="font-medium text-white">{table.name}</TableCell>
                      <TableCell className="text-right">{table.rows}</TableCell>
                      <TableCell className="text-right">{table.size}</TableCell>
                      <TableCell className="text-right">{new Date(table.lastBackup).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="border-t border-zinc-700 flex justify-between">
            <div className="text-sm text-zinc-400">
              {tables.length} {tables.length > 1 ? "tables affichées" : "table affichée"}
            </div>
            <Button 
              variant="outline" 
              className="h-8 border-zinc-700 text-zinc-300 hover:text-white"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter les données
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}
