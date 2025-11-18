import { useState, useEffect, useRef } from "react";
import { MapPin, Clock, TrendingUp, Navigation, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";
import PlaceSearch from "@/components/PlaceSearch";
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
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [navigationSteps, setNavigationSteps] = useState<any[]>([]);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  // Mapa
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

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
  // SEGUIMIENTO GPS EN TIEMPO REAL
  // ============================
  useEffect(() => {
    if (!isNavigating) return;

    if (simulationMode) {
      // Modo simulación: seguir la ruta automáticamente
      startSimulation();
    } else {
      // Modo GPS real
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          
          updateUserLocation(newLocation);
        },
        (error) => {
          console.error('Error GPS:', error);
          // Si falla GPS, activar modo simulación
          setSimulationMode(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [isNavigating, simulationMode, selectedRoute]);

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

    console.log('Calculando ruta desde:', start, 'hasta:', end);

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&alternatives=true&overview=full&steps=true&access_token=${token}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      
      console.log('Respuesta de Mapbox:', data);

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        alert(`Error: ${data.message || 'No se encontraron rutas'}`);
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

    // Limpiar marcadores anteriores
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
    
    // Marcadores
    new mapboxgl.Marker({ color: "green" }).setLngLat(start as mapboxgl.LngLatLike).addTo(map.current);
    new mapboxgl.Marker({ color: "red" }).setLngLat(end as mapboxgl.LngLatLike).addTo(map.current);
    
    } catch (error) {
      console.error('Error calculando ruta:', error);
      alert('Error al calcular la ruta');
    }
  };

  // ============================
  // SELECCIONAR RUTA Y NAVEGACIÓN
  // ============================
  const selectRoute = (route: any, index: number) => {
    setSelectedRoute(route);
    setNavigationSteps(route.legs[0]?.steps || []);
    setShowNavigation(true);
    setCurrentStep(0);
    
    // Resaltar ruta seleccionada en el mapa
    if (map.current) {
      routes.forEach((_, i) => {
        const layerId = `route-${i}`;
        if (map.current!.getLayer(layerId)) {
          map.current!.setPaintProperty(layerId, 'line-color', i === index ? '#2563eb' : '#9ca3af');
          map.current!.setPaintProperty(layerId, 'line-width', i === index ? 6 : 3);
        }
      });
    }
  };

  const updateUserLocation = (newLocation: [number, number]) => {
    setUserLocation(newLocation);
    
    if (map.current) {
      // Actualizar marcador del usuario
      if (userMarker.current) {
        userMarker.current.setLngLat(newLocation);
      } else {
        userMarker.current = new mapboxgl.Marker({ 
          color: '#2563eb',
          scale: 1.2
        })
        .setLngLat(newLocation)
        .addTo(map.current);
      }
      
      // Centrar mapa en usuario
      map.current.easeTo({
        center: newLocation,
        zoom: 17,
        duration: 1000
      });
      
      // Calcular paso actual basado en distancia
      updateCurrentStep(newLocation);
    }
  };

  const startSimulation = () => {
    if (!selectedRoute?.geometry?.coordinates) return;
    
    const routeCoords = selectedRoute.geometry.coordinates;
    let coordIndex = 0;
    
    simulationInterval.current = setInterval(() => {
      if (coordIndex >= routeCoords.length) {
        // Llegó al destino
        if (simulationInterval.current) {
          clearInterval(simulationInterval.current);
        }
        alert('¡Has llegado a tu destino!');
        stopNavigation();
        return;
      }
      
      const currentCoord = routeCoords[coordIndex];
      updateUserLocation([currentCoord[0], currentCoord[1]]);
      
      coordIndex += Math.max(1, Math.floor(routeCoords.length / 50)); // Avanzar más rápido
    }, 2000); // Cada 2 segundos
  };

  const startNavigation = () => {
    setIsNavigating(true);
    setShowNavigation(false);
    
    // Preguntar si quiere modo simulación
    const useSimulation = confirm(
      '¿Quieres usar modo simulación para probar la navegación?\n\n' +
      'SÍ = Simulación automática\n' +
      'NO = GPS real'
    );
    
    setSimulationMode(useSimulation);
    
    if (map.current) {
      map.current.setStyle('mapbox://styles/mapbox/navigation-day-v1');
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setSimulationMode(false);
    setCurrentStep(0);
    
    // Detener simulación
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    
    // Remover marcador del usuario
    if (userMarker.current) {
      userMarker.current.remove();
      userMarker.current = null;
    }
    
    // Volver a vista normal
    if (map.current) {
      map.current.easeTo({
        bearing: 0,
        pitch: 0,
        zoom: 13
      });
    }
  };

  const updateCurrentStep = (userPos: [number, number]) => {
    if (!navigationSteps.length) return;
    
    // Calcular distancia al siguiente paso
    const nextStep = navigationSteps[currentStep];
    if (!nextStep?.maneuver?.location) return;
    
    const stepLocation = nextStep.maneuver.location;
    const distance = calculateDistance(
      userPos[1], userPos[0],
      stepLocation[1], stepLocation[0]
    );
    
    // Si está cerca del paso actual (< 50m), avanzar al siguiente
    if (distance < 0.05 && currentStep < navigationSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatInstruction = (instruction: string) => {
    return instruction
      .replace(/Continue/g, 'Continúa')
      .replace(/Turn right/g, 'Gira a la derecha')
      .replace(/Turn left/g, 'Gira a la izquierda')
      .replace(/Head/g, 'Dirígete')
      .replace(/Arrive/g, 'Llega');
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

    console.log('Origen seleccionado:', origin, originCoords);
    console.log('Destino seleccionado:', destination, destCoords);
    
    drawRoute(originCoords, destCoords);
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <TopHeader />

      <div className="p-4 space-y-4">
        {/* FORMULARIO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">¿A dónde vas?</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* ORIGEN */}
            <div>
              <Label>Tu ubicación</Label>
              <PlaceSearch 
                value={origin}
                placeholder="Ej: Universidad, Centro..."
                onPlaceSelect={(place) => {
                  setOrigin(place.place_name.split(',')[0]);
                  setOriginCoords(place.center);
                }}
              />
            </div>

            {/* DESTINO */}
            <div>
              <Label>Buscar lugar</Label>
              <PlaceSearch 
                value={destination}
                placeholder="Ej: Quinta, Multicentro..."
                onPlaceSelect={(place) => {
                  setDestination(place.place_name.split(',')[0]);
                  setDestCoords(place.center);
                }}
              />
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

                    <Button 
                      size="sm"
                      onClick={() => selectRoute(r, i)}
                    >
                      Seleccionar
                    </Button>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* NAVEGACIÓN PASO A PASO */}
        {showNavigation && selectedRoute && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Navegación
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNavigation(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">
                    {(selectedRoute.duration / 60).toFixed(0)} min
                  </span>
                  <span className="text-blue-600">•</span>
                  <span>{(selectedRoute.distance / 1000).toFixed(1)} km</span>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {navigationSteps.map((step: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded border">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {formatInstruction(step.maneuver?.instruction || 'Continúa')}
                      </p>
                      {step.name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          en {step.name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-blue-600">
                          {(step.distance / 1000).toFixed(1)} km
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {(step.duration / 60).toFixed(0)} min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-4" 
                size="lg"
                onClick={startNavigation}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Iniciar Navegación GPS
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* NAVEGACIÓN EN TIEMPO REAL */}
      {isNavigating && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-white shadow-lg border-b">
          <div className="p-4">
            {simulationMode && (
              <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mb-2 text-center">
                🎮 MODO SIMULACIÓN - Navegación automática
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  simulationMode ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-lg">
                  {navigationSteps[currentStep] ? 
                    formatInstruction(navigationSteps[currentStep].maneuver?.instruction || 'Continúa') :
                    'Llegando al destino'
                  }
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={stopNavigation}
                className="text-red-600"
              >
                Detener
              </Button>
            </div>
            
            {navigationSteps[currentStep] && (
              <div className="text-sm text-muted-foreground">
                {navigationSteps[currentStep].name && (
                  <p>en {navigationSteps[currentStep].name}</p>
                )}
                <div className="flex items-center gap-4 mt-1">
                  <span>{(navigationSteps[currentStep].distance / 1000).toFixed(1)} km</span>
                  <span>•</span>
                  <span>Paso {currentStep + 1} de {navigationSteps.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        ref={mapContainer}
        className={`w-full rounded-lg shadow ${
          isNavigating ? 'h-[calc(100vh-200px)] fixed top-32 left-0 right-0 z-40' : 'h-[300px]'
        }`}
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Routes;