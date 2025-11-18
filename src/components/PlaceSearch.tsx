import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Place {
  id: string;
  place_name: string;
  center: [number, number];
}

interface PlaceSearchProps {
  onPlaceSelect: (place: Place) => void;
  placeholder?: string;
  value?: string;
}

const PlaceSearch = ({ onPlaceSelect, placeholder = "Buscar en Ibagué...", value = "" }: PlaceSearchProps) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // Sincronizar con el valor externo
  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  // Bounding box de Ibagué (aproximado)
  const IBAGUE_BBOX = [-75.3, 4.35, -75.15, 4.52]; // [minLng, minLat, maxLng, maxLat]

  // Lugares conocidos de Ibagué (coordenadas exactas)
  const knownPlaces: Place[] = [
    { id: "unibague", place_name: "Universidad de Ibagué, Ibagué, Tolima", center: [-75.200074, 4.449202] },
    { id: "cc-la-quinta", place_name: "Centro Comercial La Quinta, Ibagué, Tolima", center: [-75.223067, 4.439624] },
    { id: "cc-multicentro", place_name: "Multicentro, Ibagué, Tolima", center: [-75.201674, 4.436420] },
    { id: "ut", place_name: "Universidad del Tolima, Ibagué, Tolima", center: [-75.213316, 4.428556] },
    { id: "terminal", place_name: "Terminal de Transportes, Ibagué, Tolima", center: [-75.234738, 4.437023] },
    { id: "estadio", place_name: "Estadio Manuel Murillo Toro, Ibagué, Tolima", center: [-75.218480, 4.430111] },
    { id: "cc-aqua", place_name: "Centro Comercial Aqua, Ibagué, Tolima", center: [-75.204285, 4.440518] },
    { id: "parque-murillo", place_name: "Parque Murillo Toro, Ibagué, Tolima", center: [-75.240959, 4.445035] },
    { id: "conservatorio", place_name: "Conservatorio del Tolima, Ibagué, Tolima", center: [-75.244611, 4.443491] },
  ];

  const searchPlaces = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxToken}&` +
        `bbox=${IBAGUE_BBOX.join(',')}&` +
        `country=CO&` +
        `types=poi,address,place&` +
        `limit=10`
      );
      
      const data = await response.json();
      
      // Filtrar resultados dentro del área de Ibagué
      const filteredResults = data.features.filter((place: any) => {
        const [lng, lat] = place.center;
        const withinBounds = lng >= IBAGUE_BBOX[0] && lng <= IBAGUE_BBOX[2] && 
                           lat >= IBAGUE_BBOX[1] && lat <= IBAGUE_BBOX[3];
        
        const containsIbague = place.place_name.toLowerCase().includes('ibagué') ||
                              place.place_name.toLowerCase().includes('tolima') ||
                              place.context?.some((ctx: any) => 
                                ctx.text?.toLowerCase().includes('ibagué') ||
                                ctx.text?.toLowerCase().includes('tolima')
                              );
        
        return withinBounds || containsIbague;
      });
      
      // Si no hay resultados de la API, buscar en lugares conocidos
      if (filteredResults.length === 0) {
        const localResults = knownPlaces.filter(place => 
          place.place_name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(localResults.slice(0, 5));
        
        if (localResults.length === 0) {
          toast.error("No se encontraron lugares en Ibagué");
        }
      } else {
        setResults(filteredResults.slice(0, 5));
      }
    } catch (error) {
      toast.error("Error al buscar lugares");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPlaces();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={searchPlaces} disabled={loading} size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      {results.length > 0 && (
        <Card className="p-2 max-h-48 overflow-y-auto">
          {results.map((place) => (
            <div
              key={place.id}
              className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
              onClick={() => {
                onPlaceSelect(place);
                setResults([]);
                setQuery(place.place_name.split(',')[0]); // Solo el nombre principal
              }}
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">{place.place_name}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default PlaceSearch;