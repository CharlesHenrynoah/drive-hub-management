
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { EditMissionForm } from "./EditMissionForm";
import { Mission } from "@/types/mission";

interface EditMissionModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditMissionModal({ 
  mission,
  isOpen, 
  onClose,
  onSuccess 
}: EditMissionModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[950px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la mission</DialogTitle>
        </DialogHeader>
        <EditMissionForm
          mission={mission}
          onCancel={onClose}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
