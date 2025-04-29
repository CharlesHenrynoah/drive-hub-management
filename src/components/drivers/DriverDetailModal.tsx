
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Driver } from "@/types/driver";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DriverDetailModalProps {
  driver: Driver;
}

export function DriverDetailModal({ driver }: DriverDetailModalProps) {
  // Map des entreprises
  const entreprises = {
    "E-001": "Ville de Paris",
    "E-002": "Académie de Lyon",
    "E-003": "Transport Express",
    "E-004": "LogiMobile",
    "E-005": "Société ABC",
  };

  // Format date if it's a string
  const formatDate = (date: Date | string) => {
    if (date instanceof Date) {
      return format(date, "dd/MM/yyyy", { locale: fr });
    } else if (typeof date === 'string') {
      // If it's an ISO string, convert to date first
      try {
        return format(new Date(date), "dd/MM/yyyy", { locale: fr });
      } catch (e) {
        return date; // Return as is if not a valid date
      }
    }
    return "Date inconnue";
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
          <Avatar className="h-16 w-16">
            <AvatarImage src={driver.Photo} alt={`${driver.Prénom} ${driver.Nom}`} />
            <AvatarFallback>{driver.Prénom.charAt(0)}{driver.Nom.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <DialogTitle className="text-xl">
              {driver.Prénom} {driver.Nom}
            </DialogTitle>
            <DialogDescription>
              {driver.ID_Chauffeur} - {entreprises[driver.ID_Entreprise as keyof typeof entreprises]}
            </DialogDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className={driver.Disponible ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {driver.Disponible ? "Disponible" : "Indisponible"}
            </span>
            <Switch checked={driver.Disponible} disabled />
          </div>
        </div>
      </DialogHeader>
      
      <div className="mt-4">
        <img 
          src={driver.Photo} 
          alt={`${driver.Prénom} ${driver.Nom}`}
          className="rounded-md w-full object-cover h-48 aspect-[16/9]" 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Coordonnées</h3>
            <Separator className="my-2" />
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Email</dt>
                <dd>{driver.Email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Téléphone</dt>
                <dd>{driver.Téléphone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Date de début d'activité</dt>
                <dd>{formatDate(driver.Date_Debut_Activité)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Entreprise</dt>
                <dd>{entreprises[driver.ID_Entreprise as keyof typeof entreprises]}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>
            <Separator className="my-2" />
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Pièce d'identité</dt>
                <dd>{driver.Pièce_Identité}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Certificat médical</dt>
                <dd>{driver.Certificat_Médical}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Justificatif de domicile</dt>
                <dd>{driver.Justificatif_Domicile}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Performance</h3>
            <Separator className="my-2" />
            <dl className="space-y-4">
              <div>
                <dt className="flex justify-between mb-1">
                  <span>Note chauffeur</span>
                  <span>{(driver.Note_Chauffeur / 20).toFixed(1)}/5</span>
                </dt>
                <dd>
                  <Progress
                    value={driver.Note_Chauffeur}
                    max={100}
                    className="h-2 bg-primary"
                  />
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Missions futures</h3>
            <Separator className="my-2" />
            {driver.Missions_Futures && driver.Missions_Futures.length > 0 ? (
              <ul className="space-y-2">
                {driver.Missions_Futures.map((mission, index) => (
                  <li key={index} className="flex items-center justify-between px-3 py-2 bg-secondary/50 rounded-md">
                    <span>{mission}</span>
                    <Badge variant="outline">Planifiée</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Aucune mission planifiée</p>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
