import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Edit2, Eye, Shield } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_date: string;
  is_group_event: boolean;
  max_participants?: number;
  status: 'active' | 'inactive' | 'completed';
  external_link?: string;
  max_groups?: number;
  participants_per_group?: number;
}

interface Registration {
  id: string;
  event_id: string;
  participant_name: string;
  participant_phone: string;
  participant_email: string;
  group_name?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  event?: {
    title: string;
  };
}

interface EventAdminPanelProps {
  events: Event[];
  registrations: Registration[];
  isAuthenticated: boolean;
  onLogin: (password: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateRegistrationStatus: (registrationId: string, status: 'confirmed' | 'cancelled') => void;
}

export default function EventAdminPanel({
  events,
  registrations,
  isAuthenticated,
  onLogin,
  onDeleteEvent,
  onUpdateRegistrationStatus
}: EventAdminPanelProps) {
  const [password, setPassword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Panel de Administración - Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              Acceso restringido. Ingresa la contraseña de administrador.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Contraseña de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onLogin(password)}
            />
            <Button onClick={() => onLogin(password)}>
              Ingresar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEventStats = () => {
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === 'active').length;
    const totalRegistrations = registrations.length;
    const pendingRegistrations = registrations.filter(r => r.status === 'pending').length;

    return { totalEvents, activeEvents, totalRegistrations, pendingRegistrations };
  };

  const filteredRegistrations = registrations.filter(registration => {
    if (filterStatus === 'all') return true;
    return registration.status === filterStatus;
  });

  const stats = getEventStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'inactive':
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-sm text-muted-foreground">Total Eventos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.activeEvents}</div>
            <p className="text-sm text-muted-foreground">Eventos Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-sm text-muted-foreground">Total Inscripciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRegistrations}</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Gestión de Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {events.map((event) => (
                  <Card key={event.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Información Principal */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="text-xl font-semibold">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(event.event_date), "PPPP", { locale: es })}
                              </p>
                            </div>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status === 'active' ? 'Activo' : event.status === 'inactive' ? 'Inactivo' : 'Completado'}
                            </Badge>
                          </div>
                          
                          {/* Descripción */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Descripción del Evento</h4>
                            <div className="bg-muted/50 p-3 rounded-md">
                              <p className="text-sm text-muted-foreground">
                                {event.description || 'Sin descripción'}
                              </p>
                            </div>
                          </div>

                          {/* Enlace Externo */}
                          {event.external_link && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Enlace de Inscripción</h4>
                              <div className="bg-muted/50 p-3 rounded-md">
                                <a 
                                  href={event.external_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline break-all"
                                >
                                  {event.external_link}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Información del Evento y Acciones */}
                        <div className="space-y-4">
                          <Card className="bg-muted/30">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Detalles del Evento</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tipo:</span>
                                <span className="font-medium">
                                  {event.is_group_event ? 'Evento Grupal' : 'Evento Individual'}
                                </span>
                              </div>
                              
                              {event.is_group_event ? (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Participantes por grupo:</span>
                                    <span className="font-medium">
                                      {event.participants_per_group || 'No definido'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Máximo de grupos:</span>
                                    <span className="font-medium">
                                      {event.max_groups || 'No definido'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total participantes:</span>
                                    <span className="font-medium">
                                      {event.max_participants || 'No definido'}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Máximo participantes:</span>
                                  <span className="font-medium">
                                    {event.max_participants || 'No definido'}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Acciones */}
                          <div className="flex gap-2">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => onDeleteEvent(event.id)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay eventos creados todavía.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}