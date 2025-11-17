import { useState } from "react";
import { AlertTriangle, Camera, Clock, MapPin, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";

const Incidents = () => {
  const [activeTab, setActiveTab] = useState("incidents");
  const [showReport, setShowReport] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const incidents = [
    {
      type: "Choque",
      location: "Cra 5 Cll. 37",
      impact: "Alto",
      time: "28 min",
      icon: AlertTriangle,
    },
    {
      type: "Obra",
      location: "Cra 5 Cll 21",
      impact: "Bajo",
      time: "6 min",
      icon: AlertTriangle,
    },
  ];

  const handleSubmitReport = () => {
    setShowReport(false);
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Incidentes</h1>
            <p className="text-sm opacity-90">Reportes en tiempo real</p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incidentes Cercanos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incidents.map((incident, index) => (
              <Card key={index} className="border-l-4 border-l-danger">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                        <incident.icon className="w-5 h-5 text-danger" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{incident.type}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{incident.location}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={incident.impact === "Alto" ? "destructive" : "secondary"}
                          >
                            Impacto: {incident.impact}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{incident.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Report Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={() => setShowReport(true)}
        >
          Reportar Incidente
        </Button>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Incidente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo Incidente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="choque">Choque</SelectItem>
                    <SelectItem value="obra">Obra</SelectItem>
                    <SelectItem value="cierre">Cierre Vial</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severidad</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bajo">Bajo</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>¿Dónde?</Label>
              <Input placeholder="Glorieta CC La Estación" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tiempo</Label>
                <Input placeholder="10 min" />
              </div>
              <div className="space-y-2">
                <Label>Evidencia</Label>
                <Button variant="outline" className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Foto
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowReport(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSubmitReport}>
              Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">¡Reporte Exitoso!</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-success" />
            </div>
            <p className="text-muted-foreground">
              Gracias por tu reporte, es muy valioso para la movilidad de nuestra ciudad.
            </p>
          </div>
          <Button onClick={() => setShowSuccess(false)} className="w-full">
            Volver
          </Button>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Incidents;
