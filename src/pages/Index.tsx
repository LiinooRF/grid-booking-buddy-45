import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EquipmentGrid from "@/components/EquipmentGrid";
import ReservationForm from "@/components/ReservationForm";
import AdminPanel from "@/components/AdminPanel";
import { useToast } from "@/hooks/use-toast";
import { sendTelegramNotification, formatReservationNotification } from "@/lib/timeUtils";
import { supabase } from "@/integrations/supabase/client";
import { Gamepad2, Users, Settings, MessageCircle, Mail, Calendar } from "lucide-react";

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
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<string>('equipos');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [reservationTicket, setReservationTicket] = useState<string | null>(null);

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
          code: eq.id.slice(0, 8), // Primeros 8 chars del UUID como código
          name: eq.name,
          type: (eq.type === 'PS5' || eq.type === 'Xbox') ? 'CONSOLE' : 'PC' as 'PC' | 'CONSOLE',
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

  const handleEquipmentSelect = (equipment: any) => {
    setSelectedEquipment(equipment.code);
    toast({
      title: "Equipo seleccionado",
      description: `${equipment.code} - ${equipment.name}`,
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
    
    // 🆕 NUEVO: Guardar en Supabase
    try {
      // Buscar equipo por código (los primeros 8 chars del ID)
      const selectedEquipment = equipment.find(eq => eq.name === data.equipmentCode);
      
      if (selectedEquipment) {
        // Guardar la reserva en Supabase
        const { error } = await supabase.from('reservations').insert([{
          equipment_id: selectedEquipment.id,
          user_name: data.fullName,
          user_phone: data.phone,
          start_time: `${data.reservationDate}T${data.startTime}:00`,
          end_time: `${data.reservationDate}T${data.endTime}:00`,
          hours: data.hours,
          status: 'pending',
          ticket_number: ticketNumber,
          notes: `Alias: ${data.alias}, Email: ${data.email}`
        }]);
        
        if (error) throw error;
        console.log('✅ Reserva guardada en Supabase');
        
        toast({
          title: "Reserva guardada",
          description: "Tu reserva se ha guardado correctamente",
        });
      }
    } catch (error) {
      console.error('Error guardando en Supabase:', error);
      toast({
        title: "Error",
        description: "Error al guardar la reserva, pero el ticket es válido",
        variant: "destructive"
      });
    }
    
    // Send Telegram notification (usando el bot de Supabase)
    try {
      await supabase.functions.invoke('telegram-bot', {
        body: {
          action: 'new_reservation',
          reservation: {
            ...newReservation,
            equipment_name: data.equipmentCode,
            user_name: data.fullName,
            ticket_number: ticketNumber,
            start_time: `${data.reservationDate}T${data.startTime}:00`,
            end_time: `${data.reservationDate}T${data.endTime}:00`
          }
        }
      });
      
      toast({
        title: "Notificación enviada",
        description: "El administrador ha sido notificado por Telegram",
        variant: "default"
      });
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
      // Fallback al método anterior si falla
      try {
        await sendTelegramNotification(formatReservationNotification(newReservation));
      } catch (fallbackError) {
        console.error("Fallback notification failed:", fallbackError);
      }
    }
    
    setReservations(prev => [...prev, newReservation]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-bg via-background to-gaming-surface">
      {/* Header */}
      <header className="border-b border-gaming-border bg-gaming-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/a5dbcafb-1a7b-407f-af67-eec3222cf045.png" 
                alt="Gaming Grid" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  <span className="text-white">GAMING</span>{' '}
                  <span className="text-primary">GRID</span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">Sistema de Reservas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = 'https://gaminggrid.cl'}
                className="text-sm"
              >
                ← Página Principal
              </Button>
              <div className="hidden md:flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">12PM - 12AM</span>
              </div>
              <Badge variant="outline" className="status-available text-xs">
                {equipment.filter(eq => eq.status === 'available').length} Disponibles
              </Badge>
              <Badge variant="outline" className="status-occupied text-xs">
                {equipment.filter(eq => eq.status === 'occupied').length} Ocupados
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {reservationTicket ? (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="bg-gaming-surface border-gaming-border rounded-lg p-4 md:p-8">
              <div className="text-4xl md:text-6xl mb-4">✓</div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Reserva Enviada</h2>
              <div className="text-lg md:text-xl mb-4">
                Ticket: <span className="font-mono text-primary">{reservationTicket}</span>
              </div>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">
                Tu reserva está en revisión. Tienes 15 minutos para llegar una vez confirmada. El plan final se selecciona en el local y se descuenta del total pagado.
              </p>
              <Button 
                variant="gaming" 
                onClick={() => setReservationTicket(null)}
                className="w-full md:w-auto"
              >
                Hacer Nueva Reserva
              </Button>
            </div>
          </div>
        ) : (
          <Tabs 
            value={currentTab} 
            onValueChange={setCurrentTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gaming-surface border-gaming-border">
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
                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedEquipment('');
                        setCurrentTab('equipos');
                      }}
                    >
                      Cambiar Equipo
                    </Button>
                    <Button 
                      variant="gaming" 
                      size="lg"
                      onClick={() => setCurrentTab("reservar")}
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
                  className="mt-2"
                >
                  ← Volver a Equipos
                </Button>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <ReservationForm
                  equipment={equipment}
                  selectedEquipment={selectedEquipment}
                  onSubmit={handleReservationSubmit}
                />
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
