
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Loader2 } from "lucide-react";
import { AddFleetForm } from "./AddFleetForm";
import { FleetDetailModal } from "./FleetDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type for fleets from the database
export type Fleet = {
  id: string;
  name: string;
  company_id: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: { id: string; registration: string }[];
  drivers?: { id: string; nom: string; prenom: string }[];
  companyName?: string;
};

// Type for companies
export type Company = {
  id: string;
  name: string;
};

export function FleetsManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch companies first to get names for lookup
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name');
        
        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
          toast.error('Erreur lors du chargement des entreprises');
          return;
        }
        
        // Create a lookup map for company names
        const companyMap: Record<string, string> = {};
        companiesData.forEach(company => {
          companyMap[company.id] = company.name;
        });
        setCompanies(companyMap);
        
        // Fetch fleets
        const { data: fleetsData, error: fleetsError } = await supabase
          .from('fleets')
          .select('*');
          
        if (fleetsError) {
          console.error('Error fetching fleets:', fleetsError);
          toast.error('Erreur lors du chargement des flottes');
          return;
        }
        
        // Enhance fleet data with company names and counts
        const enhancedFleets = await Promise.all(
          fleetsData.map(async (fleet) => {
            // Count vehicles for this fleet
            const { count: vehicleCount, error: vehicleError } = await supabase
              .from('fleet_vehicles')
              .select('*', { count: 'exact', head: true })
              .eq('fleet_id', fleet.id);
              
            if (vehicleError) {
              console.error('Error counting vehicles:', vehicleError);
            }
            
            return {
              ...fleet,
              companyName: companyMap[fleet.company_id] || 'Entreprise inconnue',
              vehicleCount: vehicleCount || 0
            };
          })
        );
        
        setFleets(enhancedFleets);
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [refreshTrigger]);

  // Handle fleet added/updated
  const handleFleetChange = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Les données des flottes ont été mises à jour');
  };

  // Filtrage des flottes
  const filteredFleets = fleets.filter((fleet) =>
    fleet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fleet.companyName && fleet.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Rechercher par nom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64"
        />
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          
          <AddFleetForm 
            companies={companies} 
            onFleetAdded={handleFleetChange} 
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Nombre de véhicules</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Dernière modification</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Chargement des données...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredFleets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center space-y-4">
                      <p className="text-lg font-medium">Aucune flotte disponible</p>
                      <p className="text-muted-foreground">Ajoutez votre première flotte pour démarrer</p>
                      <AddFleetForm 
                        companies={companies} 
                        onFleetAdded={handleFleetChange} 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFleets.map((fleet) => (
                  <TableRow key={fleet.id}>
                    <TableCell>{fleet.id.substring(0, 8)}...</TableCell>
                    <TableCell>{fleet.name}</TableCell>
                    <TableCell>{fleet.companyName}</TableCell>
                    <TableCell>{fleet.vehicleCount || 0}</TableCell>
                    <TableCell>{new Date(fleet.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(fleet.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedFleet(fleet)}>
                            Détails
                          </Button>
                        </DialogTrigger>
                        {selectedFleet && selectedFleet.id === fleet.id && (
                          <FleetDetailModal 
                            fleet={selectedFleet} 
                            companies={companies}
                            onUpdate={handleFleetChange}
                          />
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
