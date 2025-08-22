import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Settings, Plus } from "lucide-react";
import EventsList from "@/components/EventsList";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import EventForm from "@/components/EventForm";
import EventAdminPanel from "@/components/EventAdminPanel";

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
  const [loading, setLoading] = useState(true);

  // Cargar eventos desde Supabase
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
      console.error('Error cargando eventos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        variant: "destructive"
      });
    }
  };

  // Cargar inscripciones desde Supabase
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
      console.error('Error cargando inscripciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las inscripciones",
        variant: "destructive"
      });
    }
  };

  // Cargar datos al inicio
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadEvents(), loadRegistrations()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Suscripción en tiempo real
  useEffect(() => {
    const eventsChannel = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        loadEvents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => {
        loadRegistrations();
        loadEvents(); // Para actualizar el conteo
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, []);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setCurrentTab('inscripcion');
  };

  const handleEventSubmit = async (eventData: Partial<Event>) => {
    try {
      // Ensure required fields are present
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
      console.error('Error creando evento:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el evento",
        variant: "destructive"
      });
    }
  };

  const handleRegistrationSubmit = async (registrationData: {
    participant_name: string;
    participant_phone: string;
    participant_email: string;
    group_name?: string;
    notes?: string;
  }) => {
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

      await loadRegistrations();
      await loadEvents(); // Para actualizar el conteo
    } catch (error) {
      console.error('Error creando inscripción:', error);
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
      console.error('Error eliminando evento:', error);
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
      console.error('Error actualizando estado:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 p-4">
        <div className="container mx-auto max-w-6xl">
          <Card>
            <CardContent className="p-6 text-center">
              <p>Cargando eventos...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 p-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/reservas'}
                className="text-sm"
              >
                ← Reservas
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = 'https://gaminggrid.cl'}
                className="text-sm"
              >
                Página Principal
              </Button>
            </div>
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              GameZone - Eventos
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Descubre y participa en nuestros eventos especiales
            </p>
          </CardHeader>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <Card>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="eventos" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Eventos
                </TabsTrigger>
                <TabsTrigger value="inscripcion" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Inscripción
                </TabsTrigger>
                <TabsTrigger value="crear" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Evento
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>
            </CardHeader>
          </Card>

          {/* Events List Tab */}
          <TabsContent value="eventos">
            <EventsList 
              events={events}
              onEventSelect={handleEventSelect}
              selectedEventId={selectedEvent?.id}
            />
          </TabsContent>

          {/* Registration Tab */}
          <TabsContent value="inscripcion">
            {selectedEvent ? (
              <EventRegistrationForm 
                event={selectedEvent}
                onSubmit={handleRegistrationSubmit}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Selecciona un evento de la lista para inscribirte.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setCurrentTab('eventos')}
                  >
                    Ver Eventos Disponibles
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Create Event Tab */}
          <TabsContent value="crear">
            <EventForm onSubmit={handleEventSubmit} />
          </TabsContent>

          {/* Admin Panel Tab */}
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
  );
};

export default Events;