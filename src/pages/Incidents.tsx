import { useState, useEffect } from "react";
import { AlertTriangle, Camera, Clock, MapPin, RefreshCw, Car, Construction, X, Zap, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";
import PlaceSearch from "@/components/PlaceSearch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";
import { requestNotificationPermission, notifyNearbyIncident } from "@/services/notifications";

interface Incident {
  id: string;
  type: 'choque' | 'obra' | 'cierre' | 'congestion' | 'otro';
  location: string;
  coordinates: [number, number];
  impact: 'bajo' | 'medio' | 'alto';
  timeAgo: number; // minutos
  description: string;
  status: 'activo' | 'resuelto';
  reports: number;
  reportedBy: string;
  reportedByEmail: string;
  upvotes?: number;
  downvotes?: number;
  userReports: Array<{
    userName: string;
    userEmail: string;
    timeAgo: number;
  }>;
}

const Incidents = () => {
  const { user } = useAuth();
  const location = useGeolocation();
  const [activeTab, setActiveTab] = useState("incidents");
  const [showReport, setShowReport] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [reportForm, setReportForm] = useState({
    type: '',
    severity: '',
    location: '',
    description: '',
    coordinates: null as [number, number] | null,
    photo: null as File | null
  });
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Solicitar permisos de notificación al cargar
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Cargar incidentes desde Supabase
  useEffect(() => {
    loadIncidents();
    
    // Actualizar cada minuto
    const interval = setInterval(() => {
      loadIncidents();
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Notificar incidentes cercanos
  useEffect(() => {
    if (location.latitude && location.longitude && incidents.length > 0) {
      incidents.forEach(incident => {
        const distance = calculateDistance(
          location.latitude!,
          location.longitude!,
          incident.coordinates[1],
          incident.coordinates[0]
        );
        
        if (distance < 2 && incident.timeAgo < 5) { // Menos de 2km y menos de 5 min
          notifyNearbyIncident(incident, distance);
        }
      });
    }
  }, [location, incidents]);

  const loadIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('id, type, location, latitude, longitude, impact, description, status, reports, reported_by, reported_by_email, upvotes, downvotes, created_at')
        .eq('status', 'activo')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedIncidents: Incident[] = data?.map(incident => ({
        id: incident.id,
        type: incident.type,
        location: incident.location,
        coordinates: [incident.longitude, incident.latitude],
        impact: incident.impact,
        timeAgo: Math.floor((Date.now() - new Date(incident.created_at).getTime()) / 60000),
        description: incident.description,
        status: incident.status,
        reports: incident.reports || 1,
        reportedBy: incident.reported_by,
        reportedByEmail: incident.reported_by_email,
        upvotes: incident.upvotes || 0,
        downvotes: incident.downvotes || 0,
        userReports: [{
          userName: incident.reported_by,
          userEmail: incident.reported_by_email,
          timeAgo: Math.floor((Date.now() - new Date(incident.created_at).getTime()) / 60000)
        }]
      })) || [];

      setIncidents(formattedIncidents);
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'choque': return Car;
      case 'obra': return Construction;
      case 'cierre': return X;
      case 'congestion': return AlertTriangle;
      default: return Zap;
    }
  };

  const getIncidentColor = (impact: string) => {
    switch (impact) {
      case 'alto': return 'destructive';
      case 'medio': return 'default';
      case 'bajo': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'choque': return 'Accidente';
      case 'obra': return 'Obra';
      case 'cierre': return 'Cierre Vial';
      case 'congestion': return 'Congestión';
      default: return 'Otro';
    }
  };

  const handleSubmitReport = async () => {
    if (!reportForm.type || !reportForm.severity || !reportForm.location) {
      return;
    }

    const userName = user?.user_metadata?.nombre ? 
      `${user.user_metadata.nombre} ${user.user_metadata.apellidos?.[0] || ''}.` : 
      user?.email?.split('@')[0] || 'Usuario Anónimo';
    
    try {
      // Buscar incidente similar (mismo tipo y ubicación cercana)
      const { data: existingIncidents } = await supabase
        .from('incidents')
        .select('*')
        .eq('type', reportForm.type)
        .eq('status', 'activo')
        .ilike('location', `%${reportForm.location.split(' ')[0]}%`);

      let incidentId;
      
      if (existingIncidents && existingIncidents.length > 0) {
        // Agregar reporte al incidente existente
        const existingIncident = existingIncidents[0];
        incidentId = existingIncident.id;
        
        await supabase
          .from('incidents')
          .update({ reports: existingIncident.reports + 1 })
          .eq('id', incidentId);
          
        await supabase
          .from('incident_reports')
          .insert({
            incident_id: incidentId,
            reported_by: userName,
            reported_by_email: user?.email || 'anonimo@email.com'
          });
      } else {
        // Crear nuevo incidente
        const { data: newIncident, error } = await supabase
          .from('incidents')
          .insert({
            type: reportForm.type,
            location: reportForm.location,
            latitude: reportForm.coordinates?.[1] || 4.4389,
            longitude: reportForm.coordinates?.[0] || -75.2322,
            impact: reportForm.severity,
            description: reportForm.description || `${getTypeText(reportForm.type)} reportado por usuario`,
            status: 'activo',
            reports: 1,
            reported_by: userName,
            reported_by_email: user?.email || 'anonimo@email.com'
          })
          .select()
          .single();

        if (error) throw error;
        incidentId = newIncident.id;
      }

      await loadIncidents();
      
      setReportForm({
        type: '',
        severity: '',
        location: '',
        description: '',
        coordinates: null,
        photo: null
      });
      
      setShowReport(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleVote = async (incidentId: string, voteType: 'up' | 'down') => {
    if (!user?.email) {
      alert('Debes iniciar sesión para votar');
      return;
    }
    
    try {
      // Insertar o actualizar voto
      const { error: voteError } = await supabase
        .from('incident_votes')
        .upsert({
          incident_id: incidentId,
          user_email: user.email,
          vote_type: voteType
        }, {
          onConflict: 'incident_id,user_email'
        });
      
      if (voteError) throw voteError;
      
      // Recalcular votos
      const { data: votes } = await supabase
        .from('incident_votes')
        .select('vote_type')
        .eq('incident_id', incidentId);
      
      const upvotes = votes?.filter(v => v.vote_type === 'up').length || 0;
      const downvotes = votes?.filter(v => v.vote_type === 'down').length || 0;
      
      // Actualizar contadores
      const { error: updateError } = await supabase
        .from('incidents')
        .update({ upvotes, downvotes })
        .eq('id', incidentId);
      
      if (updateError) throw updateError;
      
      // Actualizar estado local inmediatamente
      setIncidents(prev => prev.map(incident => 
        incident.id === incidentId 
          ? { ...incident, upvotes, downvotes }
          : incident
      ));
      
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error al votar');
    }
  };

  const handleLocationSelect = (place: any) => {
    setReportForm(prev => ({
      ...prev,
      location: place.place_name.split(',')[0],
      coordinates: place.center
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <TopHeader />

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Incidentes en Tiempo Real</h2>
            <p className="text-sm text-muted-foreground">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700">
            🔴 {incidents.length} activos
          </Badge>
        </div>

        {/* Incidents List */}
        <div className="space-y-3">
          {incidents.map((incident) => {
            const IconComponent = getIncidentIcon(incident.type);
            return (
              <Card key={incident.id} className={`border-l-4 ${
                incident.impact === 'alto' ? 'border-l-red-500' :
                incident.impact === 'medio' ? 'border-l-yellow-500' : 'border-l-blue-500'
              } hover:shadow-md transition-shadow`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        incident.impact === 'alto' ? 'bg-red-100' :
                        incident.impact === 'medio' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          incident.impact === 'alto' ? 'text-red-600' :
                          incident.impact === 'medio' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{getTypeText(incident.type)}</h3>
                          <Badge variant={getIncidentColor(incident.impact) as any} className="text-xs">
                            {incident.impact.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{incident.location}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {incident.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Hace {incident.timeAgo} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{incident.reports} reportes</span>
                          </div>
                          {location.latitude && location.longitude && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {calculateDistance(
                                  location.latitude,
                                  location.longitude,
                                  incident.coordinates[1],
                                  incident.coordinates[0]
                                ).toFixed(1)}km
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <div className="flex items-center gap-1 text-blue-600">
                            <User className="w-3 h-3" />
                            <span>Reportado por: {incident.reportedBy}</span>
                          </div>
                        </div>
                        {incident.userReports.length > 1 && (
                          <div className="text-xs text-muted-foreground">
                            <p className="font-medium mb-1">Otros reportes:</p>
                            <div className="space-y-1">
                              {incident.userReports.slice(1, 3).map((report, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <User className="w-3 h-3" />
                                  <span>{report.userName} - hace {report.timeAgo} min</span>
                                </div>
                              ))}
                              {incident.userReports.length > 3 && (
                                <p className="text-xs italic">
                                  +{incident.userReports.length - 3} reportes más...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleVote(incident.id, 'up')}
                          className="text-green-600 hover:bg-green-50"
                        >
                          👍 {incident.upvotes || 0}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleVote(incident.id, 'down')}
                          className="text-red-600 hover:bg-red-50"
                        >
                          👎 {incident.downvotes || 0}
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Card */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-orange-800">
                🚨 Sistema de Alertas Ciudadanas
              </p>
              <p className="text-xs text-orange-600">
                Los incidentes se actualizan en tiempo real gracias a reportes ciudadanos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Report Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={() => setShowReport(true)}
        >
          📱 Reportar Incidente
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
                <Select value={reportForm.type} onValueChange={(value) => setReportForm(prev => ({...prev, type: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="choque">🚗 Accidente</SelectItem>
                    <SelectItem value="obra">🚧 Obra</SelectItem>
                    <SelectItem value="cierre">❌ Cierre Vial</SelectItem>
                    <SelectItem value="congestion">⚠️ Congestión</SelectItem>
                    <SelectItem value="otro">⚡ Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severidad</Label>
                <Select value={reportForm.severity} onValueChange={(value) => setReportForm(prev => ({...prev, severity: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bajo">🟢 Bajo</SelectItem>
                    <SelectItem value="medio">🟡 Medio</SelectItem>
                    <SelectItem value="alto">🔴 Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>¿Dónde?</Label>
              <PlaceSearch 
                placeholder="Ej: Universidad, Multicentro..."
                value={reportForm.location}
                onPlaceSelect={handleLocationSelect}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Input 
                placeholder="Describe brevemente el incidente..."
                value={reportForm.description}
                onChange={(e) => setReportForm(prev => ({...prev, description: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Foto (opcional)</Label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) setReportForm(prev => ({...prev, photo: file}));
                    };
                    input.click();
                  }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {reportForm.photo ? 'Foto tomada ✓' : 'Tomar foto'}
                </Button>
                {reportForm.photo && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setReportForm(prev => ({...prev, photo: null}))}
                  >
                    ❌
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowReport(false)}>
              Cancelar
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSubmitReport}
              disabled={!reportForm.type || !reportForm.severity || !reportForm.location}
            >
              📤 Enviar Reporte
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
              ¡Gracias por tu reporte! Tu incidente ya está visible para otros usuarios y ayuda a mejorar la movilidad de Ibagué.
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
