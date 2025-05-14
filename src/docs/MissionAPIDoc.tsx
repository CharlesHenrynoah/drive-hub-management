
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function MissionAPIDoc() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API de création de missions</CardTitle>
        <CardDescription>
          Documentation pour créer des missions via l'API HTTPS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="docs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="examples">Exemples</TabsTrigger>
            <TabsTrigger value="responses">Réponses & Erreurs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="docs" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Endpoint</h3>
              <p className="text-sm text-muted-foreground font-mono break-all">
                POST https://nsfphygihklucqjiwngl.supabase.co/functions/v1/create-mission
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">En-têtes requis</h3>
              <pre className="bg-muted p-2 rounded-md text-xs">
                {`Content-Type: application/json
Authorization: Bearer VOTRE_CLE_API`}
              </pre>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Corps de la requête</h3>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <pre className="text-xs">
{`{
  "title": "Titre de la mission", // Requis
  "date": "2025-05-20T14:30:00Z", // Requis - format ISO 8601
  "arrival_date": "2025-05-20T16:30:00Z", // Optionnel
  "driver_id": "uuid-du-chauffeur", // Optionnel
  "vehicle_id": "uuid-du-vehicule", // Optionnel
  "fleet_id": "uuid-de-la-flotte", // Optionnel
  "company_id": "id-de-la-societe", // Optionnel
  "status": "en_cours", // Optionnel (valeurs: "en_cours", "terminee", "annulee")
  "start_location": "Paris", // Optionnel
  "end_location": "Lyon", // Optionnel
  "client": "Nom du client", // Optionnel
  "client_email": "client@example.com", // Optionnel
  "client_phone": "+33123456789", // Optionnel
  "passengers": 3, // Optionnel
  "description": "Description de la mission", // Optionnel
  "additional_details": "Détails supplémentaires" // Optionnel
}`}
                </pre>
              </ScrollArea>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Champs disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-md font-medium">Informations principales</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><span className="font-semibold">title</span> <Badge variant="outline">Requis</Badge> - Titre de la mission</li>
                    <li><span className="font-semibold">date</span> <Badge variant="outline">Requis</Badge> - Date et heure de départ</li>
                    <li><span className="font-semibold">arrival_date</span> - Date et heure d'arrivée estimée</li>
                    <li><span className="font-semibold">description</span> - Description générale</li>
                    <li><span className="font-semibold">additional_details</span> - Informations supplémentaires</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-md font-medium">Informations client</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><span className="font-semibold">client</span> - Nom du client/entreprise</li>
                    <li><span className="font-semibold">client_email</span> - Email de contact</li>
                    <li><span className="font-semibold">client_phone</span> - Téléphone de contact</li>
                    <li><span className="font-semibold">passengers</span> - Nombre de passagers</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-md font-medium">Localisation</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><span className="font-semibold">start_location</span> - Lieu de départ</li>
                    <li><span className="font-semibold">end_location</span> - Lieu d'arrivée</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-md font-medium">Associations</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><span className="font-semibold">driver_id</span> - ID du chauffeur assigné</li>
                    <li><span className="font-semibold">vehicle_id</span> - ID du véhicule assigné</li>
                    <li><span className="font-semibold">fleet_id</span> - ID de la flotte associée</li>
                    <li><span className="font-semibold">company_id</span> - ID de l'entreprise cliente</li>
                    <li><span className="font-semibold">status</span> - État (en_cours, terminee, annulee)</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Réponse en cas de succès (201 Created)</h3>
              <pre className="bg-muted p-2 rounded-md text-xs">
{`{
  "success": true,
  "message": "Mission créée avec succès",
  "data": {
    "id": "uuid-de-la-mission",
    "title": "Titre de la mission"
  }
}`}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Exemple avec cURL</h3>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
{`curl -X POST \\
  https://nsfphygihklucqjiwngl.supabase.co/functions/v1/create-mission \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -d '{
    "title": "Transport VIP Paris-Lyon",
    "date": "2025-05-20T14:30:00Z",
    "arrival_date": "2025-05-20T18:30:00Z",
    "start_location": "Paris",
    "end_location": "Lyon",
    "client": "Entreprise XYZ",
    "client_email": "contact@xyz.com",
    "client_phone": "+33123456789",
    "passengers": 2,
    "description": "Transport de dirigeants"
  }'`}
              </pre>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Exemple avec JavaScript (fetch)</h3>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
{`const createMission = async () => {
  const response = await fetch(
    "https://nsfphygihklucqjiwngl.supabase.co/functions/v1/create-mission",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer VOTRE_CLE_API"
      },
      body: JSON.stringify({
        title: "Transport client premium",
        date: "2025-05-20T09:00:00Z",
        driver_id: "uuid-du-chauffeur",
        vehicle_id: "uuid-du-vehicule",
        client: "Client Premium",
        client_email: "premium@client.com",
        client_phone: "+33698765432",
        status: "en_cours"
      })
    }
  );
  
  const data = await response.json();
  console.log(data);
};`}
              </pre>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Exemple avec Python (requests)</h3>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
{`import requests
import json

url = "https://nsfphygihklucqjiwngl.supabase.co/functions/v1/create-mission"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer VOTRE_CLE_API"
}
payload = {
    "title": "Navette aéroport",
    "date": "2025-05-21T10:45:00Z",
    "start_location": "Centre-ville",
    "end_location": "Aéroport Charles de Gaulle",
    "client": "Société ABC",
    "client_email": "contact@abc.fr",
    "client_phone": "+33612345678",
    "passengers": 4
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
print(response.json())`}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="responses" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Codes de réponse</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Code HTTP</th>
                    <th className="border p-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2 font-medium">201</td>
                    <td className="border p-2">Mission créée avec succès</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">400</td>
                    <td className="border p-2">Données invalides ou incomplètes</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">401</td>
                    <td className="border p-2">Clé API manquante ou invalide</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">405</td>
                    <td className="border p-2">Méthode non autorisée (seul POST est accepté)</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">500</td>
                    <td className="border p-2">Erreur interne du serveur</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Exemples d'erreurs</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium">Données manquantes (400)</h4>
                  <pre className="bg-muted p-2 rounded-md text-xs">
{`{
  "error": "Missing required fields: title and date are required"
}`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="text-md font-medium">Authentification invalide (401)</h4>
                  <pre className="bg-muted p-2 rounded-md text-xs">
{`{
  "error": "Missing or invalid API key"
}`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="text-md font-medium">Erreur de création (400)</h4>
                  <pre className="bg-muted p-2 rounded-md text-xs">
{`{
  "error": "Failed to create mission: [détails de l'erreur]"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
