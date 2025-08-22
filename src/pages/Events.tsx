import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Settings, MapPin, Clock, Trophy, DollarSign, Eye, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EventForm from "@/components/EventForm";
import EventAdminPanel from "@/components/EventAdminPanel";
import SiteHeader from "@/components/SiteHeader";

interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_date: string;
  is_group_event: boolean;
  max_participants?: number;
  status: 'active' | 'inactive' | 'completed';
  participant_count?: number;
  location?: string;
  prize?: string;
  entry_fee?: string;
  start_time?: string;
  end_time?: string;
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

const Events = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('eventos');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterActivity, setFilterActivity] = useState('Todos');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    participant_name: '',
    participant_phone: '',
    participant_email: '',
    group_name: '',
    notes: ''
  });

  // Load events from Supabase
  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_registrations(count)
        `)
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      
      const eventsWithCounts = data.map(event => ({
        ...event,
        participant_count: event.event_registrations?.[0]?.count || 0,
        status: event.status as 'active' | 'inactive' | 'completed'
      }));
      
      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  // Load registrations from Supabase
  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:events(title)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mappedRegistrations = (data || []).map(reg => ({
        ...reg,
        status: reg.status as 'pending' | 'confirmed' | 'cancelled'
      }));
      setRegistrations(mappedRegistrations);
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadEvents(), loadRegistrations()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const eventsChannel = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        loadEvents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => {
        loadRegistrations();
        loadEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, []);

  const handleEventSubmit = async (eventData: Partial<Event>) => {
    try {
      if (!eventData.title || !eventData.event_date) {
        toast({
          title: "Error",
          description: "Título y fecha son requeridos",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .insert([{
          title: eventData.title,
          event_date: eventData.event_date,
          description: eventData.description || null,
          image_url: eventData.image_url || null,
          is_group_event: eventData.is_group_event || false,
          max_participants: eventData.max_participants || null,
          status: eventData.status || 'active'
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Evento creado",
        description: "El evento se ha creado exitosamente",
      });

      await loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el evento",
        variant: "destructive"
      });
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent) return;

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: selectedEvent.id,
          ...registrationData
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Inscripción exitosa",
        description: `Te has inscrito exitosamente al evento "${selectedEvent.title}"`,
      });

      setShowRegistrationForm(false);
      setRegistrationData({
        participant_name: '',
        participant_phone: '',
        participant_email: '',
        group_name: '',
        notes: ''
      });
      await loadRegistrations();
      await loadEvents();
    } catch (error) {
      console.error('Error creating registration:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la inscripción",
        variant: "destructive"
      });
    }
  };

  const handleAdminLogin = (password: string) => {
    if (password === 'admin123') {
      setIsAdminAuthenticated(true);
      toast({
        title: "Acceso concedido",
        description: "Bienvenido al panel de administración de eventos",
      });
    } else {
      toast({
        title: "Acceso denegado",
        description: "Contraseña incorrecta",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Evento eliminado",
        description: "El evento ha sido eliminado exitosamente",
      });

      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRegistrationStatus = async (registrationId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `La inscripción ha sido ${status === 'confirmed' ? 'confirmada' : 'cancelada'}`,
      });

      await loadRegistrations();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  const filteredEvents = events.filter(event => {
    const activityMatch = filterActivity === 'Todos' || event.title.toLowerCase().includes(filterActivity.toLowerCase());
    return activityMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-bg via-background to-gaming-surface flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Cargando eventos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-bg via-background to-gaming-surface">
      {/* Header */}
      <SiteHeader current="eventos" />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <CardTitle className="text-2xl font-bold text-white">Eventos</CardTitle>
                <TabsList className="grid w-full lg:w-auto grid-cols-1 lg:grid-cols-1">
                  <TabsTrigger value="eventos" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Eventos Disponibles
                  </TabsTrigger>
                </TabsList>
                
                {/* Admin Access Button - Discreto */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdminAccess(!showAdminAccess)}
                  className="opacity-30 hover:opacity-100 transition-opacity"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Events List Tab */}
          <TabsContent value="eventos" className="space-y-6">
            {/* Filter */}
            <Card className="bg-gaming-surface/80 border-primary/20">
              <CardContent className="p-4">
                <div className="max-w-md">
                  <Label className="text-primary font-medium">Filtrar por Actividad</Label>
                  <Select value={filterActivity} onValueChange={setFilterActivity}>
                    <SelectTrigger className="mt-2 border-primary/30 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todas las Actividades</SelectItem>
                      <SelectItem value="Torneo">Torneos</SelectItem>
                      <SelectItem value="Competencia">Competencias</SelectItem>
                      <SelectItem value="Evento">Eventos Especiales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden bg-gaming-surface/90 border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all group">
                  <div className="relative">
                    {/* Event Image */}
                    <div 
                      className="h-48 bg-gradient-to-br from-primary/30 to-primary/10 bg-cover bg-center relative"
                      style={{
                        backgroundImage: event.image_url ? `url(${event.image_url})` : undefined
                      }}
                    >
                      {/* Date Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-accent text-black font-bold px-2 py-1">
                          {format(new Date(event.event_date), "dd MMM", { locale: es }).toUpperCase()}
                          <br />
                          <span className="text-xs">{event.start_time || '19:00'} hrs</span>
                        </Badge>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-primary/90 text-white border-primary">
                          <Trophy className="h-3 w-3 mr-1" />
                          {event.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                        </Badge>
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    </div>

                    <CardContent className="p-5 space-y-4">
                      {/* Title */}
                      <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {event.description || "Únete a este increíble evento de Gaming Grid"}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>Gaming Grid - Evento Especial</span>
                        </div>
                        
                        {event.max_participants && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-primary" />
                            <span>Máximo {event.max_participants} participantes</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>Duración: {event.start_time || '19:00'} - {event.end_time || '23:00'}</span>
                        </div>

                        {event.is_group_event && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-primary" />
                            <span>Evento grupal - Equipos permitidos</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-black font-semibold shadow-lg shadow-primary/20"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowRegistrationForm(true);
                        }}
                        disabled={event.status !== 'active'}
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        {event.status === 'active' ? 'Inscribirse Ahora' : 'No disponible'}
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <Card className="bg-gaming-surface/80 border-primary/20">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No hay eventos disponibles en este momento.</p>
                  <p className="text-sm text-muted-foreground mt-2">¡Mantente atento para próximos eventos!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Hidden Admin Panel */}
        {showAdminAccess && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gaming-surface border-primary/30 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary">Panel de Administración - Eventos</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdminAccess(false)}
                    className="border-primary/50 hover:bg-primary/10"
                  >
                    ✕
                  </Button>
                </div>
                
                <Tabs defaultValue="crear" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="crear" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Crear Evento
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Gestión
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="crear">
                    {isAdminAuthenticated ? (
                      <EventForm onSubmit={handleEventSubmit} />
                    ) : (
                      <Card className="bg-gaming-surface/80 border-primary/30">
                        <CardContent className="p-6">
                          <div className="max-w-md mx-auto space-y-4">
                            <h3 className="text-lg font-semibold text-center text-primary">Acceso Restringido</h3>
                            <p className="text-sm text-muted-foreground text-center">
                              Solo los administradores pueden crear eventos.
                            </p>
                            <div className="space-y-3">
                              <Input
                                type="password"
                                placeholder="Contraseña de administrador"
                                className="border-primary/30 focus:border-primary"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAdminLogin((e.target as HTMLInputElement).value);
                                  }
                                }}
                              />
                              <Button 
                                className="w-full bg-primary hover:bg-primary/90 text-black"
                                onClick={(e) => {
                                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                  handleAdminLogin(input.value);
                                }}
                              >
                                Acceder
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="admin">
                    <EventAdminPanel
                      events={events}
                      registrations={registrations}
                      isAuthenticated={isAdminAuthenticated}
                      onLogin={handleAdminLogin}
                      onDeleteEvent={handleDeleteEvent}
                      onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {/* Registration Modal */}
        {showRegistrationForm && selectedEvent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full max-h-[90vh] overflow-auto bg-gaming-surface border-primary/30">
              <CardHeader className="border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary">Inscribirse al evento</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowRegistrationForm(false)}
                    className="border-primary/50 hover:bg-primary/10"
                  >
                    ✕
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{selectedEvent.title}</p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-primary font-medium">Nombre Completo *</Label>
                    <Input
                      value={registrationData.participant_name}
                      onChange={(e) => setRegistrationData({...registrationData, participant_name: e.target.value})}
                      className="border-primary/30 focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-primary font-medium">Teléfono *</Label>
                    <Input
                      type="tel"
                      value={registrationData.participant_phone}
                      onChange={(e) => setRegistrationData({...registrationData, participant_phone: e.target.value})}
                      className="border-primary/30 focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-primary font-medium">Email *</Label>
                    <Input
                      type="email"
                      value={registrationData.participant_email}
                      onChange={(e) => setRegistrationData({...registrationData, participant_email: e.target.value})}
                      className="border-primary/30 focus:border-primary"
                      required
                    />
                  </div>
                  {selectedEvent.is_group_event && (
                    <div className="space-y-2">
                      <Label className="text-primary font-medium">Nombre del Grupo/Equipo</Label>
                      <Input
                        value={registrationData.group_name}
                        onChange={(e) => setRegistrationData({...registrationData, group_name: e.target.value})}
                        className="border-primary/30 focus:border-primary"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-primary font-medium">Comentarios</Label>
                    <Input
                      value={registrationData.notes}
                      onChange={(e) => setRegistrationData({...registrationData, notes: e.target.value})}
                      className="border-primary/30 focus:border-primary"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-semibold">
                    <Trophy className="h-4 w-4 mr-2" />
                    Inscribirse al Evento
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;