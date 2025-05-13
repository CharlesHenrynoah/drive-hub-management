
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Users, Settings } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  
  // Vérifier si l'utilisateur a le rôle d'administrateur
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Espace Administration</h2>
          <p className="text-muted-foreground">
            Bienvenue dans l'espace d'administration de Hermes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gestion des utilisateurs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Gérer les comptes utilisateurs et leurs permissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Paramètres système
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Configurer les paramètres globaux de la plateforme
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sécurité
              </CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Gestion des accès et journaux d'activité
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-hermes-green/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-hermes-green" />
              <CardTitle>Accès administrateur</CardTitle>
            </div>
            <CardDescription>
              Vous êtes connecté en tant qu'administrateur système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Cette section vous donne accès à toutes les fonctionnalités avancées 
              de la plateforme Hermes. Vous pouvez gérer les utilisateurs, configurer 
              les paramètres système et surveiller l'activité.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
