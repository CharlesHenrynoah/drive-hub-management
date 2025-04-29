
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Company {
  id: string;
  name: string;
  address?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  logo_url?: string | null;
  fleet_count?: number;
  vehicle_count?: number;
  driver_count?: number;
}

interface Fleet {
  ID_Flotte: string;
  Nom_Flotte: string;
  Description: string;
}

interface Vehicle {
  ID_Vehicule: string;
  Marque: string;
  Modele: string;
  Type_Vehicule: string;
}

interface Driver {
  ID_Chauffeur: string;
  Nom: string;
  Prénom: string;
}

interface CompanyDetailModalProps {
  company: Company;
  fleets: Fleet[];
  vehicles: Vehicle[];
  drivers: Driver[];
}

export function CompanyDetailModal({ company, fleets, vehicles, drivers }: CompanyDetailModalProps) {
  return (
    <DialogContent className="sm:max-w-[700px]">
      <DialogHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            {company.logo_url ? (
              <AvatarImage src={company.logo_url} alt={company.name} />
            ) : (
              <AvatarFallback>{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <DialogTitle className="text-xl">{company.name}</DialogTitle>
            <DialogDescription>
              {company.id} {company.created_at ? ` - Entreprise créée le ${new Date(company.created_at).toLocaleDateString()}` : ''}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      
      <Tabs defaultValue="details" className="mt-2">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="flottes">Flottes</TabsTrigger>
          <TabsTrigger value="ressources">Ressources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Informations générales</h3>
            <Separator className="my-2" />
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Contact principal</dt>
                <dd>{company.contact_name || '-'}</dd>
              </div>
              <div>
                <dt className="font-medium">Adresse</dt>
                <dd>{company.address || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Email</dt>
                <dd>{company.email || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Téléphone</dt>
                <dd>{company.phone || '-'}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Statistiques</h3>
            <Separator className="my-2" />
            <dl className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg border p-3">
                <dt className="text-muted-foreground text-xs">Flottes</dt>
                <dd className="text-2xl font-semibold mt-1">{company.fleet_count || 0}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-muted-foreground text-xs">Véhicules</dt>
                <dd className="text-2xl font-semibold mt-1">{company.vehicle_count || 0}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-muted-foreground text-xs">Chauffeurs</dt>
                <dd className="text-2xl font-semibold mt-1">{company.driver_count || 0}</dd>
              </div>
            </dl>
          </div>
        </TabsContent>
        
        <TabsContent value="flottes" className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Flottes de l'entreprise</h3>
            <Button size="sm">Ajouter une flotte</Button>
          </div>
          
          {fleets.length > 0 ? (
            <div className="space-y-3">
              {fleets.map((fleet) => (
                <Card key={fleet.ID_Flotte}>
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{fleet.Nom_Flotte}</CardTitle>
                      <Badge variant="outline">{fleet.ID_Flotte}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm text-muted-foreground">{fleet.Description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune flotte n'est associée à cette entreprise</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ressources" className="space-y-6 pt-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Véhicules ({company.vehicle_count || 0})</h3>
            
            {vehicles.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">ID</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Marque</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Modèle</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.ID_Vehicule} className="border-b last:border-0">
                        <td className="p-2 text-sm">{vehicle.ID_Vehicule}</td>
                        <td className="p-2 text-sm">{vehicle.Marque}</td>
                        <td className="p-2 text-sm">{vehicle.Modele}</td>
                        <td className="p-2 text-sm">{vehicle.Type_Vehicule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 bg-secondary/30 rounded-md">
                <p className="text-muted-foreground">Aucun véhicule</p>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Chauffeurs ({company.driver_count || 0})</h3>
            
            {drivers.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">ID</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Nom</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Prénom</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr key={driver.ID_Chauffeur} className="border-b last:border-0">
                        <td className="p-2 text-sm">{driver.ID_Chauffeur}</td>
                        <td className="p-2 text-sm">{driver.Nom}</td>
                        <td className="p-2 text-sm">{driver.Prénom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 bg-secondary/30 rounded-md">
                <p className="text-muted-foreground">Aucun chauffeur</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}
