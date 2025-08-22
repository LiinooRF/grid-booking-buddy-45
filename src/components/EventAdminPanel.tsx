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
          <TabsTrigger value="registrations">Inscripciones</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        {format(new Date(event.event_date), "PPP", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {event.is_group_event ? 'Grupal' : 'Individual'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Inscripciones
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">Todas</option>
                    <option value="pending">Pendientes</option>
                    <option value="confirmed">Confirmadas</option>
                    <option value="cancelled">Canceladas</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Participante</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.event?.title || 'N/A'}
                      </TableCell>
                      <TableCell>{registration.participant_name}</TableCell>
                      <TableCell>{registration.participant_email}</TableCell>
                      <TableCell>{registration.participant_phone}</TableCell>
                      <TableCell>{registration.group_name || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(registration.status)}>
                          {registration.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(registration.created_at), "PPP", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {registration.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onUpdateRegistrationStatus(registration.id, 'confirmed')}
                              >
                                Confirmar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onUpdateRegistrationStatus(registration.id, 'cancelled')}
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}