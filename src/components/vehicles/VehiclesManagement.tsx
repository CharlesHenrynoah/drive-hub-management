import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VehiclesAddModal } from "./VehiclesAddModal";
import { VehiclesEditModal } from "./VehiclesEditModal";
import { VehicleDetailModal } from "./VehicleDetailModal";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Vehicle } from "@/types/vehicle";

export function VehiclesManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  useEffect(() => {
    fetchVehicles();
    fetchCompanies();
  }, [companyFilter]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('vehicles')
        .select('*');
        
      if (companyFilter) {
        query = query.eq('company_id', companyFilter);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Erreur lors de la récupération des véhicules:", error);
        toast.error("Erreur lors de la récupération des véhicules");
      } else {
        // Format vehicles and handle Note_Moyenne_Client properly
        const formattedVehicles: Vehicle[] = (data || []).map(vehicle => ({
          ...vehicle,
          Note_Moyenne_Client: vehicle.Note_Moyenne_Client || undefined
        }));
        setVehicles(formattedVehicles);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des véhicules:", error);
      toast.error("Erreur lors de la récupération des véhicules");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');

      if (error) {
        console.error("Erreur lors de la récupération des entreprises:", error);
        toast.error("Erreur lors de la récupération des entreprises");
      } else {
        setCompanies(data || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des entreprises:", error);
      toast.error("Erreur lors de la récupération des entreprises");
    }
  };

  const getCompanyName = (companyId: string | undefined) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : "N/A";
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchTerm = search.toLowerCase();
    return (
      vehicle.brand.toLowerCase().includes(searchTerm) ||
      vehicle.model.toLowerCase().includes(searchTerm) ||
      vehicle.registration.toLowerCase().includes(searchTerm)
    );
  });

  // Handle row selection
  const handleRowClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "brand",
      header: "Marque",
    },
    {
      accessorKey: "model",
      header: "Modèle",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "capacity",
      header: "Capacité",
    },
    {
      accessorKey: "registration",
      header: "Immatriculation",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vehicle = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(vehicle.id)}
              >
                Copier l'identifiant
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Voir les détails
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredVehicles,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <Input
            type="search"
            placeholder="Rechercher un véhicule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select onValueChange={(value) => setCompanyFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par entreprise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entreprises</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>Ajouter un véhicule</Button>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Chargement des véhicules...
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer hover:bg-secondary"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {filteredVehicles.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Aucun véhicule trouvé.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      
      {/* Modals */}
      {selectedVehicle && (
        <>
          <VehicleDetailModal
            vehicle={selectedVehicle}
            companyName={getCompanyName(selectedVehicle.company_id)}
            onEdit={() => {
              setIsDetailModalOpen(false);
              setIsEditModalOpen(true);
            }}
            onClose={() => setIsDetailModalOpen(false)}
            isOpen={isDetailModalOpen}
          />
          
          <VehiclesEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            vehicle={selectedVehicle}
            onSuccess={() => {
              setIsEditModalOpen(false);
              fetchVehicles();
            }}
          />
        </>
      )}
      
      <VehiclesAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchVehicles}
      />
    </div>
  );
}
