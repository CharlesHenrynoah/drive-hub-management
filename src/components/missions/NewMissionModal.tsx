
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { NewMissionForm } from "./NewMissionForm";

interface NewMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewMissionModal({ 
  isOpen, 
  onClose,
  onSuccess 
}: NewMissionModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[950px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle mission</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire pour créer une nouvelle mission.
          </DialogDescription>
        </DialogHeader>
        <NewMissionForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
