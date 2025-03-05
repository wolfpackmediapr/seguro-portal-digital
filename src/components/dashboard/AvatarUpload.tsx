
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface AvatarUploadProps {
  avatarUrl: string | null;
  onUpload: (url: string) => void;
  onUploading: (isUploading: boolean) => void;
}

export function AvatarUpload({ avatarUrl, onUpload, onUploading }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      onUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Debes seleccionar una imagen para subir.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // Check file size
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("La imagen debe ser menor a 2MB");
      }

      // Check if file is an image
      if (!file.type.match('image.*')) {
        throw new Error("Solo se permiten imágenes");
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onUpload(data.publicUrl);
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      onUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || undefined} alt="Profile picture" />
        <AvatarFallback className="text-lg">
          {avatarUrl ? '...' : 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="text-center">
        <Label
          htmlFor="avatar-upload"
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium hover:bg-secondary/80"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Cambiar foto
            </>
          )}
        </Label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="sr-only"
        />
        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG o GIF. Máximo 2MB.
        </p>
      </div>
    </div>
  );
}
