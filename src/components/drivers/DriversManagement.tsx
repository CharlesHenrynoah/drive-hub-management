
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
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Search } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Driver } from "@/types/driver";

export function DriversManagement() {
  const [data, setData] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      let query = supabase
        .from('drivers')
        .select('*');

      const { data: driversData, error } = await query;

      if (error) {
        console.error("Erreur lors de la récupération des chauffeurs:", error);
        toast.error("Erreur lors de la récupération des chauffeurs");
        return;
      }

      // Map the database fields to our Driver type
      const formattedDrivers: Driver[] = (driversData || []).map(driver => ({
        id: driver.id,
        created_at: driver.created_at,
        nom: driver.nom,
        prenom: driver.prenom,
        email: driver.email || '',
        telephone: driver.telephone || '',
        ville: driver.ville || '',
        id_chauffeur: driver.id_chauffeur,
        date_debut_activite: driver.date_debut_activite,
        note_chauffeur: driver.note_chauffeur,
        disponible: driver.disponible,
        piece_identite: driver.piece_identite,
        certificat_medical: driver.certificat_medical,
        justificatif_domicile: driver.justificatif_domicile,
        photo: driver.photo,
        id_entreprise: driver.id_entreprise
      }));

      setData(formattedDrivers);
    } catch (error) {
      console.error("Erreur lors de la récupération des chauffeurs:", error);
      toast.error("Erreur lors de la récupération des chauffeurs");
    }
  };

  // Function to delete a driver
  const deleteDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) {
        console.error("Erreur lors de la suppression du chauffeur:", error);
        toast.error("Erreur lors de la suppression du chauffeur");
        return;
      }

      toast.success("Chauffeur supprimé avec succès");
      fetchDrivers(); // Refresh the list after deletion
      setIsDeleteDialogOpen(false);
      setDriverToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du chauffeur:", error);
      toast.error("Erreur lors de la suppression du chauffeur");
    }
  };

  // Function to open the delete confirmation dialog
  const confirmDelete = (driver: Driver, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the row click
    setDriverToDelete(driver);
    setIsDeleteDialogOpen(true);
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
      header: "Actions",
      cell: ({ row }) => {
        const driver = row.original

        return (
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
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
                    navigator.clipboard.writeText(driver.id);
                    toast("ID du chauffeur copié dans le presse-papier");
                  }}
                >
                  Copier l'ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  setSelectedDriver(driver);
                  setIsDetailModalOpen(true);
                }}>Voir</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedDriver(driver);
                  setIsEditModalOpen(true);
                }}>Modifier</DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => confirmDelete(driver, e)}
                  className="text-red-600 focus:text-red-600"
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
              onClick={(e) => confirmDelete(driver, e)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Supprimer</span>
            </Button>
          </div>
        )
      },
    },
  ]

  // Filter data based on search
  const filteredData = search
    ? data.filter((item) =>
        item.nom.toLowerCase().includes(search.toLowerCase()) ||
        item.prenom.toLowerCase().includes(search.toLowerCase()) ||
        item.id_chauffeur.toLowerCase().includes(search.toLowerCase()) ||
        (item.ville && item.ville.toLowerCase().includes(search.toLowerCase())) ||
        (item.telephone && item.telephone.toLowerCase().includes(search.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(search.toLowerCase()))
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un chauffeur..."
            className="pl-10 max-w-md"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un chauffeur
        </Button>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Aucun chauffeur trouvé</p>
        </div>
      ) : (
        <Table>
          <TableCaption>Liste des chauffeurs</TableCaption>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
      )}

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

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le chauffeur {driverToDelete?.prenom} {driverToDelete?.nom} ?
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => driverToDelete && deleteDriver(driverToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
