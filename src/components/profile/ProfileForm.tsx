
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Loader2 } from "lucide-react";

interface ProfileFormProps {
  profile: any;
  userRole: string | null;
}

const ProfileForm = ({ profile, userRole }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Update profile in Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          full_name: formData.full_name,
          avatar_url: profile?.avatar_url || null,
        });
        
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="pl-10"
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
