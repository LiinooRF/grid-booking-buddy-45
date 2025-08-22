import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Settings, Clock, Trophy, MapPin, Plus, ArrowLeft } from "lucide-react";
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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [loading, setLoading] = useState(true);
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
        title: "¡Inscripción exitosa!",
        description: `Te has inscrito al evento "${selectedEvent.title}"`,
      });

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
        description: "Bienvenido al panel de administración",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-bg via-background to-gaming-surface">
        <SiteHeader current="eventos" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-primary animate-pulse">Cargando eventos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-bg via-background to-gaming-surface">
      <SiteHeader current="eventos" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Admin Access Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdminAccess(!showAdminAccess)}
            className="opacity-30 hover:opacity-100 transition-all duration-200 bg-gaming-surface/50 backdrop-blur-sm border border-primary/30 hover:border-primary"
          >
            <Settings className="h-4 w-4 text-primary" />
          </Button>
        </div>

        {/* Selected Event Banner */}
        {selectedEvent && (
          <div className="mb-8 space-y-6 animate-fade-in">
            {/* Event Banner */}
            <div 
              className="relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 bg-cover bg-center"
              style={{
                backgroundImage: selectedEvent.image_url ? `url(${selectedEvent.image_url})` : undefined
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              
              {/* Back Button */}
              <Button 
                variant="ghost"
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 left-4 text-white hover:text-primary hover:bg-black/30 z-10"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver a eventos
              </Button>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-black text-primary animate-scale-in">
                    {selectedEvent.title.toUpperCase()}
                  </h1>
                  <div className="bg-primary text-black px-6 py-2 rounded-full font-bold text-lg animate-fade-in">
                    {selectedEvent.description || "¡ÚNETE AL EVENTO!"}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <Badge 
                  className={`px-3 py-1 text-sm font-bold ${
                    selectedEvent.status === 'active' 
                      ? 'bg-primary text-black' 
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {selectedEvent.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                </Badge>
              </div>
            </div>

            {/* Event Details */}
            <Card className="bg-gaming-surface/80 border-primary/30">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Event Info */}
                  <div className="md:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold text-white">Información del Evento</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Fecha</p>
                          <p>{format(new Date(selectedEvent.event_date), "PPPP", { locale: es })}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-300">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Horario</p>
                          <p>{selectedEvent.start_time || '19:00'} - {selectedEvent.end_time || '23:00'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-300">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Ubicación</p>
                          <p>Gaming Grid</p>
                        </div>
                      </div>
                      
                      {selectedEvent.max_participants && (
                        <div className="flex items-center gap-3 text-gray-300">
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Participantes</p>
                            <p>{selectedEvent.participant_count || 0}/{selectedEvent.max_participants}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registration Form */}
                  <div>
                    <Card className="bg-gaming-surface/50 border-primary/30">
                      <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2">
                          <Trophy className="h-5 w-5" />
                          Inscríbete Ahora
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedEvent.status === 'active' ? (
                          <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                            <div>
                              <Label className="text-gray-300 font-medium">Nombre Completo</Label>
                              <Input
                                value={registrationData.participant_name}
                                onChange={(e) => setRegistrationData({...registrationData, participant_name: e.target.value})}
                                className="bg-gaming-surface border-primary/30 text-white placeholder-gray-500 focus:border-primary"
                                placeholder="Tu nombre completo"
                                required
                              />
                            </div>
                            
                            <div>
                              <Label className="text-gray-300 font-medium">Teléfono</Label>
                              <Input
                                type="tel"
                                value={registrationData.participant_phone}
                                onChange={(e) => setRegistrationData({...registrationData, participant_phone: e.target.value})}
                                className="bg-gaming-surface border-primary/30 text-white placeholder-gray-500 focus:border-primary"
                                placeholder="+56 9 1234 5678"
                                required
                              />
                            </div>
                            
                            <div>
                              <Label className="text-gray-300 font-medium">Email</Label>
                              <Input
                                type="email"
                                value={registrationData.participant_email}
                                onChange={(e) => setRegistrationData({...registrationData, participant_email: e.target.value})}
                                className="bg-gaming-surface border-primary/30 text-white placeholder-gray-500 focus:border-primary"
                                placeholder="tu@email.com"
                                required
                              />
                            </div>
                            
                            {selectedEvent.is_group_event && (
                              <div>
                                <Label className="text-gray-300 font-medium">Nombre del Equipo</Label>
                                <Input
                                  value={registrationData.group_name}
                                  onChange={(e) => setRegistrationData({...registrationData, group_name: e.target.value})}
                                  className="bg-gaming-surface border-primary/30 text-white placeholder-gray-500 focus:border-primary"
                                  placeholder="Nombre de tu equipo"
                                />
                              </div>
                            )}
                            
                            <Button 
                              type="submit" 
                              className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105"
                            >
                              <Trophy className="h-4 w-4 mr-2" />
                              INSCRIBIRSE AL EVENTO
                            </Button>
                          </form>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-400">Este evento no está disponible para inscripciones.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Events Grid */}
        {!selectedEvent && (
          <div className="space-y-8">
            {/* Gaming Grid Banner */}
            <div className="relative h-80 rounded-2xl overflow-hidden">
              <img
                src="/lovable-uploads/a42b2dbc-cc15-498a-b267-02f4922cce94.png"
                alt="Gaming Grid"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center">
              <p className="text-muted-foreground text-lg">Descubre los próximos eventos de Gaming Grid</p>
            </div>

            {events.length === 0 ? (
              <Card className="bg-gaming-surface/50 border-primary/20">
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold text-white mb-2">No hay eventos disponibles</h3>
                  <p className="text-gray-400">¡Mantente atento para próximos eventos increíbles!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card 
                    key={event.id} 
                    className="overflow-hidden bg-gaming-surface/90 border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all group cursor-pointer hover-scale"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="relative">
                      {/* Date Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <Badge className="bg-primary text-black font-bold px-3 py-1 text-sm">
                          {format(new Date(event.event_date), "dd MMM", { locale: es }).toUpperCase()}
                          <br />
                          <span className="text-xs">{event.start_time || '19:00'} hrs</span>
                        </Badge>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <Badge 
                          className={`px-2 py-1 text-xs font-bold ${
                            event.status === 'active' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-500 text-white'
                          }`}
                        >
                          Gaming Grid
                        </Badge>
                      </div>

                      {/* Event Image */}
                      <div 
                        className="h-48 bg-gradient-to-br from-primary/30 to-primary/10 bg-cover bg-center relative"
                        style={{
                          backgroundImage: event.image_url ? `url(${event.image_url})` : undefined
                        }}
                      >
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
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-primary" />
                            <span>Gaming Grid</span>
                          </div>
                          
                          {event.max_participants && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Trophy className="h-4 w-4 text-primary" />
                              <span>Máximo {event.max_participants} participantes</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{event.start_time || '19:00'} - {event.end_time || '23:00'}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button 
                          className="w-full bg-primary/80 hover:bg-primary text-black font-semibold"
                          disabled={event.status !== 'active'}
                        >
                          {event.status === 'active' ? 'Ver más' : 'No disponible'}
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hidden Admin Panel */}
        {showAdminAccess && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gaming-surface border border-primary/30 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary">Panel de Administración - Eventos</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdminAccess(false)}
                    className="border-primary/50 text-primary hover:bg-primary/10"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Create Event Section */}
                  <Card className="bg-gaming-surface/50 border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-primary flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Crear Nuevo Evento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isAdminAuthenticated ? (
                        <EventForm onSubmit={handleEventSubmit} />
                      ) : (
                        <div className="max-w-md mx-auto space-y-4">
                          <p className="text-gray-400 text-center">
                            Ingresa la contraseña de administrador para crear eventos.
                          </p>
                          <div className="space-y-3">
                            <Input
                              type="password"
                              placeholder="Contraseña de administrador"
                              className="bg-gaming-surface border-primary/30 text-white focus:border-primary"
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
                      )}
                    </CardContent>
                  </Card>

                  {/* Admin Panel */}
                  {isAdminAuthenticated && (
                    <EventAdminPanel
                      events={events}
                      registrations={registrations}
                      isAuthenticated={isAdminAuthenticated}
                      onLogin={handleAdminLogin}
                      onDeleteEvent={handleDeleteEvent}
                      onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;