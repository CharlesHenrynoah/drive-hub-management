
import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { MissionAPIDoc } from "@/docs/MissionAPIDoc";
import { AuthProvider } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileText, Code, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MissionsAPI() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="w-full max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold truncate">API de gestion des ressources</h1>
          </div>
          
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Cette API permet d'interagir avec votre système via des requêtes HTTPS externes. 
              Vous pouvez consulter, récupérer des ressources et créer des missions.
              Assurez-vous de sécuriser votre clé API et de ne la partager qu'avec des services autorisés.
            </AlertDescription>
          </Alert>
          
          <Tabs defaultValue="missions" className="mb-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="missions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Missions</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span>Ressources</span>
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Intégration</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="missions" className="mt-6">
              <MissionAPIDoc />
            </TabsContent>
            
            <TabsContent value="resources" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API des ressources disponibles</CardTitle>
                  <CardDescription>
                    Accédez aux informations sur vos chauffeurs, véhicules et flottes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Chauffeurs disponibles</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Récupérez la liste des chauffeurs disponibles à une date spécifique
                    </p>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                      GET https://nsfphygihklucqjiwngl.supabase.co/functions/v1/drivers-available?date=YYYY-MM-DD
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Véhicules disponibles</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Récupérez la liste des véhicules disponibles avec filtrage optionnel
                    </p>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                      GET https://nsfphygihklucqjiwngl.supabase.co/functions/v1/vehicles-available?date=YYYY-MM-DD&type=TYPE&fleet_id=FLEET_ID
                    </pre>
                    <p className="text-xs text-muted-foreground mt-2">
                      Les paramètres type et fleet_id sont optionnels
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Véhicules par flotte</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Récupérez tous les véhicules d'une flotte spécifique
                    </p>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                      GET https://nsfphygihklucqjiwngl.supabase.co/functions/v1/fleets/{"{fleet_id}"}/vehicles
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="integration" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Guide d'intégration</CardTitle>
                  <CardDescription>
                    Comment intégrer l'API dans votre application externe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Authentification</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Toutes les requêtes à l'API nécessitent un token d'authentification valide. 
                        Ce token doit être inclus dans l'en-tête d'autorisation de chaque requête.
                      </p>
                      <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                        Authorization: Bearer YOUR_API_TOKEN
                      </pre>
                      <p className="text-xs text-muted-foreground mt-2">
                        Les tokens API peuvent être générés et gérés dans la section Admin > API de l'application.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Formats de données</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        L'API utilise le format JSON pour toutes les requêtes et réponses.
                        Assurez-vous d'inclure l'en-tête Content-Type approprié pour les requêtes POST.
                      </p>
                      <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                        Content-Type: application/json
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Gestion des erreurs</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        En cas d'erreur, l'API renvoie un code d'état HTTP approprié et un objet JSON 
                        contenant des détails sur l'erreur.
                      </p>
                      <ScrollArea className="h-[200px] rounded-md border p-4">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted">
                              <th className="border p-2 text-left">Code HTTP</th>
                              <th className="border p-2 text-left">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border p-2 font-medium">200/201</td>
                              <td className="border p-2">Requête réussie</td>
                            </tr>
                            <tr>
                              <td className="border p-2 font-medium">400</td>
                              <td className="border p-2">Requête incorrecte (paramètres manquants ou invalides)</td>
                            </tr>
                            <tr>
                              <td className="border p-2 font-medium">401</td>
                              <td className="border p-2">Authentification manquante ou invalide</td>
                            </tr>
                            <tr>
                              <td className="border p-2 font-medium">404</td>
                              <td className="border p-2">Ressource non trouvée</td>
                            </tr>
                            <tr>
                              <td className="border p-2 font-medium">405</td>
                              <td className="border p-2">Méthode non autorisée</td>
                            </tr>
                            <tr>
                              <td className="border p-2 font-medium">500</td>
                              <td className="border p-2">Erreur serveur interne</td>
                            </tr>
                          </tbody>
                        </table>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthProvider>
  );
}
