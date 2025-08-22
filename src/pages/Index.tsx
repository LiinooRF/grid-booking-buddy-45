import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EquipmentGrid from "@/components/EquipmentGrid";
import ReservationForm from "@/components/ReservationForm";
import AdminPanel from "@/components/AdminPanel";
import ClosedPlatform from "@/components/ClosedPlatform";
import { useToast } from "@/hooks/use-toast";
import { useClosedDays } from "@/hooks/useClosedDays";
import { sendTelegramNotification, formatReservationNotification } from "@/lib/timeUtils";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Users, Settings, MessageCircle, Mail, Calendar } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SiteHeader from "@/components/SiteHeader";

// 🆕 REAL: Cargar equipos desde Supabase
interface Equipment {
  id: string;
  code: string;
  name: string;
  type: 'PC' | 'CONSOLE';
  status: 'available' | 'occupied' | 'reserved_confirmed' | 'reserved_pending';
  description?: string;
  occupiedUntil?: string;
  currentPlayer?: string;
}

interface Reservation {
  id: string;
  fullName: string;
  alias: string;
  phone: string;
  email: string;
  equipmentCode: string;
  hours: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'arrived';
  createdAt: string;
  reservationDate: string;
  startTime?: string;
  endTime?: string;
}

const Index = () => {
  const { toast } = useToast();
  const { isClosedToday, closedReason, loading: closedLoading } = useClosedDays();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<string>('equipos');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [reservationTicket, setReservationTicket] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdminAccess, setShowAdminAccess] = useState(false);

  // Cargar reservas desde Supabase
  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          user_name,
          user_phone,
          equipment_id,
          start_time,
          end_time,
          hours,
          status,
          ticket_number,
          notes,
          created_at,
          equipment:equipment_id (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Mapear a formato del frontend
      const mappedReservations: Reservation[] = data.map(r => ({
        id: r.id,
        fullName: r.user_name,
        alias: r.notes?.includes('Alias:') ? r.notes.split('Alias: ')[1]?.split(',')[0] || 'N/A' : 'N/A',
        phone: r.user_phone,
        email: r.notes?.includes('Email:') ? r.notes.split('Email: ')[1] || 'N/A' : 'N/A',
        equipmentCode: (r.equipment as any)?.name || `EQ-${r.equipment_id.slice(0, 8)}`,
        hours: r.hours,
        status: r.status as 'pending' | 'confirmed' | 'cancelled' | 'arrived',
        createdAt: r.created_at,
        reservationDate: r.start_time?.split('T')[0] || new Date().toISOString().split('T')[0],
        startTime: r.start_time?.split('T')[1]?.slice(0, 5),
        endTime: r.end_time?.split('T')[1]?.slice(0, 5)
      }));
      
      setReservations(mappedReservations);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive"
      });
    }
  };

  // Cargar equipos y reservas al inicio
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .order('created_at');
        
        if (error) throw error;
        
        // Mapear a formato del frontend
        const mappedEquipment: Equipment[] = data.map(eq => ({
          id: eq.id,
          code: eq.name, // Usar el nombre como código visible
          name: eq.name,
          type: (eq.type === 'CONSOLE') ? 'CONSOLE' : 'PC',
          status: eq.status === 'available' ? 'available' : 
                 eq.status === 'occupied' ? 'occupied' : 'available',
          description: eq.description || undefined
        }));
        
        setEquipment(mappedEquipment);
      } catch (error) {
        console.error('Error cargando equipos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los equipos",
          variant: "destructive"
        });
      } finally {
        setLoadingEquipment(false);
      }
    };

    loadEquipment();
    loadReservations();
  }, []);

  // Suscripción en tiempo real a reservas para actualizar el panel al instante
  useEffect(() => {
    const channel = supabase
      .channel('reservations-panel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, async () => {
        await loadReservations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fallback: refresco periódico por si Realtime no está disponible
  useEffect(() => {
    const interval = setInterval(() => {
      loadReservations();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleEquipmentSelect = (equipment: any) => {
    setSelectedEquipment(equipment.name);
    toast({
      title: "Equipo seleccionado",
      description: `${equipment.name} - ${equipment.name}`,
      variant: "default"
    });
  };

  const handleReservationSubmit = async (data: any) => {
    const ticketNumber = `GG${Date.now().toString().slice(-6)}`;
    setReservationTicket(ticketNumber);
    
    const newReservation = {
      id: Date.now().toString(),
      fullName: data.fullName,
      alias: data.alias,
      phone: data.phone,
      email: data.email,
      equipmentCode: data.equipmentCode,
      hours: data.hours,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      reservationDate: data.reservationDate,
      startTime: data.startTime,
      endTime: data.endTime
    };
    
    // 🆕 NUEVO: Guardar en Supabase - SIMPLIFICADO PARA DEBUGAR
    try {
      console.log('🔍 Iniciando guardado - datos completos:', {
        equipmentCode: data.equipmentCode,
        formData: data
      });

      // Buscar equipo por código (los primeros 8 chars del ID)
      const foundEquipment = equipment.find(eq => eq.name === data.equipmentCode);
      console.log('🎯 Equipo encontrado:', foundEquipment);
      
      if (!foundEquipment) {
        throw new Error('No se encontró el equipo seleccionado');
      }

      // Calcular end_time correctamente sumando las horas
      const startDateTime = new Date(`${data.reservationDate}T${data.startTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + (data.hours * 60 * 60 * 1000));
      
      const reservationData = {
        equipment_id: foundEquipment.id,
        user_name: data.fullName,
        user_phone: data.phone,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        hours: data.hours,
        status: 'pending',
        ticket_number: ticketNumber,
        notes: `Alias: ${data.alias}, Email: ${data.email}`
      };

      console.log('📤 Enviando a Supabase:', reservationData);

      const { data: insertedData, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select();

      console.log('📥 Respuesta de Supabase:', { data: insertedData, error });

      if (error) {
        console.error('❌ Error detallado de Supabase:', error);
        throw error;
      }

      console.log('✅ Reserva guardada exitosamente:', insertedData);
        
      toast({
        title: "Reserva guardada",
        description: "Tu reserva se ha guardado correctamente",
      });
    } catch (error) {
      console.error('Error guardando en Supabase:', error);
      
      // Check if it's an overlap error
      const errorMessage = error?.message || '';
      if (errorMessage.includes('OVERLAP_CONFLICT') || errorMessage.includes('se solapa')) {
        toast({
          title: "Horario no disponible",
          description: "Ya existe una reserva para este horario. Por favor selecciona otro horario.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Error",
        description: "Error al guardar la reserva, pero el ticket es válido",
        variant: "destructive"
      });
      return;
    }
    
    // Send Telegram notification (usando el edge function de Supabase)
    try {
      const { data: telegramData, error: telegramError } = await supabase.functions.invoke('telegram-bot', {
        body: {
          action: 'new_reservation',
          adminChatId: '-4947999909',
          reservation: {
            ...newReservation,
            equipment_name: data.equipmentCode,
            user_name: data.fullName,
            ticket_number: ticketNumber,
            // Usar el mismo cálculo LOCAL -> UTC que la inserción
            start_time: new Date(`${data.reservationDate}T${data.startTime}:00`).toISOString(),
            end_time: (() => {
              const start = new Date(`${data.reservationDate}T${data.startTime}:00`);
              const end = new Date(`${data.reservationDate}T${data.endTime}:00`);
              if (end <= start) end.setDate(end.getDate() + 1);
              return end.toISOString();
            })(),
            user_phone: data.phone,
            hours: data.hours
          }
        }
      });

      if (telegramError) {
        console.error('Error notificación Telegram:', telegramError);
        toast({
          title: "Error en notificación",
          description: "La reserva se guardó pero no se pudo enviar la notificación",
          variant: "destructive"
        });
      } else {
        console.log('✅ Notificación Telegram enviada:', telegramData);
        toast({
          title: "Notificación enviada",
          description: "El administrador ha sido notificado por Telegram",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
      toast({
        title: "Error en notificación",
        description: "La reserva se guardó pero no se pudo enviar la notificación",
        variant: "destructive"
      });
    }
    
    // Actualizar lista desde Supabase para asegurar IDs válidos
    await loadReservations();
    setSelectedEquipment('');
  };

  const handleAdminLogin = (password: string) => {
    // Simple password check - in real app this would be secure
    if (password === 'admin123') {
      setIsAdminAuthenticated(true);
      toast({
        title: "Acceso concedido",
        description: "Bienvenido al panel de administración",
        variant: "default"
      });
    } else {
      toast({
        title: "Acceso denegado",
        description: "Contraseña incorrecta",
        variant: "destructive"
      });
    }
  };

  const handleReservationConfirm = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', id);
      
      if (error) throw error;
      
      setReservations(prev => 
        prev.map(r => r.id === id ? { ...r, status: 'confirmed' as const } : r)
      );
      
      toast({
        title: "Reserva confirmada",
        description: "La reserva ha sido confirmada exitosamente",
      });
    } catch (error) {
      console.error('Error confirmando reserva:', error);
      toast({
        title: "Error",
        description: "No se pudo confirmar la reserva",
        variant: "destructive"
      });
    }
  };

  const handleReservationCancel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
      
      setReservations(prev => 
        prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r)
      );
      
      toast({
        title: "Reserva cancelada",
        description: "La reserva ha sido cancelada",
      });
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva",
        variant: "destructive"
      });
    }
  };

  const handleMarkArrived = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'arrived' })
        .eq('id', id);
      
      if (error) throw error;
      
      setReservations(prev => 
        prev.map(r => r.id === id ? { ...r, status: 'arrived' as const } : r)
      );
      
      toast({
        title: "Cliente marcado como llegado",
        description: "El estado ha sido actualizado",
      });
    } catch (error) {
      console.error('Error marcando llegada:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la llegada",
        variant: "destructive"
      });
    }
  };

  const handleRelease = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Equipo liberado",
      description: "El equipo ha sido liberado y está disponible",
      variant: "default"
    });
  };

  const handleExtendTime = (id: string, minutes: number) => {
    const hours = Math.floor(minutes / 60);
    setReservations(prev => 
      prev.map(r => {
        if (r.id === id && r.endTime) {
          const [endHours, endMins] = r.endTime.split(':').map(Number);
          const endDate = new Date();
          endDate.setHours(endHours, endMins, 0, 0);
          endDate.setMinutes(endDate.getMinutes() + minutes);
          
          const newEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
          return { ...r, endTime: newEndTime };
        }
        return r;
      })
    );
    
    toast({
      title: "Tiempo extendido",
      description: `${hours} ${hours === 1 ? 'hora añadida' : 'horas añadidas'}`,
      variant: "default"
    });
  };

  const handleChangeHours = (reservationId: string, newHours: number) => {
    setReservations(prev => 
      prev.map(r => {
        if (r.id === reservationId) {
          return {
            ...r,
            hours: newHours
          };
        }
        return r;
      })
    );

    toast({
      title: "Horas actualizadas",
      description: `Reserva actualizada a ${newHours} ${newHours === 1 ? 'hora' : 'horas'}`,
      variant: "default"
    });
  };

  // Funciones para manejo de mantenimiento y días cerrados
  const handleToggleMaintenance = async (equipmentId: string, maintenanceMode: boolean, reason?: string) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .update({ 
          maintenance_mode: maintenanceMode,
          maintenance_reason: reason || null
        })
        .eq('id', equipmentId);
      
      if (error) throw error;
      
      // Actualizar estado local
      setEquipment(prev => 
        prev.map(eq => 
          eq.id === equipmentId 
            ? { ...eq, status: maintenanceMode ? 'occupied' : 'available' }
            : eq
        )
      );
      
      toast({
        title: maintenanceMode ? "Mantenimiento activado" : "Mantenimiento desactivado",
        description: maintenanceMode 
          ? `Equipo en mantenimiento: ${reason}` 
          : "Equipo disponible nuevamente",
        variant: "default"
      });
    } catch (error) {
      console.error('Error toggling maintenance:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de mantenimiento",
        variant: "destructive"
      });
    }
  };

  const handleAddClosedDay = async (date: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('closed_days')
        .insert({ date, reason });
      
      if (error) throw error;
      
      toast({
        title: "Día cerrado agregado",
        description: `Fecha ${date} marcada como cerrada`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error adding closed day:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el día cerrado",
        variant: "destructive"
      });
    }
  };

  const handleRemoveClosedDay = async (id: string) => {
    try {
      const { error } = await supabase
        .from('closed_days')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Día cerrado removido",
        description: "La fecha está disponible nuevamente",
        variant: "default"
      });
    } catch (error) {
      console.error('Error removing closed day:', error);
      toast({
        title: "Error",
        description: "No se pudo remover el día cerrado",
        variant: "destructive"
      });
    }
  };

  // Función para buscar reservas por email
  const handleSearchReservations = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa tu email para buscar reservas",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          user_name,
          user_phone,
          equipment_id,
          start_time,
          end_time,
          hours,
          status,
          ticket_number,
          notes,
          created_at,
          equipment:equipment_id (name)
        `)
        .ilike('notes', `%${searchEmail}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedReservations: Reservation[] = data.map(r => ({
        id: r.id,
        fullName: r.user_name,
        alias: r.notes?.includes('Alias:') ? r.notes.split('Alias: ')[1]?.split(',')[0] || 'N/A' : 'N/A',
        phone: r.user_phone,
        email: r.notes?.includes('Email:') ? r.notes.split('Email: ')[1] || 'N/A' : 'N/A',
        equipmentCode: (r.equipment as any)?.name || `EQ-${r.equipment_id.slice(0, 8)}`,
        hours: r.hours,
        status: r.status as 'pending' | 'confirmed' | 'cancelled' | 'arrived',
        createdAt: r.created_at,
        reservationDate: r.start_time?.split('T')[0] || new Date().toISOString().split('T')[0],
        startTime: r.start_time?.split('T')[1]?.slice(0, 5),
        endTime: r.end_time?.split('T')[1]?.slice(0, 5)
      }));

      setUserReservations(mappedReservations);
      
      if (mappedReservations.length === 0) {
        toast({
          title: "No se encontraron reservas",
          description: "No hay reservas asociadas a este email",
          variant: "default"
        });
      } else {
        toast({
          title: "Reservas encontradas",
          description: `Se encontraron ${mappedReservations.length} reserva(s)`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error buscando reservas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Si está cargando la verificación de días cerrados, mostrar loading
  if (closedLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gaming-surface to-gaming-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Verificando disponibilidad...</p>
        </div>
      </div>
    );
  }

  // Si la plataforma está cerrada hoy, mostrar pantalla de cierre pero mantener acceso admin
  if (isClosedToday) {
    return (
      <div>
        <ClosedPlatform reason={closedReason} />
        
        {/* Admin Panel - Acceso discreto incluso cuando está cerrado */}
        <div className="fixed bottom-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdminAccess(!showAdminAccess)}
            className="opacity-30 hover:opacity-100 transition-opacity"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Hidden Admin Panel */}
        {showAdminAccess && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gaming-surface border-gaming-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary">Panel de Administración</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdminAccess(false)}
                  >
                    ✕
                  </Button>
                </div>
                <AdminPanel
                  reservations={reservations}
                  onConfirm={handleReservationConfirm}
                  onCancel={handleReservationCancel}
                  onMarkArrived={handleMarkArrived}
                  onRelease={handleRelease}
                  onExtendTime={handleExtendTime}
                  onLogin={handleAdminLogin}
                  isAuthenticated={isAdminAuthenticated}
                  onChangeHours={handleChangeHours}
                  equipment={equipment}
                  onToggleMaintenance={handleToggleMaintenance}
                  onAddClosedDay={handleAddClosedDay}
                  onRemoveClosedDay={handleRemoveClosedDay}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-bg via-background to-gaming-surface">
      {/* Header */}
      <SiteHeader current="reservas" />

      <main className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {reservationTicket ? (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="bg-gaming-surface border-gaming-border rounded-lg p-4 md:p-8">
              <div className="text-4xl md:text-6xl mb-4">✓</div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Reserva Enviada</h2>
              <div className="text-lg md:text-xl mb-4">
                Ticket: <span className="font-mono text-primary">{reservationTicket}</span>
              </div>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                Tu reserva está en revisión. Tienes 15 minutos para llegar una vez confirmada.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-blue-200 text-sm md:text-base">
                  💡 <strong>Importante:</strong> Revisa el estado de tu reserva en la sección "Estado" para ver si fue confirmada y poder presentarte en el local.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentTab('estado');
                    setReservationTicket(null);
                  }}
                  className="w-full sm:w-auto text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
                >
                  Ver Estado de Reserva
                </Button>
                <Button 
                  variant="gaming" 
                  onClick={() => setReservationTicket(null)}
                  className="w-full sm:w-auto text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
                >
                  Hacer Nueva Reserva
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Tabs 
            value={currentTab} 
            onValueChange={setCurrentTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 bg-gaming-surface border-gaming-border">
              <TabsTrigger value="equipos" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Equipos
              </TabsTrigger>
              <TabsTrigger 
                value="reservar" 
                className="flex items-center gap-2"
                disabled={!selectedEquipment}
              >
                <Users className="h-4 w-4" />
                Reservar
              </TabsTrigger>
              <TabsTrigger value="estado" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Estado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="equipos" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-primary">Estado de Equipos</h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Selecciona un equipo disponible para hacer tu reserva
                </p>
              </div>
              
              {loadingEquipment ? (
                <div className="text-center py-8">Cargando equipos...</div>
              ) : (
                <EquipmentGrid
                  equipment={equipment}
                  onSelect={handleEquipmentSelect}
                  selectedEquipment={selectedEquipment}
                />
              )}
              
              {selectedEquipment && (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-sm text-muted-foreground mb-2">
                      Equipo seleccionado: <span className="font-medium text-primary">{selectedEquipment}</span>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedEquipment('');
                        setCurrentTab('equipos');
                      }}
                      className="w-full sm:w-auto text-sm"
                    >
                      Cambiar Equipo
                    </Button>
                    <Button 
                      variant="gaming" 
                      size="lg"
                      onClick={() => setCurrentTab("reservar")}
                      className="w-full sm:w-auto"
                    >
                      Continuar con Reserva
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reservar" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-primary">Nueva Reserva</h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  ¡Reserva GRATIS! - Horario: 12PM - 12AM
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedEquipment('');
                    setCurrentTab('equipos');
                  }}
                  className="mt-2 text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 h-8 md:h-9"
                >
                  <span className="hidden md:inline">← Volver a Equipos</span>
                  <span className="md:hidden">← Volver</span>
                </Button>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <ErrorBoundary fallback={<div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">No se pudo cargar el formulario de reserva. Intenta volver a la pestaña "Equipos" y reintentar.</div>}>
                  <ReservationForm
                    key={`${selectedEquipment}-${reservations.length}`}
                    equipment={equipment}
                    selectedEquipment={selectedEquipment}
                    onSubmit={handleReservationSubmit}
                    existingReservations={reservations}
                  />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="estado" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-primary">Estado de tu Reserva</h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Consulta el estado de tu reserva usando tu email
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <Card className="bg-gaming-surface border-gaming-border">
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Buscar Reserva
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                       <div className="space-y-2">
                         <label htmlFor="searchEmail" className="text-sm font-medium">Email</label>
                         <input
                           id="searchEmail"
                           type="email"
                           value={searchEmail}
                           onChange={(e) => setSearchEmail(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && handleSearchReservations()}
                           placeholder="tu@email.com"
                           className="w-full px-3 py-2 border border-gaming-border rounded-md bg-background"
                         />
                       </div>
                     </div>
                     <Button 
                       variant="gaming" 
                       className="w-full md:w-auto"
                       onClick={handleSearchReservations}
                       disabled={isSearching}
                     >
                       {isSearching ? 'Buscando...' : 'Buscar Reserva'}
                     </Button>
                  </CardContent>
                </Card>

                {/* Mostrar resultados de búsqueda */}
                {userReservations.length > 0 && (
                  <Card className="bg-gaming-surface border-gaming-border mt-6">
                    <CardHeader>
                      <CardTitle className="text-primary">Tus Reservas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userReservations.map((reservation) => (
                          <div key={reservation.id} className="border border-gaming-border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{reservation.equipmentCode}</span>
                                  <Badge 
                                    variant={
                                      reservation.status === 'confirmed' ? 'default' :
                                      reservation.status === 'arrived' ? 'secondary' :
                                      reservation.status === 'pending' ? 'outline' : 'destructive'
                                    }
                                  >
                                    {reservation.status === 'pending' && '⏳ Pendiente'}
                                    {reservation.status === 'confirmed' && '✅ Confirmada'}
                                    {reservation.status === 'arrived' && '🎮 Activa'}
                                    {reservation.status === 'cancelled' && '❌ Cancelada'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <div>📅 {reservation.reservationDate}</div>
                                  {reservation.startTime && reservation.endTime && (
                                    <div>🕐 {reservation.startTime} - {reservation.endTime} ({reservation.hours}h)</div>
                                  )}
                                  <div>👤 {reservation.fullName} ({reservation.alias})</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">
                                  Creada: {new Date(reservation.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Información de estados */}
                <Card className="bg-primary/5 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-primary">Estados de Reserva</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Pendiente:</span>
                      <span className="text-muted-foreground">Reserva enviada, esperando confirmación del admin</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Confirmada:</span>
                      <span className="text-muted-foreground">Reserva aprobada, puedes presentarte en el local</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">Activa:</span>
                      <span className="text-muted-foreground">Sesión iniciada, jugando actualmente</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">Cancelada:</span>
                      <span className="text-muted-foreground">Reserva cancelada por el admin o por no presentarse</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}


        {/* Admin Panel - Discrete Access */}
        <div className="fixed bottom-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const adminPanel = document.getElementById('admin-panel');
              if (adminPanel) {
                adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
              }
            }}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Hidden Admin Panel */}
        <div id="admin-panel" style={{ display: 'none' }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gaming-surface border-gaming-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">Panel de Administración</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    document.getElementById('admin-panel')!.style.display = 'none';
                  }}
                >
                  ✕
                </Button>
              </div>
              <AdminPanel
                reservations={reservations}
                onConfirm={handleReservationConfirm}
                onCancel={handleReservationCancel}
                onMarkArrived={handleMarkArrived}
                onRelease={handleRelease}
                onExtendTime={handleExtendTime}
                onLogin={handleAdminLogin}
                isAuthenticated={isAdminAuthenticated}
                onChangeHours={handleChangeHours}
                equipment={equipment}
                onToggleMaintenance={handleToggleMaintenance}
                onAddClosedDay={handleAddClosedDay}
                onRemoveClosedDay={handleRemoveClosedDay}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gaming-border bg-gaming-surface/30 mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-primary">¿Necesitas ayuda?</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
              <a 
                href="https://wa.me/56978414767" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp: +56 9 7841 4767</span>
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a 
                href="mailto:TheGridChile@gmail.com"
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>TheGridChile@gmail.com</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Gaming Grid - Antonio Varas 1347, LOCAL 106, Providencia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
