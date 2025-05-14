
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function ApiDocumentation() {
  const [copied, setCopied] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documentation de l'API</CardTitle>
          <CardDescription>
            Comment utiliser l'API pour accéder aux données de votre flotte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="drivers">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="drivers">Chauffeurs</TabsTrigger>
              <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
              <TabsTrigger value="missions">Missions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="drivers" className="space-y-4">
              <h3 className="text-lg font-medium">Obtenir les chauffeurs disponibles</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cette API vous permet d'obtenir la liste des chauffeurs disponibles à une date donnée.
              </p>
              
              <div className="bg-zinc-950 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400">GET /drivers/available</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(`fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/drivers-available?date=2025-05-20', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));`, "drivers-get")}
                    className="h-6"
                  >
                    {copied === "drivers-get" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <pre className="text-xs text-green-500 overflow-x-auto">
                  {`fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/drivers-available?date=2025-05-20', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));`}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="vehicles" className="space-y-4">
              <h3 className="text-lg font-medium">Obtenir les véhicules disponibles</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cette API vous permet d'obtenir la liste des véhicules disponibles à une date donnée.
              </p>
              
              <div className="bg-zinc-950 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400">GET /vehicles/available</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(`fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/vehicles-available?date=2025-05-20&type=sedan', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));`, "vehicles-get")}
                    className="h-6"
                  >
                    {copied === "vehicles-get" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <pre className="text-xs text-green-500 overflow-x-auto">
                  {`fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/vehicles-available?date=2025-05-20&type=sedan', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));`}
                </pre>
              </div>
              
              <h3 className="text-lg font-medium mt-6">Obtenir les véhicules disponibles par flotte</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cette API vous permet d'obtenir la liste des véhicules disponibles par flotte.
              </p>
              
              <div className="bg-zinc-950 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400">GET /fleets/{'{fleet_id}'}/vehicles</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(`fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/fleets/123e4567-e89b-12d3-a456-426614174000/vehicles', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));`, "fleet-vehicles-get")}
                    className="h-6"
                  >
                    {copied === "fleet-vehicles-get" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <pre className="text-xs text-green-500 overflow-x-auto">
                  {`fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/fleets/123e4567-e89b-12d3-a456-426614174000/vehicles', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));`}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="missions" className="space-y-4">
              <h3 className="text-lg font-medium">Créer une nouvelle mission</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cette API vous permet de créer une nouvelle mission via une requête POST.
              </p>
              
              <div className="bg-zinc-950 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400">POST /create-mission</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(`fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/create-mission', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Transport client VIP",
    date: "2025-05-20T14:00:00Z",
    arrival_date: "2025-05-20T16:00:00Z",
    driver_id: "123e4567-e89b-12d3-a456-426614174000",
    vehicle_id: "123e4567-e89b-12d3-a456-426614174111",
    fleet_id: "123e4567-e89b-12d3-a456-426614174222",
    company_id: "ABC123",
    status: "en_cours",
    start_location: "Paris",
    end_location: "Lyon",
    client: "Société XYZ",
    client_email: "contact@xyz.com",
    client_phone: "0123456789",
    passengers: 2,
    description: "Transport VIP pour réunion importante",
    additional_details: "Client à mobilité réduite"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));`, "missions-post")}
                    className="h-6"
                  >
                    {copied === "missions-post" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <pre className="text-xs text-green-500 overflow-x-auto">
                  {`fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/create-mission', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Transport client VIP",
    date: "2025-05-20T14:00:00Z",
    arrival_date: "2025-05-20T16:00:00Z",
    driver_id: "123e4567-e89b-12d3-a456-426614174000",
    vehicle_id: "123e4567-e89b-12d3-a456-426614174111",
    fleet_id: "123e4567-e89b-12d3-a456-426614174222",
    company_id: "ABC123",
    status: "en_cours",
    start_location: "Paris",
    end_location: "Lyon",
    client: "Société XYZ",
    client_email: "contact@xyz.com",
    client_phone: "0123456789",
    passengers: 2,
    description: "Transport VIP pour réunion importante",
    additional_details: "Client à mobilité réduite"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
