
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Shield, User, FileText, CreditCard } from "lucide-react";

export default function AdminUsersPage() {
  // Exemple de données utilisateurs
  const users = [
    { id: 1, name: "Jean Dupont", email: "jean@exemple.fr", role: "admin", status: "Actif", hasLicense: true, hasVTC: true },
    { id: 2, name: "Marie Laurent", email: "marie@exemple.fr", role: "manager", status: "Actif", hasLicense: true, hasVTC: false },
    { id: 3, name: "Pierre Martin", email: "pierre@exemple.fr", role: "manager", status: "Inactif", hasLicense: false, hasVTC: false },
    { id: 4, name: "Sophie Dubois", email: "sophie@exemple.fr", role: "manager", status: "Actif", hasLicense: true, hasVTC: true },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Gestion des Utilisateurs</h2>
            <p className="text-zinc-400">
              Gérez les utilisateurs et leurs permissions
            </p>
          </div>
          <Button className="bg-hermes-green hover:bg-hermes-green/80 text-black">
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>

        <Card className="bg-zinc-800 border-zinc-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-hermes-green" />
              Liste des utilisateurs
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {users.length} utilisateurs enregistrés dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-zinc-900">
                <TableRow>
                  <TableHead className="text-zinc-400">Utilisateur</TableHead>
                  <TableHead className="text-zinc-400">Email</TableHead>
                  <TableHead className="text-zinc-400">Rôle</TableHead>
                  <TableHead className="text-zinc-400">Statut</TableHead>
                  <TableHead className="text-zinc-400">Documents</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id} className="border-zinc-700">
                    <TableCell className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-zinc-700 mr-2 flex items-center justify-center">
                        <User className="h-4 w-4 text-zinc-300" />
                      </div>
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-hermes-green/20 text-hermes-green' : 'bg-zinc-700 text-zinc-300'}`}>
                        {user.role === 'admin' ? 'Administrateur' : 'Gestionnaire'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${user.status === 'Actif' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.hasLicense ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-zinc-400'}`}>
                          <FileText className="h-3 w-3" />
                          Permis
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${user.hasVTC ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-700 text-zinc-400'}`}>
                          <CreditCard className="h-3 w-3" />
                          VTC
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 border-zinc-700 text-zinc-300 hover:text-white">
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 border-zinc-700 text-red-400 hover:text-red-300">
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
