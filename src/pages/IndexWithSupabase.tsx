import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EquipmentGrid from "@/components/EquipmentGrid";
import ReservationForm from "@/components/ReservationForm";
import AdminPanel from "@/components/AdminPanel";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Users, Settings, MessageCircle, Mail, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  image_url?: string;
}

interface SupabaseReservation {
  id: string;
  equipment_id: string;
  user_name: string;
  user_phone: string;
  start_time: string;
  end_time: string;
  hours: number;
  status: string;
  ticket_number: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  equipment?: {
    id: string;
    name: string;
    type: string;
  };
}

const Index = () => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<SupabaseReservation[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<string>('equipos');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [reservationTicket, setReservationTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar equipos desde Supabase
  const loadEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error loading equipment:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos",
        variant: "destructive"
      });
    }
  };

  // Cargar reservas desde Supabase
  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          equipment (
            id,
            name,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive"
      });
    }
  };

  // Convertir equipos para el componente EquipmentGrid
  const convertEquipmentForGrid = () => {
    return equipment.map(eq => {
      // Buscar si hay reservas activas para este equipo
      const activeReservation = reservations.find(res => 
        res.equipment_id === eq.id && 
        (res.status === 'confirmed' || res.status === 'active')
      );

      let status: 'available' | 'occupied' | 'reserved_pending' | 'reserved_confirmed' = 'available';
      let occupiedUntil = '';
      let currentPlayer = '';

      if (activeReservation) {
        if (activeReservation.status === 'confirmed') {
          status = 'reserved_confirmed';
          occupiedUntil = new Date(activeReservation.end_time).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          currentPlayer = activeReservation.user_name;
        } else if (activeReservation.status === 'active') {
          status = 'occupied';
          occupiedUntil = new Date(activeReservation.end_time).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          currentPlayer = activeReservation.user_name;
        }
      }

      // Verificar reservas pendientes
      const pendingReservation = reservations.find(res => 
        res.equipment_id === eq.id && res.status === 'pending'
      );

      if (pendingReservation && status === 'available') {
        status = 'reserved_pending';
      }

      return {
        id: eq.id,
        code: eq.name, // Usar el nombre como código por ahora
        type: eq.type as 'PC' | 'CONSOLE',
        name: eq.description || eq.name,
        status,
        occupiedUntil,
        currentPlayer
      };
    });
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadEquipment(), loadReservations()]);
      setLoading(false);
    };

    init();

    // Suscribirse a cambios en tiempo real
    const equipmentSubscription = supabase
      .channel('equipment_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'equipment' },
        () => loadEquipment()
      )
      .subscribe();

    const reservationSubscription = supabase
      .channel('reservation_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => loadReservations()
      )
      .subscribe();

    return () => {
      equipmentSubscription.unsubscribe();
      reservationSubscription.unsubscribe();
    };
  }, []);

  const handleEquipmentSelect = (equipment: any) => {
    setSelectedEquipment(equipment.code);
    setCurrentTab('reservar');
    toast({
      title: "Equipo seleccionado",
      description: `${equipment.code} - ${equipment.name}`,
      variant: "default"
    });
  };

  const handleReservationSubmit = async (data: any) => {
    try {
      const ticketNumber = `GG${Date.now().toString().slice(-6)}`;
      
      // Buscar el equipo seleccionado
      const selectedEq = equipment.find(eq => eq.name === data.equipmentCode);
      if (!selectedEq) {
        throw new Error('Equipo no encontrado');
      }

      // Crear la reserva en Supabase
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert([
          {
            equipment_id: selectedEq.id,
            user_name: data.fullName,
            user_phone: data.phone,
            start_time: `${data.reservationDate}T${data.startTime}:00`,
            end_time: `${data.reservationDate}T${data.endTime}:00`,
            hours: data.hours,
            status: 'pending',
            ticket_number: ticketNumber,
            notes: `Alias: ${data.alias}, Email: ${data.email}`
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setReservationTicket(ticketNumber);

      // Enviar notificación por Telegram
      try {
        const { error: telegramError } = await supabase.functions.invoke('telegram-bot', {
          body: {
            action: 'new_reservation',
            reservation: {
              ...reservation,
              equipment_name: selectedEq.name,
              user_name: data.fullName
            }
          }
        });

        if (telegramError) {
          console.error('Error sending Telegram notification:', telegramError);
        } else {
          toast({
            title: "Notificación enviada",
            description: "El administrador ha sido notificado por Telegram",
            variant: "default"
          });
        }
      } catch (telegramError) {
        console.error('Error with Telegram notification:', telegramError);
      }

      // Recargar reservas
      await loadReservations();

      toast({
        title: "¡Reserva creada!",
        description: `Tu ticket es: ${ticketNumber}`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la reserva. Inténtalo nuevamente.",
        variant: "destructive"
      });
    }
  };

  const handleAdminLogin = (password: string) => {
    if (password === "admin123") {
      setIsAdminAuthenticated(true);
      toast({
        title: "Acceso autorizado",
        description: "Panel de administración activado",
        variant: "default"
      });
      return true;
    }
    return false;
  };

  // Funciones de administración
  const handleReservationConfirm = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', reservationId);

      if (error) throw error;

      const reservation = reservations.find(r => r.id === reservationId);
      if (reservation) {
        await supabase.functions.invoke('telegram-bot', {
          body: {
            action: 'confirm_reservation',
            reservation: {
              ...reservation,
              equipment_name: reservation.equipment?.name
            }
          }
        });
      }

      await loadReservations();
      toast({
        title: "Reserva confirmada",
        description: "La reserva ha sido confirmada exitosamente",
        variant: "default"
      });
    } catch (error) {
      console.error('Error confirming reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo confirmar la reserva",
        variant: "destructive"
      });
    }
  };

  const handleReservationCancel = async (reservationId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: 'cancelled',
          notes: reason ? `${reason}` : undefined
        })
        .eq('id', reservationId);

      if (error) throw error;

      const reservation = reservations.find(r => r.id === reservationId);
      if (reservation) {
        await supabase.functions.invoke('telegram-bot', {
          body: {
            action: 'cancel_reservation',
            reservation: {
              ...reservation,
              equipment_name: reservation.equipment?.name,
              cancellation_reason: reason
            }
          }
        });
      }

      await loadReservations();
      toast({
        title: "Reserva cancelada",
        description: "La reserva ha sido cancelada",
        variant: "default"
      });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva",
        variant: "destructive"
      });
    }
  };

  const handleMarkArrived = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'active' })
        .eq('id', reservationId);

      if (error) throw error;

      const reservation = reservations.find(r => r.id === reservationId);
      if (reservation) {
        await supabase.functions.invoke('telegram-bot', {
          body: {
            action: 'user_arrived',
            reservation: {
              ...reservation,
              equipment_name: reservation.equipment?.name
            }
          }
        });
      }

      await loadReservations();
      toast({
        title: "Cliente marcado como llegado",
        description: "La sesión ha comenzado",
        variant: "default"
      });
    } catch (error) {
      console.error('Error marking as arrived:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar como llegado",
        variant: "destructive"
      });
    }
  };

  const handleRelease = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'completed' })
        .eq('id', reservationId);

      if (error) throw error;

      const reservation = reservations.find(r => r.id === reservationId);
      if (reservation) {
        await supabase.functions.invoke('telegram-bot', {
          body: {
            action: 'session_completed',
            reservation: {
              ...reservation,
              equipment_name: reservation.equipment?.name
            }
          }
        });
      }

      await loadReservations();
      toast({
        title: "Equipo liberado",
        description: "El equipo está disponible nuevamente",
        variant: "default"
      });
    } catch (error) {
      console.error('Error releasing equipment:', error);
      toast({
        title: "Error",
        description: "No se pudo liberar el equipo",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando Gaming Grid...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-primary/20 p-3 rounded-xl border border-primary/30">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Gaming Grid
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAdminAuthenticated(!isAdminAuthenticated)}
              className="ml-4"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="bg-status-available/10 text-status-available border-status-available/30">
              <div className="w-2 h-2 bg-status-available rounded-full mr-2" />
              {convertEquipmentForGrid().filter(eq => eq.status === 'available').length} Disponibles
            </Badge>
            <Badge variant="outline" className="bg-status-occupied/10 text-status-occupied border-status-occupied/30">
              <div className="w-2 h-2 bg-status-occupied rounded-full mr-2" />
              {convertEquipmentForGrid().filter(eq => eq.status === 'occupied').length} Ocupados
            </Badge>
            <Badge variant="outline" className="bg-status-reserved/10 text-status-reserved border-status-reserved/30">
              <div className="w-2 h-2 bg-status-reserved rounded-full mr-2" />
              {convertEquipmentForGrid().filter(eq => eq.status === 'reserved_confirmed').length} Reservados
            </Badge>
          </div>
        </div>

        {/* Reservation Confirmation */}
        {reservationTicket && (
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-primary mb-2">¡Reserva Creada!</h3>
              <p className="text-lg mb-4">Tu número de ticket es:</p>
              <div className="text-3xl font-bold text-primary bg-background/50 rounded-lg p-4 inline-block">
                {reservationTicket}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Guarda este número. Te avisaremos por Telegram cuando tu reserva esté confirmada.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setReservationTicket(null)}
                className="mt-4"
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="equipos" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Equipos
            </TabsTrigger>
            <TabsTrigger value="reservar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reservar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipos" className="space-y-6">
            <EquipmentGrid 
              equipment={convertEquipmentForGrid()}
              onSelect={handleEquipmentSelect}
              selectedEquipment={selectedEquipment}
              isAdmin={isAdminAuthenticated}
            />
          </TabsContent>

          <TabsContent value="reservar" className="space-y-6">
            <ReservationForm 
              equipment={convertEquipmentForGrid().filter(eq => eq.status === 'available')}
              selectedEquipment={selectedEquipment}
              onSubmit={handleReservationSubmit}
            />
          </TabsContent>
        </Tabs>

        {/* Admin Panel */}
        {isAdminAuthenticated && (
          <div className="p-4 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">Panel de Administración</h3>
            <div className="grid gap-4">
              {reservations.filter(r => r.status !== 'completed' && r.status !== 'cancelled').map(reservation => (
                <Card key={reservation.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{reservation.user_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.equipment?.name} - {reservation.ticket_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reservation.start_time).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {reservation.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleReservationConfirm(reservation.id)}
                          >
                            Confirmar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReservationCancel(reservation.id)}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {reservation.status === 'confirmed' && (
                        <Button 
                          size="sm"
                          onClick={() => handleMarkArrived(reservation.id)}
                        >
                          Marcar Llegada
                        </Button>
                      )}
                      {reservation.status === 'active' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleRelease(reservation.id)}
                        >
                          Finalizar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border/50">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>Telegram: @gaming_grid</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>contacto@gaminggrid.cl</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;