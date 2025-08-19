import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Settings, Calendar, Package, Coffee, Gamepad2, Zap, Trophy, Wifi, Star, MapPin, Phone, MessageCircle, Shield, Cpu } from "lucide-react";
import EquipmentGrid from "@/components/EquipmentGrid";
import ReservationForm from "@/components/ReservationForm";
import AdminPanel from "@/components/AdminPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Service plans (for local reference - no payments in reservation)
const servicePlans = {
  "Planes de Horas": [
    { name: "Starter Boost", price: 15000, includes: "5 Hours" },
    { name: "XP Pack", price: 26000, includes: "10 Hours" },
    { name: "Level Up", price: 50000, includes: "20 Hours" },
    { name: "Elite Pass", price: 90000, includes: "50 Hours" }
  ],
  "Combos": [
    { name: "Gamer Snack Pack", price: 7000, includes: "1 Hour + Snack + Drink/Coffee" },
    { name: "Power Fuel", price: 12000, includes: "2 Hours + Energy Drink + Sandwich" },
    { name: "All Night Pack", price: 25000, includes: "5 Hours + 2 Drinks + Pizza" }
  ],
  "Adicionales": [
    { name: "Energy Drink", price: 2500, includes: "Monster, Red Bull, etc." },
    { name: "Sandwich/Wrap", price: 4000, includes: "Varios sabores" },
    { name: "Pizza Personal", price: 6000, includes: "Pepperoni, Hawaiana" },
    { name: "Café Premium", price: 2000, includes: "Espresso, Americano, Latte" }
  ]
};

// Mock equipment data
const mockEquipment = [
  { id: '1', code: 'PC-001', type: 'PC' as const, name: 'CYBER STATION ALPHA', status: 'available' as const },
  { id: '2', code: 'PC-002', type: 'PC' as const, name: 'CYBER STATION BETA', status: 'occupied' as const, occupiedUntil: '15:30', currentPlayer: 'NEXUS_01' },
  { id: '3', code: 'PC-003', type: 'PC' as const, name: 'CYBER STATION GAMMA', status: 'available' as const },
  { id: '4', code: 'PC-004', type: 'PC' as const, name: 'CYBER STATION DELTA', status: 'reserved_confirmed' as const, occupiedUntil: '16:00', currentPlayer: 'MATRIX_X' },
  { id: '5', code: 'PC-005', type: 'PC' as const, name: 'CYBER STATION EPSILON', status: 'available' as const },
  { id: '6', code: 'PC-006', type: 'PC' as const, name: 'CYBER STATION ZETA', status: 'available' as const },
  { id: '7', code: 'CON-001', type: 'CONSOLE' as const, name: 'NINTENDO SWITCH DOCK', status: 'available' as const },
  { id: '8', code: 'CON-002', type: 'CONSOLE' as const, name: 'PLAYSTATION 5 NODE', status: 'reserved_pending' as const }
];

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

