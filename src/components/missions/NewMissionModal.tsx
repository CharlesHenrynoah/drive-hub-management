
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
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
        </DialogHeader>
        <NewMissionForm
          onCancel={onClose}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
