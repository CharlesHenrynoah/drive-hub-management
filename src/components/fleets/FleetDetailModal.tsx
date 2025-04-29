
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Fleet {
  ID_Flotte: string;
  Nom_Flotte: string;
  ID_Entreprise: string;
  Liste_Vehicules: string[];
  Date_Creation: string;
  Derniere_Modification: string;
  Description: string;
}

interface FleetDetailModalProps {
  fleet: Fleet;
}

export function FleetDetailModal({ fleet }: FleetDetailModalProps) {
  // Map des entreprises
  const entreprises = {
    "E-001": "Ville de Paris",
    "E-002": "Académie de Lyon",
    "E-003": "Transport Express",
    "E-004": "LogiMobile",
    "E-005": "Société ABC",
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-xl">{fleet.Nom_Flotte}</DialogTitle>
        <DialogDescription>
          {fleet.ID_Flotte} - {entreprises[fleet.ID_Entreprise as keyof typeof entreprises]}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Informations générales</h3>
          <Separator className="my-2" />
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">ID</dt>
              <dd>{fleet.ID_Flotte}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Entreprise</dt>
              <dd>{entreprises[fleet.ID_Entreprise as keyof typeof entreprises]}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Date de création</dt>
              <dd>{fleet.Date_Creation}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Dernière modification</dt>
              <dd>{fleet.Derniere_Modification}</dd>
            </div>
            <div className="pt-2">
              <dt className="font-medium">Description</dt>
              <dd className="mt-1 text-muted-foreground">{fleet.Description}</dd>
            </div>
          </dl>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Liste des véhicules</h3>
          <Separator className="my-2" />
          {fleet.Liste_Vehicules.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {fleet.Liste_Vehicules.map((vehicleId) => (
                <Card key={vehicleId} className="bg-secondary/50">
                  <CardContent className="p-3 flex items-center justify-center">
                    <Badge variant="outline">{vehicleId}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun véhicule associé à cette flotte</p>
          )}
        </div>
      </div>
    </DialogContent>
  );
}
