
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AvatarUpload } from "./AvatarUpload";
import { LogoutButton } from "./LogoutButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export interface UserProfile {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  updated_at: string;
}

export function UserProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error("No session found");
        }
        
        setUser(session.user);

        // Get profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setFullName(data.full_name);
          setAvatar(data.avatar_url);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [toast]);

  async function updateProfile() {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          avatar_url: avatar,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Perfil</CardTitle>
        <CardDescription>
          Actualiza tu información personal y foto de perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/3">
            <AvatarUpload 
              avatarUrl={avatar} 
              onUpload={(url) => {
                setAvatar(url);
                updateProfile();
              }}
              onUploading={setUploading}
            />
          </div>
          
          <div className="space-y-4 w-full md:w-2/3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={user?.email || ''} 
                disabled 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input 
                id="name" 
                type="text" 
                value={fullName || ''} 
                onChange={(e) => setFullName(e.target.value)} 
              />
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Button
                onClick={updateProfile}
                disabled={loading || uploading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
              
              <LogoutButton />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
