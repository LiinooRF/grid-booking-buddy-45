import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EquipmentGrid from "@/components/EquipmentGrid";
import ReservationForm from "@/components/ReservationForm";
import AdminPanel from "@/components/AdminPanel";
import { useToast } from "@/hooks/use-toast";
import { sendTelegramNotification, formatReservationNotification } from "@/lib/timeUtils";
import { Gamepad2, Users, Settings, MessageCircle, Mail, Calendar } from "lucide-react";

// Mock data - In real app this would come from API
const mockEquipment = [
  { id: '1', code: 'PC1', type: 'PC' as const, name: 'Gaming PC RTX 5070', status: 'available' as const },
  { id: '2', code: 'PC2', type: 'PC' as const, name: 'Gaming PC RTX 5070', status: 'occupied' as const, occupiedUntil: '15:30', currentPlayer: 'Player01' },
  { id: '3', code: 'PC3', type: 'PC' as const, name: 'Gaming PC RTX 5070', status: 'available' as const },
  { id: '4', code: 'PC4', type: 'PC' as const, name: 'Gaming PC RTX 5070', status: 'reserved_confirmed' as const, occupiedUntil: '16:00', currentPlayer: 'GamerX' },
  { id: '5', code: 'PC5', type: 'PC' as const, name: 'Gaming PC RTX 5070', status: 'available' as const },
  { id: '6', code: 'PC6', type: 'PC' as const, name: 'Gaming PC RTX 5070', status: 'available' as const },
  { id: '7', code: 'CON1', type: 'CONSOLE' as const, name: 'Nintendo Switch', status: 'available' as const },
  { id: '8', code: 'CON2', type: 'CONSOLE' as const, name: 'PlayStation 5', status: 'reserved_pending' as const }
];

// Hourly pricing: 2000 pesos per hour
const HOURLY_RATE = 2000;

interface Reservation {
  id: string;
  fullName: string;
  alias: string;
  phone: string;
  email: string;
  equipmentCode: string;
  hours: number;
  totalPrice: number;
  receiptUrl: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'arrived';
  createdAt: string;
  reservationDate: string;
  startTime?: string;
  endTime?: string;
}

const mockReservations: Reservation[] = [
  {
    id: '1',
    fullName: 'Carlos Mendoza',
    alias: 'ProGamer99',
    phone: '+56 9 8765 4321',
    email: 'carlos@email.com',
    equipmentCode: 'PC2',
    hours: 3,
    totalPrice: 6000,
    receiptUrl: '/lovable-uploads/a5dbcafb-1a7b-407f-af67-eec3222cf045.png',
    status: 'pending',
    createdAt: new Date().toISOString(),
    reservationDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '17:00'
  }
];

const Index = () => {
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [reservations, setReservations] = useState(mockReservations);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [reservationTicket, setReservationTicket] = useState<string | null>(null);

  const handleEquipmentSelect = (equipment: any) => {
    setSelectedEquipment(equipment.code);
    toast({
      title: "Equipo seleccionado",
      description: `${equipment.code} - ${equipment.name}`,
      variant: "default"
    });
  };

  const handleReservationSubmit = async (data: any) => {
    // Simulate API call
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
      totalPrice: data.hours * HOURLY_RATE,
      receiptUrl: URL.createObjectURL(data.receipt),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      reservationDate: data.reservationDate,
      startTime: data.startTime,
      endTime: data.endTime
    };
    
    // Send Telegram notification
    try {
      await sendTelegramNotification(formatReservationNotification(newReservation));
      toast({
        title: "Notificación enviada",
        description: "El administrador ha sido notificado por Telegram",
        variant: "default"
      });
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
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

  const handleReservationConfirm = (id: string) => {
    setReservations(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'confirmed' as const } : r)
    );
  };

  const handleReservationCancel = (id: string) => {
    setReservations(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r)
    );
  };

  const handleMarkArrived = (id: string) => {
    setReservations(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'arrived' as const } : r)
    );
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
            hours: newHours,
            totalPrice: newHours * HOURLY_RATE
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
              <div className="hidden md:flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">12PM - 12AM</span>
              </div>
              <Badge variant="outline" className="status-available text-xs">
                {mockEquipment.filter(eq => eq.status === 'available').length} Disponibles
              </Badge>
              <Badge variant="outline" className="status-occupied text-xs">
                {mockEquipment.filter(eq => eq.status === 'occupied').length} Ocupados
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
          <Tabs defaultValue="equipos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gaming-surface border-gaming-border">
              <TabsTrigger value="equipos" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Equipos
              </TabsTrigger>
              <TabsTrigger value="reservar" className="flex items-center gap-2">
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
              
              <EquipmentGrid
                equipment={mockEquipment}
                onSelect={handleEquipmentSelect}
                selectedEquipment={selectedEquipment}
              />
              
              {selectedEquipment && (
                <div className="text-center">
                  <Button variant="gaming" size="lg" onClick={() => {
                    const reservarTab = document.querySelector('[data-state="inactive"][value="reservar"]') as HTMLElement;
                    if (reservarTab) {
                      reservarTab.click();
                    } else {
                      // Fallback: trigger tab change via state
                      const tabsContainer = document.querySelector('[role="tablist"]');
                      const reservarButton = tabsContainer?.querySelector('[value="reservar"]') as HTMLElement;
                      reservarButton?.click();
                    }
                  }}>
                    Continuar con Reserva
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reservar" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-primary">Nueva Reserva</h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Reserva por horas (2.000 CLP/hora) - Horario: 12PM - 12AM
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <ReservationForm
                  equipment={mockEquipment}
                  selectedEquipment={selectedEquipment}
                  onSubmit={handleReservationSubmit}
                  hourlyRate={HOURLY_RATE}
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
                hourlyRate={HOURLY_RATE}
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
              Gaming Grid - Avenida Francisco Bilbao 1449, Providencia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
