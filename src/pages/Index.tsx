import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EquipmentGrid from "@/components/EquipmentGrid";
import ReservationForm from "@/components/ReservationForm";
import AdminPanel from "@/components/AdminPanel";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Users, Settings, Clock } from "lucide-react";

// Mock data - In real app this would come from API
const mockEquipment = [
  { id: '1', code: 'PC1', type: 'PC' as const, name: 'Gaming PC RTX 4080', status: 'available' as const },
  { id: '2', code: 'PC2', type: 'PC' as const, name: 'Gaming PC RTX 4070', status: 'occupied' as const, occupiedUntil: '15:30', currentPlayer: 'Player01' },
  { id: '3', code: 'PC3', type: 'PC' as const, name: 'Gaming PC RTX 4060', status: 'available' as const },
  { id: '4', code: 'PC4', type: 'PC' as const, name: 'Gaming PC RTX 4070', status: 'reserved_confirmed' as const, occupiedUntil: '16:00', currentPlayer: 'GamerX' },
  { id: '5', code: 'PC5', type: 'PC' as const, name: 'Gaming PC RTX 4080', status: 'available' as const },
  { id: '6', code: 'PC6', type: 'PC' as const, name: 'Gaming PC RTX 4060', status: 'available' as const },
  { id: '7', code: 'CON1', type: 'CONSOLE' as const, name: 'Nintendo Switch', status: 'available' as const },
  { id: '8', code: 'CON2', type: 'CONSOLE' as const, name: 'PlayStation 5', status: 'reserved_pending' as const }
];

const mockPlans = [
  // Gaming Time
  { id: '1', category: 'Gaming Time', name: '1 Hour', includes: 'Lounge access', price: 5000 },
  { id: '2', category: 'Gaming Time', name: '3 Hours', includes: 'Lounge access', price: 10000 },
  { id: '3', category: 'Gaming Time', name: 'Day Pass', includes: '12-hour access (12–12)', price: 20000 },
  
  // Booster Packs
  { id: '4', category: 'Booster Packs', name: 'Starter Boost', includes: '5 Hours', price: 15000 },
  { id: '5', category: 'Booster Packs', name: 'XP Pack', includes: '10 Hours', price: 26000 },
  { id: '6', category: 'Booster Packs', name: 'Level Up', includes: '20 Hours', price: 50000 },
  { id: '7', category: 'Booster Packs', name: 'Elite Pass', includes: '50 Hours', price: 110000 },
  
  // Combos
  { id: '8', category: 'Combos', name: 'Gamer Snack Pack', includes: '1 Hour + Snack + Drink/Coffee', price: 7000 },
  { id: '9', category: 'Combos', name: 'XP Boost', includes: '3 Hours + Snack + Drink', price: 12000 },
  { id: '10', category: 'Combos', name: 'Duo Pack', includes: '2 Hours + Snack + Drink c/u (2 players)', price: 14000 },
  { id: '11', category: 'Combos', name: 'Full Day Fuel', includes: 'Day Pass + 2 Snacks + 2 Drinks + 1 Refill', price: 25000 },
  { id: '12', category: 'Combos', name: 'Power Boost Pack', includes: '3 Hours + Snack + Coffee', price: 13500 }
];

interface Reservation {
  id: string;
  fullName: string;
  alias: string;
  phone: string;
  email: string;
  equipmentCode: string;
  planName: string;
  planPrice: number;
  receiptUrl: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

const mockReservations: Reservation[] = [
  {
    id: '1',
    fullName: 'Carlos Mendoza',
    alias: 'ProGamer99',
    phone: '+56 9 8765 4321',
    email: 'carlos@email.com',
    equipmentCode: 'PC2',
    planName: '3 Hours - Lounge access',
    planPrice: 10000,
    receiptUrl: '/lovable-uploads/a5dbcafb-1a7b-407f-af67-eec3222cf045.png',
    status: 'pending',
    createdAt: new Date().toISOString()
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
      planName: mockPlans.find(p => p.id === data.planId)?.name + ' - ' + mockPlans.find(p => p.id === data.planId)?.includes || '',
      planPrice: mockPlans.find(p => p.id === data.planId)?.price || 0,
      receiptUrl: URL.createObjectURL(data.receipt),
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    
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
                className="h-10 w-auto gaming-glow"
              />
              <div>
                <h1 className="text-2xl font-bold gaming-text-glow">GAMING GRID</h1>
                <p className="text-sm text-muted-foreground">Sistema de Reservas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="status-available">
                {mockEquipment.filter(eq => eq.status === 'available').length} Disponibles
              </Badge>
              <Badge variant="outline" className="status-occupied">
                {mockEquipment.filter(eq => eq.status === 'occupied').length} Ocupados
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {reservationTicket ? (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="bg-gaming-surface border-gaming-border rounded-lg p-8 gaming-glow">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-3xl font-bold gaming-text-glow mb-4">¡Reserva Enviada!</h2>
              <div className="text-xl mb-4">
                Ticket: <span className="font-mono text-primary">{reservationTicket}</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Tu reserva está en revisión. Nos pondremos en contacto contigo una vez confirmemos el pago.
              </p>
              <Button 
                variant="gaming" 
                onClick={() => setReservationTicket(null)}
              >
                Hacer Nueva Reserva
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="equipos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gaming-surface border-gaming-border">
              <TabsTrigger value="equipos" className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Equipos
              </TabsTrigger>
              <TabsTrigger value="reservar" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Reservar
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="equipos" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold gaming-text-glow">Estado de Equipos</h2>
                <p className="text-muted-foreground">
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
                    const tabsTrigger = document.querySelector('[value="reservar"]') as HTMLElement;
                    tabsTrigger?.click();
                  }}>
                    Continuar con Reserva
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reservar" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold gaming-text-glow">Nueva Reserva</h2>
                <p className="text-muted-foreground">
                  Completa el formulario y sube tu comprobante de transferencia
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <ReservationForm
                  plans={mockPlans}
                  equipment={mockEquipment}
                  selectedEquipment={selectedEquipment}
                  onSubmit={handleReservationSubmit}
                />
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <div className="max-w-6xl mx-auto">
                <AdminPanel
                  reservations={reservations}
                  onConfirm={handleReservationConfirm}
                  onCancel={handleReservationCancel}
                  onLogin={handleAdminLogin}
                  isAuthenticated={isAdminAuthenticated}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
