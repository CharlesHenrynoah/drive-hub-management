
import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Types de véhicules fixes correspondant à ceux proposés dans la partie chauffeur
const fixedVehicleTypes = [
  { value: "Minibus", label: "Minibus" },
  { value: "Minicar", label: "Minicar" },
  { value: "Autocar Standard", label: "Autocar Standard" },
  { value: "Autocar Grand Tourisme", label: "Autocar Grand Tourisme" },
  { value: "VTC", label: "VTC" },
  { value: "Berline", label: "Berline" }
];

interface VehicleTypeFieldProps {
  value: string;
  onChange: (type: string) => void;
  disabled?: boolean;
}

export function VehicleTypeField({
  value,
  onChange,
  disabled = false,
}: VehicleTypeFieldProps) {
  const [open, setOpen] = useState(false);

  // Trouver le type sélectionné pour l'affichage
  const selectedType = fixedVehicleTypes.find(
    (type) => type.value === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {selectedType ? selectedType.label : "Sélectionner un type de véhicule"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Rechercher un type..." />
          <CommandList>
            <CommandEmpty>Aucun type trouvé.</CommandEmpty>
            <CommandGroup>
              {fixedVehicleTypes.map((type) => (
                <CommandItem
                  key={type.value}
                  onSelect={() => {
                    onChange(type.value);
                    setOpen(false);
                  }}
                  className="flex items-center"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === type.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {type.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
