
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Loader2, Upload } from "lucide-react";
import { useState } from "react";

interface VehiclePhotoUploadProps {
  photoPreview: string | null;
  uploadingPhoto: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoRemove: () => void;
}

export function VehiclePhotoUpload({
  photoPreview,
  uploadingPhoto,
  onPhotoUpload,
  onPhotoRemove,
}: VehiclePhotoUploadProps) {
  return (
    <div className="flex flex-col items-center space-y-4 mb-4">
      <div className="w-40 h-40 rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center relative">
        {photoPreview ? (
          <>
            <img 
              src={photoPreview} 
              alt="Aperçu du véhicule" 
              className="object-cover w-full h-full rounded-md"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2 opacity-70 hover:opacity-100 bg-white"
              onClick={onPhotoRemove}
            >
              Supprimer
            </Button>
          </>
        ) : (
          <>
            <Image className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mt-2">Photo du véhicule</p>
          </>
        )}
      </div>
      <div>
        <Label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          {uploadingPhoto ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {photoPreview ? "Changer la photo" : "Télécharger une photo"}
            </>
          )}
        </Label>
        <Input 
          id="photo-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={onPhotoUpload}
          disabled={uploadingPhoto}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Format: JPG, PNG, GIF (max 5MB)
        </p>
      </div>
    </div>
  );
}
