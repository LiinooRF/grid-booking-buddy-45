import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Settings, Clock, Trophy, MapPin, Plus, ArrowLeft, MessageCircle, Mail } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EventForm from "@/components/EventForm";
import EventAdminPanel from "@/components/EventAdminPanel";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import eventsCover from "@/assets/events-cover.png";
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(events.length / ITEMS_PER_PAGE));
  const paginatedEvents = events.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [events]);

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
          status: eventData.status || 'active',
          external_link: eventData.external_link || null,
          max_groups: eventData.max_groups || null,
          participants_per_group: eventData.participants_per_group || null,
          start_time: eventData.start_time || null,
          end_time: eventData.end_time || null
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

        {/* Enhanced Selected Event Banner */}
        {selectedEvent && (
          <div className="mb-8 space-y-6 animate-fade-in">
            {/* Event Banner with improved design */}
            <div 
              className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 bg-cover bg-center group"
              style={{
                backgroundImage: selectedEvent.image_url ? `url(${selectedEvent.image_url})` : undefined
              }}
            >
              {/* Enhanced Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-gaming-accent/10" />
              
              {/* Back Button */}
              <Button 
                variant="ghost"
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 left-6 text-white hover:text-primary hover:bg-black/40 z-10 backdrop-blur-sm border border-white/20 hover:border-primary/50 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver a eventos
              </Button>
              
              {/* Enhanced Content */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
                <div className="space-y-6 max-w-4xl">
                  <div className="relative">
                    <h1 className="text-4xl md:text-7xl font-black text-white animate-scale-in leading-tight">
                      {selectedEvent.title.toUpperCase()}
                    </h1>
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-gaming-accent/20 blur-xl -z-10 rounded-lg"></div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-primary via-primary to-gaming-accent text-black px-8 py-3 rounded-full font-bold text-lg animate-fade-in shadow-lg inline-block">
                    ¡ÚNETE AL EVENTO!
                  </div>
                  
                   <div className="flex items-center justify-center gap-8 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">
                          {((s: string) => s.charAt(0).toUpperCase() + s.slice(1))(format(new Date(selectedEvent.event_date), "MMMM d", { locale: es }))}
                        </p>
                        <p className="text-gray-400 text-sm">Fecha del evento</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">
                          {selectedEvent.is_group_event 
                            ? `${selectedEvent.max_groups || 'Ilimitados'} equipos`
                            : `${selectedEvent.max_participants || 'Ilimitados'} personas`
                          }
                        </p>
                        <p className="text-gray-400 text-sm">
                          {selectedEvent.is_group_event ? 'Máximo de equipos' : 'Máximo de participantes'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Status Badge */}
              <div className="absolute top-6 right-6">
                <Badge 
                  className={`px-4 py-2 text-sm font-bold shadow-xl backdrop-blur-sm ${
                    selectedEvent.status === 'active' 
                      ? 'bg-primary text-black shadow-primary/50' 
                      : 'bg-gray-500/80 text-white'
                  }`}
                >
                  {selectedEvent.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                </Badge>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute bottom-6 left-6 w-12 h-12 border-2 border-primary/40 rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 right-6 w-8 h-8 border-2 border-gaming-accent/40 rounded-full animate-pulse"></div>
            </div>

            {/* Enhanced Event Details */}
            <Card className="bg-gaming-surface/90 border-primary/40 shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gaming-accent/5"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl"></div>
              
              <CardContent className="p-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Event Info */}
                  <div className="md:col-span-2 space-y-6">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-primary" />
                      Información del Evento
                    </h2>
                    
                    {/* Descripción del evento mejorada */}
                    {selectedEvent.description && (
                      <div className="bg-gradient-to-r from-gaming-surface/80 to-gaming-surface/40 border border-primary/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-gaming-accent"></div>
                        <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          Descripción del Evento
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-lg">{selectedEvent.description}</p>
                      </div>
                    )}
                    
                    {/* Detalles mejorados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div className="bg-gaming-surface/50 border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors duration-200">
                        <div className="flex items-center gap-3 text-gray-300">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-white">Fecha del Evento</p>
                            <p className="text-gray-400">{((s: string) => s.charAt(0).toUpperCase() + s.slice(1))(format(new Date(selectedEvent.event_date), "MMMM d, yyyy", { locale: es }))}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gaming-surface/50 border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors duration-200">
                        <div className="flex items-center gap-3 text-gray-300">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-white">Horario</p>
                            <p className="text-gray-400">{selectedEvent.start_time ? (selectedEvent.end_time ? `${selectedEvent.start_time} - ${selectedEvent.end_time}` : selectedEvent.start_time) : 'Por confirmar'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gaming-surface/50 border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors duration-200">
                        <div className="flex items-center gap-3 text-gray-300">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-white">Participantes</p>
                            <p className="text-gray-400">
                              {selectedEvent.is_group_event 
                                ? `${selectedEvent.max_groups || 'Ilimitados'} equipos de ${selectedEvent.participants_per_group || 'cualquier'} personas`
                                : `Máximo ${selectedEvent.max_participants || 'ilimitados'} participantes`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gaming-surface/50 border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors duration-200">
                        <div className="flex items-center gap-3 text-gray-300">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-white">Ubicación</p>
                            <p className="text-gray-400">Gaming Grid</p>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>

                  {/* Enhanced Registration Section */}
                  <div>
                    <Card className="bg-gradient-to-br from-gaming-surface/80 to-gaming-surface/40 border-primary/40 shadow-xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gaming-accent/10"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl"></div>
                      
                      <CardHeader className="relative z-10">
                        <CardTitle className="text-primary flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-primary" />
                          </div>
                          Participar en el Evento
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        {selectedEvent.status === 'active' ? (
                          <div className="space-y-6 text-center">
                            <div className="space-y-3">
                              <p className="text-gray-300 text-lg">
                                ¿Listo para la competencia?
                              </p>
                              <p className="text-gray-400 text-sm">
                                Haz clic en el botón para inscribirte
                              </p>
                            </div>
                            
                            <Button 
                              onClick={() => {
                                if (selectedEvent.external_link) {
                                  window.open(selectedEvent.external_link, '_blank');
                                } else {
                                  toast({
                                    title: "Información",
                                    description: "Enlace de inscripción próximamente disponible",
                                  });
                                }
                              }}
                              className="w-full bg-gradient-to-r from-primary to-gaming-accent hover:from-primary/90 hover:to-gaming-accent/90 text-black font-bold py-4 text-lg shadow-xl shadow-primary/30 transition-all duration-200 hover:scale-105 relative overflow-hidden group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                              <Trophy className="h-5 w-5 mr-2" />
                              INSCRIBIRSE AHORA
                            </Button>
                            
                            {selectedEvent.external_link && (
                              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                Se abrirá en una nueva ventana
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Trophy className="h-8 w-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-lg">Este evento no está disponible para inscripciones.</p>
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
            {/* Gaming Grid Banner - Enhanced */}
            <div className="relative h-96 rounded-2xl overflow-hidden group">
            <img
              src={eventsCover}
              alt="Gaming Grid eventos - banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-gaming-accent/10" />
              
              {/* Enhanced Content */}
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
                <div className="space-y-6 animate-fade-in">
                  <div className="relative">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-4 animate-scale-in">
                      EVENTOS <span className="text-primary">ÉPICOS</span>
                    </h1>
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-gaming-accent/20 blur-sm -z-10 rounded-lg"></div>
                  </div>
                  
                  <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
                    Únete a la acción más intensa en Gaming Grid
                  </p>
                  
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gaming-accent rounded-full animate-pulse"></div>
                      <span>Premios Increíbles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span>Competencia Real</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-20 h-20 border border-primary/30 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 border border-gaming-accent/30 rounded-full animate-pulse"></div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">Próximos Eventos</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Descubre la próxima generación de competencias gaming. Cada evento es una oportunidad de demostrar tu habilidad.
              </p>
            </div>

              {events.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedEvents.map((event, index) => (
                      <Card 
                        key={event.id} 
                        className="overflow-hidden bg-gaming-surface/90 border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all group cursor-pointer hover-scale"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="relative">
                          {/* Date Badge */}
                          <div className="absolute top-3 left-3 z-10">
                            <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-center">
                              <div className="text-primary font-black text-lg leading-none">
                                {format(new Date(event.event_date), "dd", { locale: es })}
                              </div>
                              <div className="text-white text-xs font-semibold uppercase tracking-wide">
                                {format(new Date(event.event_date), "MMM", { locale: es })}
                              </div>
                            </div>
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
                              backgroundImage: `url(${event.image_url || eventsCover})`
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
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Gaming Grid</span>
                              </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4 text-primary" />
                              <span>
                                {event.is_group_event 
                                  ? `${event.max_groups || 'Ilimitados'} equipos`
                                  : `${event.max_participants || 'Ilimitados'} personas`
                                }
                              </span>
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

                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)); }} />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <PaginationItem key={p}>
                              <PaginationLink href="#" isActive={p === currentPage} onClick={(e) => { e.preventDefault(); setCurrentPage(p); }}>
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }} />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}

                  {/* Eventos en Preparación moved below */}
                  <Card className="mt-10 bg-gaming-surface/50 border-primary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-gaming-accent/5"></div>
                    <CardContent className="p-12 text-center relative z-10">
                      <div className="relative">
                        <Trophy className="h-20 w-20 text-primary mx-auto mb-6 opacity-50 animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-gaming-accent/20 blur-xl rounded-full"></div>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">Eventos en Preparación</h3>
                      <p className="text-gray-400 text-lg">¡Los eventos más épicos están por llegar! Mantente atento para experiencias gaming increíbles.</p>
                      <div className="mt-6 flex justify-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gaming-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </CardContent>
                  </Card>
                </>
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

      <SiteFooter />
    </div>
  );
};

export default Events;