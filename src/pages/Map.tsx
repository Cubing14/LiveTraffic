import { useState, useEffect, useRef } from "react";
import { Navigation, AlertTriangle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "sonner";

type TrafficZone = {
  name: string;
  coords: [number, number];
  status: "fluido" | "congestion" | "incidente";
};

const Map = () => {
  const [activeTab, setActiveTab] = useState("map");
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
  const [isMapReady, setIsMapReady] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  // Coordenadas de Ibagué
  const IBAGUE_CENTER: [number, number] = [-75.2322, 4.4389];

  // ZONAS SIMULADAS
  const trafficZones: TrafficZone[] = [
    { name: "Av. Ambalá", coords: [-75.2100, 4.4500], status: "fluido" },
    { name: "Centro", coords: [-75.2322, 4.4389], status: "congestion" },
    { name: "Quinta", coords: [-75.2450, 4.4420], status: "incidente" },
  ];

  // ============================
  //  INITIALIZAR MAPA AUTOMÁTICO
  // ============================
  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-day-v1",
      center: IBAGUE_CENTER,
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // TRAFICO EN TIEMPO REAL
    map.current.on("load", () => {
      try {
        map.current!.addSource("traffic", {
          type: "vector",
          url: "mapbox://mapbox.mapbox-traffic-v1",
        });

        map.current!.addLayer({
          id: "traffic-layer",
          type: "line",
          source: "traffic",
          "source-layer": "traffic",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-width": 3,
            "line-color": [
              "match",
              ["get", "congestion"],
              "low", "#16a34a", // verde
              "moderate", "#eab308", // amarillo
              "heavy", "#ef4444", // rojo
              "severe", "#991b1b", // rojo oscuro
              "#3b82f6",
            ],
          },
        });
      } catch {
        console.warn("La capa de tráfico ya existía.");
      }
    });

    // MARCADORES DE ZONAS
    trafficZones.forEach((zone) => {
      const el = document.createElement("div");
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";

      if (zone.status === "fluido") el.style.backgroundColor = "hsl(142, 76%, 36%)";
      if (zone.status === "congestion") el.style.backgroundColor = "hsl(48, 96%, 53%)";
      if (zone.status === "incidente") el.style.backgroundColor = "hsl(0, 84%, 60%)";

      new mapboxgl.Marker(el)
        .setLngLat(zone.coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>${zone.name}</strong><br/>
            ${
              zone.status === "fluido"
                ? "🟢 Fluido"
                : zone.status === "congestion"
                ? "🟡 Congestión"
                : "🔴 Incidente"
            }`
          )
        )
        .addTo(map.current!);
    });

    setIsMapReady(true);
    toast.success("Mapa cargado correctamente");
  };

  // UBICACIÓN DEL USUARIO
  const getCurrentLocation = () => {
    if (!map.current) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;

        if (userMarker.current) userMarker.current.remove();

        const el = document.createElement("div");
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "hsl(221, 83%, 53%)";
        el.style.border = "3px solid white";

        userMarker.current = new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .addTo(map.current!);

        map.current!.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1500 });

        toast.success("Tu ubicación ha sido localizada");
      },
      () => toast.error("No se pudo obtener tu ubicación")
    );
  };

  // CARGAR MAPA AUTOMÁTICAMENTE
  useEffect(() => {
    if (mapboxToken) initializeMap();
    else console.error("⚠️ Falta VITE_MAPBOX_TOKEN en el archivo .env");
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HEADER */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-2xl font-bold">LiveTraffic</h1>
        <p className="text-sm opacity-90">Ibagué, a tu ritmo</p>
      </header>

      {/* MAPA */}
      <div className="relative h-[calc(100vh-180px)]">
        <div ref={mapContainer} className="w-full h-full" />

        {/* BOTÓN UBICACIÓN */}
        {isMapReady && (
          <Button
            size="icon"
            onClick={getCurrentLocation}
            className="absolute bottom-4 right-4 rounded-full shadow-lg"
          >
            <Navigation className="w-5 h-5" />
          </Button>
        )}

        {/* INDICADORES SUPERIORES */}
        <div className="absolute top-4 left-4 right-4 grid grid-cols-3 gap-2">
          <Card className="p-2 text-center">
            <TrendingUp className="w-4 h-4 mx-auto text-success mb-1" />
            <p className="text-xs font-medium">Fluido</p>
          </Card>

          <Card className="p-2 text-center">
            <AlertTriangle className="w-4 h-4 mx-auto text-warning mb-1" />
            <p className="text-xs font-medium">2 Alertas</p>
          </Card>

          <Card className="p-2 text-center">
            <Badge variant="outline" className="text-xs">
              En vivo
            </Badge>
          </Card>
        </div>

        {/* LEYENDA */}
        {isMapReady && (
          <div className="absolute bottom-20 left-4">
            <Card className="p-3">
              <h3 className="text-xs font-semibold mb-2">Estado del Tráfico</h3>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-xs">Fluido</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span className="text-xs">Congestión</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-danger rounded-full"></div>
                  <span className="text-xs">Incidente</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Map;