const Index = () => {
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationTicket, setReservationTicket] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("equipment");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleEquipmentSelect = (equipment: any) => {
    setSelectedEquipment(equipment.code);
    toast({
      title: "ESTACIÓN SELECCIONADA",
      description: `${equipment.code} - ${equipment.name}`,
      variant: "default"
    });
  };

  const handleReservationSubmit = async (data: any) => {
    const ticketNumber = `CG${Date.now().toString().slice(-6)}`;
    setReservationTicket(ticketNumber);
    
    const newReservation: Reservation = {
      id: Date.now().toString(),
      fullName: data.fullName,
      alias: data.alias,
      phone: data.phone,
      email: data.email,
      equipmentCode: data.equipmentCode,
      hours: data.hours,
      totalPrice: 0,
      receiptUrl: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      reservationDate: data.reservationDate,
      startTime: data.startTime,
      endTime: data.endTime
    };
    
    setReservations(prev => [...prev, newReservation]);
    setSelectedEquipment('');
    
    toast({
      title: "RESERVA PROCESADA",
      description: "Tu reserva ha sido enviada para confirmación",
      variant: "default"
    });
  };

  const handleAdminLogin = (password: string) => {
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

  const handleConfirmReservation = (id: string) => {
    setReservations(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'confirmed' as const } : r
    ));
    toast({
      title: "Reserva confirmada",
      description: "La reserva ha sido confirmada exitosamente",
      variant: "default"
    });
  };

  const handleCancelReservation = (id: string) => {
    setReservations(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'cancelled' as const } : r
    ));
    toast({
      title: "Reserva cancelada",
      description: "La reserva ha sido cancelada",
      variant: "destructive"
    });
  };

  const handleMarkArrived = (id: string) => {
    setReservations(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'arrived' as const } : r
    ));
    toast({
      title: "Cliente llegó",
      description: "El estado ha sido actualizado",
      variant: "default"
    });
  };

  const handleRelease = (id: string) => {
    // Logic to release equipment
    toast({
      title: "Equipo liberado",
      description: "El equipo ha sido liberado",
      variant: "default"
    });
  };

  const handleExtendTime = (id: string, minutes: number) => {
    // Logic to extend time
    toast({
      title: "Tiempo extendido",
      description: `Se han agregado ${minutes} minutos`,
      variant: "default"
    });
  };

  const handleChangeHours = (reservationId: string, newHours: number) => {
    setReservations(prev => prev.map(r => 
      r.id === reservationId ? { ...r, hours: newHours } : r
    ));
    toast({
      title: "Horas actualizadas",
      description: "Las horas de la reserva han sido modificadas",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground scanlines">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-cyber-border bg-cyber-surface/95 backdrop-blur cyber-border">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src="/lovable-uploads/a5dbcafb-1a7b-407f-af67-eec3222cf045.png" 
                alt="Gaming Grid Logo" 
                className="h-10 w-auto cyber-glow"
              />
              <div className="absolute inset-0 bg-primary/20 blur-sm -z-10"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary tracking-wider font-mono">
                CYBER GRID
              </h1>
              <div className="operating-hours text-cyber-accent">
                <Clock className="h-4 w-4" />
                <span className="text-xs">ONLINE: 12PM - 12AM</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="cyber-button">
                  <Shield className="h-4 w-4 mr-2" />
                  ADMIN
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto cyber-border">
                <DialogHeader>
                  <DialogTitle className="text-primary font-mono tracking-wider">
                    CONTROL PANEL
                  </DialogTitle>
                </DialogHeader>
                <AdminPanel 
                  reservations={reservations}
                  onConfirm={handleConfirmReservation}
                  onCancel={handleCancelReservation}
                  onMarkArrived={handleMarkArrived}
                  onRelease={handleRelease}
                  onExtendTime={handleExtendTime}
                  onLogin={handleAdminLogin}
                  isAuthenticated={isAdminAuthenticated}
                  onChangeHours={handleChangeHours}
                  hourlyRate={2000}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-screen-2xl">
        <div className="grid gap-8">
          {/* Welcome Section */}
          <section className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-primary mb-4 font-mono tracking-wider">
              BIENVENIDO AL CYBER GRID
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-mono">
              El cyber café más avanzado de Santiago. Hardware de elite, 
              conexión ultra rápida y el ambiente perfecto para gamers.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="flex items-center gap-2 cyber-glow font-mono">
                <Zap className="h-4 w-4" />
                RTX 4070 SUPER
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 cyber-glow font-mono">
                <Cpu className="h-4 w-4" />
                INTEL CORE I7
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 cyber-glow font-mono">
                <Wifi className="h-4 w-4" />
                FIBRA ÓPTICA 1GB
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 cyber-glow font-mono">
                <Trophy className="h-4 w-4" />
                MONITORES 144HZ
              </Badge>
            </div>
          </section>

          {/* Main Content with Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="equipment" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Equipos
              </TabsTrigger>
              <TabsTrigger value="reservation" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Reservar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="equipment" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Gamepad2 className="h-5 w-5" />
                        ESTACIONES DISPONIBLES
                      </CardTitle>
                      <CardDescription>
                        Hardware de elite con las últimas especificaciones
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EquipmentGrid 
                        equipment={mockEquipment}
                        onSelect={handleEquipmentSelect}
                        selectedEquipment={selectedEquipment}
                      />
                      {selectedEquipment && (
                        <div className="mt-6 text-center">
                          <Button 
                            onClick={() => setActiveTab("reservation")}
                            size="lg"
                            className="animate-pulse"
                          >
                            CONTINUAR CON LA RESERVA
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  {/* Service Plans */}

                  {/* Service Plans */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Package className="h-5 w-5" />
                        PLANES DISPONIBLES
                      </CardTitle>
                      <CardDescription>
                        Precios de referencia - se eligen en el local
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-sm">
                        <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                          <p className="text-primary font-medium mb-2">⚡ SISTEMA DE RESERVAS:</p>
                          <ul className="text-muted-foreground space-y-1 text-xs">
                            <li>• Reservas gratuitas para asegurar tu lugar</li>
                            <li>• Los planes se eligen al llegar al local</li>
                            <li>• No se realizan pagos online</li>
                            <li>• Límite de 15 minutos para llegar</li>
                          </ul>
                        </div>
                        
                        <Tabs defaultValue="Planes de Horas" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="Planes de Horas" className="text-xs">HORAS</TabsTrigger>
                            <TabsTrigger value="Combos" className="text-xs">COMBOS</TabsTrigger>
                            <TabsTrigger value="Adicionales" className="text-xs">EXTRAS</TabsTrigger>
                          </TabsList>
                          
                          {Object.entries(servicePlans).map(([category, plans]) => (
                            <TabsContent key={category} value={category} className="space-y-3">
                              {plans.map((plan, index) => (
                                <div key={index} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-card/20">
                                  <div>
                                    <p className="font-medium text-sm">{plan.name}</p>
                                    <p className="text-xs text-muted-foreground">{plan.includes}</p>
                                  </div>
                                  <Badge variant="outline" className="text-primary">
                                    ${plan.price.toLocaleString()}
                                  </Badge>
                                </div>
                              ))}
                            </TabsContent>
                          ))}
                        </Tabs>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reservation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Calendar className="h-5 w-5" />
                    RESERVAR ESTACIÓN
                  </CardTitle>
                  <CardDescription>
                    Asegura tu lugar en el cyber
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReservationForm 
                    equipment={mockEquipment}
                    selectedEquipment={selectedEquipment}
                    onSubmit={handleReservationSubmit}
                    hourlyRate={2000}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer with Contact */}
        <div className="mt-16 pt-8 border-t border-cyber-border/40">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2 font-mono tracking-wider">
                <Star className="h-5 w-5" />
                ¿NECESITAS AYUDA?
              </h3>
              <p className="text-muted-foreground text-sm font-mono">
                ¿Tienes dudas sobre nuestros servicios o necesitas ayuda con tu reserva? 
                Contáctanos y te ayudaremos de inmediato.
              </p>
            </div>
            
            <div className="space-y-3">
              <a 
                href="https://wa.me/56978414767" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-success/30 bg-success/5 hover:bg-success/10 transition-colors group cyber-border"
              >
                <MessageCircle className="h-5 w-5 text-success group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-success font-mono">WHATSAPP</p>
                  <p className="text-sm text-muted-foreground font-mono">+56 9 7841 4767</p>
                </div>
              </a>
              
              <a 
                href="mailto:TheGridChile@gmail.com"
                className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group cyber-border"
              >
                <Phone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-medium text-primary font-mono">EMAIL</p>
                  <p className="text-sm text-muted-foreground font-mono">TheGridChile@gmail.com</p>
                </div>
              </a>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              CYBER GRID - Antonio Varas 1347, LOCAL 106, Providencia.
            </p>
          </div>
        </div>
      </main>

      {/* Reservation Success Modal */}
      {reservationTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full cyber-border p-6 text-center space-y-4">
            <div className="text-4xl cyber-glow">⚡</div>
            <h2 className="text-2xl font-bold text-primary font-mono tracking-wider">
              RESERVA PROCESADA
            </h2>
            <div className="text-lg font-mono">
              TICKET: <span className="text-primary cyber-glow">{reservationTicket}</span>
            </div>
            <p className="text-muted-foreground text-sm font-mono">
              Tu reserva está en proceso. Serás contactado para confirmación.
            </p>
            <Button 
              onClick={() => setReservationTicket(null)}
              className="cyber-button w-full font-mono"
            >
              NUEVA RESERVA
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;