
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Lock, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Paramètres Système</h2>
          <p className="text-zinc-400">
            Configurez les paramètres globaux de la plateforme
          </p>
        </div>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-hermes-green" />
              <CardTitle className="text-white">Configuration Générale</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              Paramètres principaux de l'application Hermes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="bg-zinc-700">
                <TabsTrigger value="general" className="data-[state=active]:bg-hermes-green data-[state=active]:text-black">
                  Général
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-hermes-green data-[state=active]:text-black">
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-hermes-green data-[state=active]:text-black">
                  Sécurité
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="site-name" className="text-white">Nom du site</Label>
                    <Input id="site-name" defaultValue="Hermes Fleet Management" className="bg-zinc-700 border-zinc-600 text-white" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="site-description" className="text-white">Description</Label>
                    <Input id="site-description" defaultValue="Plateforme de gestion de flottes de véhicules" className="bg-zinc-700 border-zinc-600 text-white" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance-mode" className="text-white">Mode maintenance</Label>
                      <p className="text-sm text-zinc-400">Activer le mode maintenance pour le site</p>
                    </div>
                    <Switch id="maintenance-mode" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="language" className="text-white">Langue par défaut</Label>
                      <p className="text-sm text-zinc-400">Langue utilisée pour les nouveaux utilisateurs</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-zinc-400" />
                      <span className="text-white">Français</span>
                    </div>
                  </div>
                </div>
                
                <Button className="bg-hermes-green hover:bg-hermes-green/80 text-black mt-4">
                  Enregistrer les modifications
                </Button>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-white">Notifications par email</Label>
                      <p className="text-sm text-zinc-400">Envoyer des notifications par email aux utilisateurs</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="system-notifications" className="text-white">Notifications système</Label>
                      <p className="text-sm text-zinc-400">Afficher des notifications dans l'interface</p>
                    </div>
                    <Switch id="system-notifications" defaultChecked />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email-sender" className="text-white">Adresse d'expéditeur</Label>
                    <Input id="email-sender" defaultValue="noreply@hermes.fr" className="bg-zinc-700 border-zinc-600 text-white" />
                  </div>
                </div>
                
                <Button className="bg-hermes-green hover:bg-hermes-green/80 text-black mt-4">
                  Enregistrer les modifications
                </Button>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor" className="text-white">Authentification à deux facteurs</Label>
                      <p className="text-sm text-zinc-400">Exiger 2FA pour tous les utilisateurs administrateurs</p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="password-policy" className="text-white">Politique de mot de passe renforcée</Label>
                      <p className="text-sm text-zinc-400">Exiger des mots de passe complexes</p>
                    </div>
                    <Switch id="password-policy" defaultChecked />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="session-timeout" className="text-white">Délai d'expiration de session (minutes)</Label>
                    <Input id="session-timeout" type="number" defaultValue="30" className="bg-zinc-700 border-zinc-600 text-white" />
                  </div>
                </div>
                
                <Button className="bg-hermes-green hover:bg-hermes-green/80 text-black mt-4">
                  Enregistrer les modifications
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
