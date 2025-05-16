
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditDriverForm } from "./EditDriverForm";
import { Driver } from "./DriversManagement";

interface EditDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
  onSuccess: () => void;
}

export function EditDriverModal({ isOpen, onClose, driver, onSuccess }: EditDriverModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier le chauffeur</DialogTitle>
        </DialogHeader>
        
        <EditDriverForm 
          driver={driver}
          onSuccess={() => {
            onSuccess();
            onClose();
          }} 
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
