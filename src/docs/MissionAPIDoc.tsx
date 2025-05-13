
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="examples">Exemples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="docs" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Endpoint</h3>
              <p className="text-sm text-muted-foreground font-mono">
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
  "passengers": 3, // Optionnel
  "description": "Description de la mission", // Optionnel
  "additional_details": "Détails supplémentaires" // Optionnel
}`}
                </pre>
              </ScrollArea>
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
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Erreurs possibles</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><span className="font-semibold">400</span> - Données invalides ou incomplètes</li>
                <li><span className="font-semibold">401</span> - Clé API manquante ou invalide</li>
                <li><span className="font-semibold">405</span> - Méthode non autorisée (seul POST est accepté)</li>
                <li><span className="font-semibold">500</span> - Erreur interne du serveur</li>
              </ul>
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
        status: "en_cours",
        client: "Client Premium"
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
    "passengers": 4
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
print(response.json())`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
