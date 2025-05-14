
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function ApiDocumentation() {
  const [copied, setCopied] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    driversSection: false,
    vehiclesSection: false,
    missionSection: false,
    fleetSection: false
  });
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documentation de l'API</CardTitle>
          <CardDescription>
            Comment utiliser l'API pour accéder et manipuler les données de votre flotte depuis des applications externes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auth">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="auth">Authentification</TabsTrigger>
              <TabsTrigger value="resources">Ressources</TabsTrigger>
              <TabsTrigger value="examples">Exemples</TabsTrigger>
              <TabsTrigger value="missions">Missions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auth" className="space-y-4">
              <h3 className="text-lg font-medium">Authentification API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Toutes les requêtes API nécessitent un token d'authentification valide. Les tokens peuvent être générés et gérés dans l'onglet "Tokens" de cette page.
              </p>
              
              <div className="bg-zinc-950 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400">En-tête d'authentification</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(`Authorization: Bearer YOUR_API_TOKEN`, "auth-header")}
                    className="h-6"
                  >
                    {copied === "auth-header" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <pre className="text-xs text-green-500 overflow-x-auto">
                  {`Authorization: Bearer YOUR_API_TOKEN`}
                </pre>
              </div>

              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">Validation du Token</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Pour vérifier si votre token API est valide:
                </p>
                <div className="bg-zinc-950 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400">GET /api-auth</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(`fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/api-auth', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));`, "validate-token")}
                      className="h-6"
                    >
                      {copied === "validate-token" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <pre className="text-xs text-green-500 overflow-x-auto">
                    {`fetch('https://nsfphygihklucqjiwngl.supabase.co/functions/v1/api-auth', {
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
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-4">
              <Collapsible
                open={openSections.driversSection}
                onOpenChange={() => toggleSection('driversSection')}
                className="w-full space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Chauffeurs</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {openSections.driversSection ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium mb-2">Obtenir les chauffeurs disponibles</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cette API vous permet d'obtenir la liste des chauffeurs disponibles à une date donnée.
                    </p>
                    <div className="bg-zinc-950 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400">GET /drivers-available?date=2025-05-20</span>
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

                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-1">Réponse exemple</h5>
                      <div className="bg-zinc-950 p-4 rounded-lg">
                        <pre className="text-xs text-blue-400 overflow-x-auto">
                          {`{
  "date": "2025-05-20",
  "drivers": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@exemple.fr",
      "telephone": "+33123456789",
      "disponible": true,
      "photo": "https://example.com/photos/jean-dupont.jpg"
    },
    ...
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={openSections.vehiclesSection}
                onOpenChange={() => toggleSection('vehiclesSection')}
                className="w-full space-y-2 border-t border-zinc-800 pt-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Véhicules</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {openSections.vehiclesSection ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium mb-2">Obtenir les véhicules disponibles</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cette API vous permet d'obtenir la liste des véhicules disponibles à une date donnée, avec filtrage optionnel par type.
                    </p>
                    <div className="bg-zinc-950 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400">GET /vehicles-available?date=2025-05-20&type=sedan</span>
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

                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-1">Paramètres disponibles</h5>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><span className="font-semibold">date</span> - Date de recherche (format YYYY-MM-DD)</li>
                        <li><span className="font-semibold">type</span> - Type de véhicule (sedan, SUV, van, etc.)</li>
                        <li><span className="font-semibold">fleet_id</span> - ID de la flotte pour filtrer par flotte</li>
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-1">Réponse exemple</h5>
                      <div className="bg-zinc-950 p-4 rounded-lg">
                        <pre className="text-xs text-blue-400 overflow-x-auto">
                          {`{
  "date": "2025-05-20",
  "type": "sedan",
  "fleet_id": null,
  "vehicles": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174111",
      "brand": "Tesla",
      "model": "Model S",
      "type": "sedan",
      "capacity": 5,
      "registration": "AB-123-CD",
      "fuel_type": "Electric",
      "photo_url": "https://example.com/photos/tesla-model-s.jpg",
      "status": "Disponible"
    },
    ...
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={openSections.fleetSection}
                onOpenChange={() => toggleSection('fleetSection')}
                className="w-full space-y-2 border-t border-zinc-800 pt-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Flottes</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {openSections.fleetSection ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium mb-2">Véhicules par flotte</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cette API vous permet d'obtenir tous les véhicules d'une flotte spécifique.
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
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-1">Réponse exemple</h5>
                      <div className="bg-zinc-950 p-4 rounded-lg">
                        <pre className="text-xs text-blue-400 overflow-x-auto">
                          {`{
  "fleet": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Flotte Premium",
    "description": "Véhicules haut de gamme"
  },
  "vehicles": [...],
  "vehicles_by_type": {
    "sedan": [...],
    "SUV": [...]
  },
  "total_count": 12
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </TabsContent>
            
            <TabsContent value="missions" className="space-y-4">
              <h3 className="text-lg font-medium">Créer une mission</h3>
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
              
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">Paramètres obligatoires</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><span className="font-semibold">title</span> - Titre de la mission</li>
                  <li><span className="font-semibold">date</span> - Date et heure de la mission (format ISO 8601)</li>
                </ul>
              </div>
              
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">Paramètres optionnels</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <li><span className="font-semibold">arrival_date</span> - Date et heure d'arrivée estimée</li>
                  <li><span className="font-semibold">driver_id</span> - Identifiant du chauffeur</li>
                  <li><span className="font-semibold">vehicle_id</span> - Identifiant du véhicule</li>
                  <li><span className="font-semibold">fleet_id</span> - Identifiant de la flotte</li>
                  <li><span className="font-semibold">company_id</span> - Identifiant de l'entreprise</li>
                  <li><span className="font-semibold">status</span> - État de la mission (en_cours, terminee, annulee)</li>
                  <li><span className="font-semibold">start_location</span> - Lieu de départ</li>
                  <li><span className="font-semibold">end_location</span> - Lieu d'arrivée</li>
                  <li><span className="font-semibold">client</span> - Nom du client</li>
                  <li><span className="font-semibold">client_email</span> - Email du client</li>
                  <li><span className="font-semibold">client_phone</span> - Téléphone du client</li>
                  <li><span className="font-semibold">passengers</span> - Nombre de passagers</li>
                  <li><span className="font-semibold">description</span> - Description de la mission</li>
                  <li><span className="font-semibold">additional_details</span> - Détails supplémentaires</li>
                </ul>
              </div>
              
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">Réponse exemple</h4>
                <div className="bg-zinc-950 p-4 rounded-lg">
                  <pre className="text-xs text-blue-400 overflow-x-auto">
                    {`{
  "success": true,
  "message": "Mission créée avec succès",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174999",
    "title": "Transport client VIP"
  }
}`}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="space-y-4">
              <h3 className="text-lg font-medium">Exemples d'intégration</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium mb-2">JavaScript / React</h4>
                  <div className="bg-zinc-950 p-4 rounded-lg">
                    <pre className="text-xs text-amber-300 overflow-x-auto">
{`// Exemple de service JavaScript pour interagir avec l'API
const API_BASE_URL = 'https://nsfphygihklucqjiwngl.supabase.co/functions/v1';
const API_KEY = 'VOTRE_CLE_API';

const headers = {
  'Authorization': \`Bearer \${API_KEY}\`,
  'Content-Type': 'application/json'
};

// Récupérer les chauffeurs disponibles
const getAvailableDrivers = async (date) => {
  try {
    const response = await fetch(\`\${API_BASE_URL}/drivers-available?date=\${date}\`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Erreur réseau');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return { error: error.message };
  }
};

// Créer une nouvelle mission
const createMission = async (missionData) => {
  try {
    const response = await fetch(\`\${API_BASE_URL}/create-mission\`, {
      method: 'POST',
      headers,
      body: JSON.stringify(missionData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création de la mission');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return { error: error.message };
  }
};`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-2">Python</h4>
                  <div className="bg-zinc-950 p-4 rounded-lg">
                    <pre className="text-xs text-green-400 overflow-x-auto">
{`import requests
import json
from datetime import date

API_BASE_URL = 'https://nsfphygihklucqjiwngl.supabase.co/functions/v1'
API_KEY = 'VOTRE_CLE_API'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Récupérer les véhicules disponibles
def get_available_vehicles(search_date=None, vehicle_type=None, fleet_id=None):
    params = {}
    
    if search_date:
        params['date'] = search_date
    
    if vehicle_type:
        params['type'] = vehicle_type
        
    if fleet_id:
        params['fleet_id'] = fleet_id
    
    response = requests.get(
        f'{API_BASE_URL}/vehicles-available',
        headers=headers,
        params=params
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        return {'error': f'Erreur {response.status_code}', 'details': response.text}

# Créer une nouvelle mission
def create_mission(mission_data):
    response = requests.post(
        f'{API_BASE_URL}/create-mission',
        headers=headers,
        json=mission_data
    )
    
    if response.status_code == 201:
        return response.json()
    else:
        return {'error': f'Erreur {response.status_code}', 'details': response.text}

# Exemple d'utilisation
if __name__ == '__main__':
    # Récupérer les véhicules disponibles
    vehicles = get_available_vehicles(
        search_date='2025-05-20',
        vehicle_type='sedan'
    )
    print(json.dumps(vehicles, indent=2))
    
    # Créer une mission
    mission = create_mission({
        'title': 'Transport depuis application Python',
        'date': '2025-05-20T10:00:00Z',
        'client': 'Client Python',
        'client_email': 'client@example.com',
        'client_phone': '+33123456789',
        'start_location': 'Paris'
    })
    print(json.dumps(mission, indent=2))`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-2">cURL</h4>
                  <div className="bg-zinc-950 p-4 rounded-lg">
                    <pre className="text-xs text-blue-300 overflow-x-auto">
{`# Authentification
curl -X GET \\
  'https://nsfphygihklucqjiwngl.supabase.co/functions/v1/api-auth' \\
  -H 'Authorization: Bearer YOUR_API_TOKEN'

# Récupérer les chauffeurs disponibles
curl -X GET \\
  'https://nsfphygihklucqjiwngl.supabase.co/functions/v1/drivers-available?date=2025-05-20' \\
  -H 'Authorization: Bearer YOUR_API_TOKEN'

# Créer une nouvelle mission
curl -X POST \\
  'https://nsfphygihklucqjiwngl.supabase.co/functions/v1/create-mission' \\
  -H 'Authorization: Bearer YOUR_API_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "title": "Mission créée via cURL",
    "date": "2025-05-20T14:00:00Z",
    "client": "Client cURL",
    "client_email": "client@example.fr",
    "client_phone": "0123456789",
    "start_location": "Paris",
    "end_location": "Lyon",
    "passengers": 2
  }'`}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
