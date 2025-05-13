
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Users, Settings, Database } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Espace Administration</h2>
          <p className="text-zinc-400">
            Bienvenue dans l'espace d'administration de Hermes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gestion des utilisateurs
              </CardTitle>
              <Users className="h-4 w-4 text-hermes-green" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400">
                Gérer les comptes utilisateurs et leurs permissions
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Paramètres système
              </CardTitle>
              <Settings className="h-4 w-4 text-hermes-green" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400">
                Configurer les paramètres globaux de la plateforme
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Base de données
              </CardTitle>
              <Database className="h-4 w-4 text-hermes-green" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400">
                Accédez aux données et à la configuration de la base de données
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-hermes-green/30 bg-zinc-800 text-white">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-hermes-green" />
              <CardTitle>Accès administrateur</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              Vous êtes connecté en tant qu'administrateur système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300">
              Cette section vous donne accès à toutes les fonctionnalités avancées 
              de la plateforme Hermes. Vous pouvez gérer les utilisateurs, configurer 
              les paramètres système et surveiller l'activité.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
