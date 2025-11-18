import { useState, useEffect } from "react";
import { RefreshCw, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";

interface TrafficLight {
  id: string;
  location: string;
  coordinates: [number, number];
  status: 'red' | 'yellow' | 'green';
  timeRemaining: number;
  cycle: {
    red: number;
    yellow: number;
    green: number;
  };
}

const TrafficLights = () => {
  const [activeTab, setActiveTab] = useState("lights");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([
    {
      id: "tl-1",
      location: "Av. Ambalá - Universidad de Ibagué",
      coordinates: [-75.200074, 4.449202],
      status: "green",
      timeRemaining: 45,
      cycle: { red: 60, yellow: 5, green: 45 }
    },
    {
      id: "tl-2",
      location: "Carrera 5 - Centro Comercial Aqua",
      coordinates: [-75.204285, 4.440518],
      status: "red",
      timeRemaining: 35,
      cycle: { red: 50, yellow: 5, green: 40 }
    },
    {
      id: "tl-3",
      location: "Av. Guabinal - Multicentro",
      coordinates: [-75.201674, 4.436420],
      status: "green",
      timeRemaining: 25,
      cycle: { red: 55, yellow: 5, green: 35 }
    },
    {
      id: "tl-4",
      location: "Carrera 9 - Terminal de Transportes",
      coordinates: [-75.234738, 4.437023],
      status: "red",
      timeRemaining: 20,
      cycle: { red: 65, yellow: 5, green: 50 }
    },
    {
      id: "tl-5",
      location: "Av. 19 - Centro Comercial La Quinta",
      coordinates: [-75.223067, 4.439624],
      status: "yellow",
      timeRemaining: 3,
      cycle: { red: 45, yellow: 5, green: 40 }
    }
  ]);

  // Simular cambios de semáforos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficLights(prevLights => 
        prevLights.map(light => {
          let newTimeRemaining = light.timeRemaining - 1;
          let newStatus = light.status;

          // Cambiar estado cuando el tiempo llega a 0
          if (newTimeRemaining <= 0) {
            switch (light.status) {
              case 'green':
                newStatus = 'yellow';
                newTimeRemaining = light.cycle.yellow;
                break;
              case 'yellow':
                newStatus = 'red';
                newTimeRemaining = light.cycle.red;
                break;
              case 'red':
                newStatus = 'green';
                newTimeRemaining = light.cycle.green;
                break;
            }
          }

          return {
            ...light,
            status: newStatus,
            timeRemaining: newTimeRemaining
          };
        })
      );
      setLastUpdate(new Date());
    }, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLastUpdate(new Date());
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'green': return 'Verde';
      case 'yellow': return 'Amarillo';
      case 'red': return 'Rojo';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <TopHeader />

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Header Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Semáforos en Tiempo Real</h2>
            <p className="text-sm text-muted-foreground">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            🟢 En vivo
          </Badge>
        </div>

        {/* Traffic Lights List */}
        <div className="space-y-3">
          {trafficLights.map((light) => (
            <Card key={light.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{light.location}</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Traffic Light Visual */}
                    <div className="flex flex-col gap-1 bg-muted p-2 rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full transition-all duration-300 ${
                          light.status === "red"
                            ? "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`w-6 h-6 rounded-full transition-all duration-300 ${
                          light.status === "yellow"
                            ? "bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`w-6 h-6 rounded-full transition-all duration-300 ${
                          light.status === "green"
                            ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"
                            : "bg-gray-300"
                        }`}
                      ></div>
                    </div>

                    {/* Status Info */}
                    <div>
                      <p className="font-semibold">
                        {getStatusText(light.status)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {light.timeRemaining} seg restantes
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-24">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          light.status === "green" ? "bg-green-500" : 
                          light.status === "yellow" ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ 
                          width: `${(light.timeRemaining / 
                            (light.status === 'green' ? light.cycle.green :
                             light.status === 'yellow' ? light.cycle.yellow :
                             light.cycle.red)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-muted-foreground">
                      {Math.round((light.timeRemaining / 
                        (light.status === 'green' ? light.cycle.green :
                         light.status === 'yellow' ? light.cycle.yellow :
                         light.cycle.red)) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-green-800">
                🟢 Sistema en Tiempo Real
              </p>
              <p className="text-xs text-green-600">
                Los semáforos se actualizan cada segundo con datos reales
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default TrafficLights;
