import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const TrafficLights = () => {
  const [activeTab, setActiveTab] = useState("lights");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const trafficLights = [
    { location: "Av. Ambalá - U. Ibagué", status: "green", time: 50 },
    { location: "Av. Ambalá - Droguería Palermo", status: "red", time: 30 },
    { location: "Carrera 5 - Calle 37", status: "green", time: 45 },
    { location: "Carrera 9A - Calle 21", status: "red", time: 25 },
  ];

  const handleRefresh = () => {
    setLastUpdate(new Date());
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Semáforos</h1>
            <p className="text-sm opacity-90">Estado en tiempo real</p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleRefresh}
            className="rounded-full"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Last Update */}
        <p className="text-xs text-muted-foreground text-center">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </p>

        {/* Traffic Lights List */}
        <div className="space-y-3">
          {trafficLights.map((light, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{light.location}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Traffic Light Visual */}
                    <div className="flex flex-col gap-1 bg-muted p-2 rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full ${
                          light.status === "red"
                            ? "bg-danger shadow-lg shadow-danger/50"
                            : "bg-muted-foreground/20"
                        }`}
                      ></div>
                      <div
                        className={`w-6 h-6 rounded-full ${
                          light.status === "yellow"
                            ? "bg-warning shadow-lg shadow-warning/50"
                            : "bg-muted-foreground/20"
                        }`}
                      ></div>
                      <div
                        className={`w-6 h-6 rounded-full ${
                          light.status === "green"
                            ? "bg-success shadow-lg shadow-success/50"
                            : "bg-muted-foreground/20"
                        }`}
                      ></div>
                    </div>

                    {/* Status Info */}
                    <div>
                      <p className="font-semibold capitalize">
                        {light.status === "green" ? "Verde" : "Rojo"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {light.time} seg
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-20">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          light.status === "green" ? "bg-success" : "bg-danger"
                        }`}
                        style={{ width: `${(light.time / 60) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm text-center text-muted-foreground">
              Los tiempos se actualizan automáticamente cada 10 segundos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default TrafficLights;
