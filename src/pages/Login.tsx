import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.jpg";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Ingresa tu email para reenviar la confirmación",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Email reenviado!",
          description: "Revisa tu bandeja de entrada para confirmar tu cuenta",
        });
        setShowResendConfirmation(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo reenviar el email",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = error.message;
        
        // Mensajes más claros para errores comunes
        if (error.message.includes('Email not confirmed')) {
          errorMessage = "Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
          setShowResendConfirmation(true);
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email o contraseña incorrectos. Verifica tus datos.";
        } else if (error.message.includes('Email link is invalid')) {
          errorMessage = "El enlace de confirmación ha expirado. Solicita uno nuevo.";
        }
        
        toast({
          title: "Error al iniciar sesión",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
        });
        navigate("/map");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img src={logo} alt="LiveTraffic" className="h-24 w-24 mx-auto rounded-2xl" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">LiveTraffic</h1>
            <p className="text-lg text-muted-foreground mt-2">Ibagué, a tu ritmo</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Accede a tu cuenta</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
              <div className="text-center space-y-2">
                <Link to="/recovery" className="text-sm text-primary hover:underline block">
                  ¿Olvidaste tu contraseña?
                </Link>
                {showResendConfirmation && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    className="text-sm text-orange-600 hover:underline block"
                  >
                    📧 Reenviar email de confirmación
                  </button>
                )}
                <p className="text-sm text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Regístrate
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
