import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import logo from "@/assets/logo.jpg";
import { CheckCircle } from "lucide-react";

const Recovery = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img src={logo} alt="LiveTraffic" className="h-20 w-20 mx-auto rounded-2xl" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">LiveTraffic</h1>
            <p className="text-lg text-muted-foreground">Ibagué, a tu ritmo</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Recupera tu cuenta</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico para buscar tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleRecovery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jhonpr@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Buscar
                </Button>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-primary hover:underline">
                    Volver a iniciar sesión
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <Alert className="border-success">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <AlertDescription className="ml-2">
                    Hemos enviado a tu correo un enlace para restaurar tu contraseña. Por
                    favor sigue las indicaciones.
                  </AlertDescription>
                </Alert>
                <Button asChild className="w-full" size="lg">
                  <Link to="/login">Volver a iniciar sesión</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Recovery;
