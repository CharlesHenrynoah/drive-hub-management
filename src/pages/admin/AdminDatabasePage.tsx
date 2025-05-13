
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, Download, RefreshCw, HardDrive, Server } from "lucide-react";

export default function AdminDatabasePage() {
  // Données d'exemple pour les tables
  const tables = [
    { name: "vehicles", rows: 145, size: "2.3 MB", lastBackup: "2023-10-15" },
    { name: "drivers", rows: 87, size: "1.1 MB", lastBackup: "2023-10-15" },
    { name: "missions", rows: 342, size: "4.6 MB", lastBackup: "2023-10-15" },
    { name: "users", rows: 23, size: "0.4 MB", lastBackup: "2023-10-15" },
    { name: "companies", rows: 12, size: "0.3 MB", lastBackup: "2023-10-15" },
  ];

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
              <div className="text-2xl font-bold">8.7 GB / 20 GB</div>
              <Progress className="mt-2" value={43.5} />
              <p className="text-xs text-zinc-400 mt-2">43.5% d'espace utilisé</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tables</CardTitle>
              <Database className="h-4 w-4 text-hermes-green" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-zinc-400 mt-2">609 enregistrements au total</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dernière sauvegarde</CardTitle>
              <Server className="h-4 w-4 text-hermes-green" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl font-bold">15/10/2023</div>
              <p className="text-xs text-zinc-400 mt-2">Sauvegarde automatique quotidienne</p>
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
              <Button variant="outline" className="h-8 border-zinc-700 text-zinc-300 hover:text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
            <CardDescription className="text-zinc-400">
              Liste des tables principales et leur statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-zinc-900">
                <TableRow>
                  <TableHead className="text-zinc-400">Nom de la table</TableHead>
                  <TableHead className="text-zinc-400 text-right">Lignes</TableHead>
                  <TableHead className="text-zinc-400 text-right">Taille</TableHead>
                  <TableHead className="text-zinc-400 text-right">Dernière sauvegarde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map(table => (
                  <TableRow key={table.name} className="border-zinc-700">
                    <TableCell className="font-medium text-white">{table.name}</TableCell>
                    <TableCell className="text-right">{table.rows}</TableCell>
                    <TableCell className="text-right">{table.size}</TableCell>
                    <TableCell className="text-right">{table.lastBackup}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="border-t border-zinc-700 flex justify-between">
            <div className="text-sm text-zinc-400">5 tables affichées sur 15 au total</div>
            <Button variant="outline" className="h-8 border-zinc-700 text-zinc-300 hover:text-white">
              <Download className="h-4 w-4 mr-2" />
              Exporter les données
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}
