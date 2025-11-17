import { useState, useEffect, useRef } from "react";
import { MapPin, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Centro de Ibagué
const IBAGUE_CENTER: [number, number] = [-75.2322, 4.4389];

const Routes = () => {
  const [activeTab, setActiveTab] = useState("routes");

  // Inputs
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  // 🔥 NUEVO: Guardar coordenadas
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  // Autocomplete
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);

  // Rutas alternativas
  const [routes, setRoutes] = useState<any[]>([]);

  // Mapa
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const token = "pk.eyJ1IjoibXByYzMyMCIsImEiOiJjbWkya3B6MDcxNjM5MmlvZ2Zic2MwZnRrIn0.Yj696HtAQzAPaRXRlFHesQ";

  // ============================
  // INICIALIZAR MAPA
  // ============================
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-day-v1",
      center: IBAGUE_CENTER as mapboxgl.LngLatLike,
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl());
  }, []);

  // ============================
  // AUTOCOMPLETE
  // ============================
  const fetchSuggestions = async (text: string, setFn: Function) => {
    if (text.length < 3) {
      setFn([]);
      return;
    }

    try {
      const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        text
      )}.json?access_token=${token}&proximity=${
        IBAGUE_CENTER[0]
      },${IBAGUE_CENTER[1]}&bbox=-75.60,4.20,-74.90,4.80`;
      
      const mapboxRes = await fetch(mapboxUrl);
      const mapboxData = await mapboxRes.json();
      
      // Si Mapbox no devuelve resultados, intentar con Nominatim
      if (!mapboxData.features || mapboxData.features.length === 0) {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          text + ", Ibagué, Colombia"
        )}&format=json&limit=5`;
        
        const nomRes = await fetch(nominatimUrl);
        const nomData = await nomRes.json();
        
        // Convertir formato Nominatim a formato Mapbox
        const formatted = nomData.map((item: any) => ({
          id: item.place_id,
          place_name: item.display_name,
          geometry: {
            coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
          }
        }));
        
        setFn(formatted);
      } else {
        setFn(mapboxData.features);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setFn([]);
    }
  };

  // ============================
  // TRAZAR RUTA
  // ============================
  const drawRoute = async (start: [number, number], end: [number, number]) => {
    if (!map.current) return;

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&alternatives=true&overview=full&access_token=${token}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      alert("No se encontraron rutas.");
      return;
    }

    // Guardar rutas alternativas para la UI
    setRoutes(data.routes);

    // Remover rutas viejas
    [
      "route-0",
      "route-1",
      "route-2",
      "route-0-src",
      "route-1-src",
      "route-2-src",
    ].forEach((id) => {
      if (map.current!.getLayer(id)) map.current!.removeLayer(id);
      if (map.current!.getSource(id)) map.current!.removeSource(id);
    });

    // Dibujar cada ruta
    data.routes.forEach((r: any, index: number) => {
      const idSource = `route-${index}-src`;
      const idLayer = `route-${index}`;

      map.current!.addSource(idSource, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: r.geometry,
        } as GeoJSON.Feature<GeoJSON.Geometry>,
      });

      map.current!.addLayer({
        id: idLayer,
        type: "line",
        source: idSource,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": index === 0 ? "#2563eb" : "#9ca3af",
          "line-width": index === 0 ? 5 : 3,
          "line-opacity": index === 0 ? 1 : 0.7,
        },
      });
    });

    // Ajustar cámara
    const bounds = new mapboxgl.LngLatBounds();
    data.routes[0].geometry.coordinates.forEach((c: any) =>
      bounds.extend(c as mapboxgl.LngLatLike)
    );

    map.current.fitBounds(bounds, { padding: 40 });

    // Marcadores
    new mapboxgl.Marker({ color: "green" }).setLngLat(start as mapboxgl.LngLatLike).addTo(map.current);
    new mapboxgl.Marker({ color: "red" }).setLngLat(end as mapboxgl.LngLatLike).addTo(map.current);
  };

  // ============================
  // MANEJAR SUBMIT
  // ============================
  const handleCalculate = async () => {
    // 🔥 CAMBIO: Usar las coordenadas guardadas directamente
    if (!originCoords || !destCoords) {
      alert("Por favor selecciona origen y destino de las sugerencias.");
      return;
    }

    drawRoute(originCoords, destCoords);
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HEADER */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-2xl font-bold">Rutas</h1>
        <p className="text-sm opacity-90">Planifica tu trayecto</p>
      </header>

      <div className="p-4 space-y-4">
        {/* FORMULARIO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">¿A dónde vas?</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* ORIGEN */}
            <div className="relative">
              <Label>Tu ubicación</Label>
              <Input
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  // 🔥 Limpiar coordenadas si el usuario cambia el texto
                  setOriginCoords(null);
                  fetchSuggestions(e.target.value, setOriginSuggestions);
                }}
                placeholder="Ej: Calle 60, Universidad..."
              />

              {originSuggestions.length > 0 && (
                <div className="absolute bg-white border rounded shadow w-full mt-1 z-10 max-h-48 overflow-y-auto">
                  {originSuggestions.map((s) => (
                    <div
                      key={s.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setOrigin(s.place_name);
                        // 🔥 GUARDAR COORDENADAS
                        setOriginCoords(s.geometry.coordinates);
                        setOriginSuggestions([]);
                      }}
                    >
                      {s.place_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DESTINO */}
            <div className="relative">
              <Label>Buscar lugar</Label>
              <Input
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  // 🔥 Limpiar coordenadas si el usuario cambia el texto
                  setDestCoords(null);
                  fetchSuggestions(e.target.value, setDestSuggestions);
                }}
                placeholder="Ej: Clínica Medicadiz..."
              />

              {destSuggestions.length > 0 && (
                <div className="absolute bg-white border rounded shadow w-full mt-1 z-10 max-h-48 overflow-y-auto">
                  {destSuggestions.map((s) => (
                    <div
                      key={s.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setDestination(s.place_name);
                        // 🔥 GUARDAR COORDENADAS
                        setDestCoords(s.geometry.coordinates);
                        setDestSuggestions([]);
                      }}
                    >
                      {s.place_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button className="w-full" size="lg" onClick={handleCalculate}>
              Calcular Ruta
            </Button>
          </CardContent>
        </Card>

        {/* RUTAS SUGERIDAS */}
        {routes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rutas sugeridas</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {routes.map((r, i) => (
                <Card key={i} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex gap-2 items-center">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">
                          {(r.duration / 60).toFixed(0)} min
                        </span>
                      </div>

                      <div className="flex gap-2 items-center mt-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm text-muted-foreground">
                          {(r.distance / 1000).toFixed(1)} km
                        </span>
                      </div>
                    </div>

                    <Button size="sm">Seleccionar</Button>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div
        ref={mapContainer}
        className="w-full h-[300px] rounded-lg shadow"
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Routes;