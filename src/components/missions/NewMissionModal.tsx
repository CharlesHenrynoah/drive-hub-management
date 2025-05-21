
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvelle mission</DialogTitle>
          <DialogDescription>
            Le formulaire de création de mission a été temporairement désactivé.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 text-center">
          <p>Cette fonctionnalité est en cours de maintenance.</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
