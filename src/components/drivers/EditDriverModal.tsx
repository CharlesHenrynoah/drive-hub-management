
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditDriverForm } from "./EditDriverForm";
import { Driver } from "@/types/driver";

interface EditDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
  onSuccess: () => void;
}

export function EditDriverModal({ isOpen, onClose, driver, onSuccess }: EditDriverModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le chauffeur</DialogTitle>
        </DialogHeader>
        
        <EditDriverForm 
          driver={driver}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          buttonText="Mettre à jour"
        />
      </DialogContent>
    </Dialog>
  );
}
