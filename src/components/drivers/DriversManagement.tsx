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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddDriverModal } from "./AddDriverModal"
import { EditDriverModal } from "./EditDriverModal"
import { DriverDetailModal } from "./DriverDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Checkbox } from "@/components/ui/checkbox"

export type Driver = {
  id: string;
  created_at: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  id_chauffeur: string;
  date_debut_activite: string;
  note_chauffeur: number;
  disponible: boolean;
  piece_identite: boolean;
  certificat_medical: boolean;
  justificatif_domicile: boolean;
  photo: string | null;
}

export function DriversManagement() {
  const [data, setData] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [availableFilter, setAvailableFilter] = useState<boolean | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, [availableFilter]);

  const fetchDrivers = async () => {
    try {
      let query = supabase
        .from('drivers')
        .select('*');
        
      if (availableFilter !== null) {
        query = query.eq('disponible', availableFilter);
      }

      const { data: driversData, error } = await query;

      if (error) {
        console.error("Erreur lors de la récupération des chauffeurs:", error);
        toast({
          title: "Erreur!",
          description: "Erreur lors de la récupération des chauffeurs",
        })
        return;
      }

      setData(driversData || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des chauffeurs:", error);
      toast({
        title: "Erreur!",
        description: "Erreur lors de la récupération des chauffeurs",
      })
    }
  };

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: "nom",
      header: "Nom",
    },
    {
      accessorKey: "prenom",
      header: "Prénom",
    },
    {
      accessorKey: "id_chauffeur",
      header: "ID Chauffeur",
    },
    {
      accessorKey: "ville",
      header: "Ville",
    },
    {
      accessorKey: "disponible",
      header: "Disponibilité",
      cell: ({ row }) => (row.original.disponible ? "Disponible" : "Indisponible"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const driver = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(driver.id)
                  toast({
                    description: "Driver ID copied to clipboard",
                  })
                }}
              >
                Copy Driver ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setSelectedDriver(driver);
                setIsDetailModalOpen(true);
              }}>View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedDriver(driver);
                setIsEditModalOpen(true);
              }}>Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const filteredData = search
    ? data.filter((item) =>
        item.nom.toLowerCase().includes(search.toLowerCase()) ||
        item.prenom.toLowerCase().includes(search.toLowerCase()) ||
        item.id_chauffeur.toLowerCase().includes(search.toLowerCase()) ||
        item.ville.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Clicking on a driver row
  const handleRowClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDetailModalOpen(true);
  };

  // Handler to close the detail modal
  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedDriver(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          type="search"
          placeholder="Rechercher un chauffeur..."
          className="max-w-md"
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un chauffeur
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <label
          htmlFor="available"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Afficher seulement les chauffeurs disponibles
        </label>
        <Checkbox
          id="available"
          checked={availableFilter === true}
          onCheckedChange={(checked) => setAvailableFilter(checked === true ? true : null)}
        />
      </div>

      <Table>
        <TableCaption>Liste des chauffeurs</TableCaption>
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} onClick={() => handleRowClick(row.original)} className="cursor-pointer">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modals */}
      {selectedDriver && (
        <>
          <DriverDetailModal
            driver={selectedDriver}
            onEdit={() => {
              setIsDetailModalOpen(false);
              setIsEditModalOpen(true);
            }}
            onClose={handleDetailModalClose}
          />
          
          <EditDriverModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            driver={selectedDriver}
            onSuccess={() => {
              fetchDrivers();
              setIsEditModalOpen(false);
            }}
          />
        </>
      )}

      <AddDriverModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchDrivers();
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}
