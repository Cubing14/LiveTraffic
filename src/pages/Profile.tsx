import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Camera, LogOut } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    ciudad: user?.user_metadata?.ciudad || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: any = {};
      
      if (formData.email !== user?.email) {
        const { error } = await supabase.auth.updateUser({ email: formData.email });
        if (error) throw error;
      }

      if (formData.ciudad !== user?.user_metadata?.ciudad) {
        updates.ciudad = formData.ciudad;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser({
          data: updates
        });
        if (error) throw error;
      }

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se guardaron correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se cambió correctamente",
      });
      
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza tu información de perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.user_metadata?.nombre?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Cambiar Foto
              </Button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  placeholder="Ibagué"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Cambiando..." : "Cambiar Contraseña"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;