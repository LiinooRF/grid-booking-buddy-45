import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, Check, X, Clock, User, Phone, Mail } from "lucide-react";

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
  status: 'pending' | 'confirmed' | 'cancelled' | 'arrived';
  createdAt: string;
  startTime?: string;
  endTime?: string;
}

interface AdminPanelProps {
  reservations: Reservation[];
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onMarkArrived: (id: string) => void;
  onRelease: (id: string) => void;
  onExtendTime: (id: string, minutes: number) => void;
  onLogin: (password: string) => void;
  isAuthenticated: boolean;
  plans: any[];
  onChangePlan: (reservationId: string, planId: string) => void;
}

const AdminPanel = ({ reservations, onConfirm, onCancel, onMarkArrived, onRelease, onExtendTime, onLogin, isAuthenticated, plans, onChangePlan }: AdminPanelProps) => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
    setPassword('');
  };

  const handleConfirm = (reservation: Reservation) => {
    onConfirm(reservation.id);
    toast({
      title: "Reserva confirmada",
      description: `Reserva de ${reservation.fullName} confirmada exitosamente`,
      variant: "default"
    });
  };

  const handleCancel = (reservation: Reservation) => {
    onCancel(reservation.id);
    toast({
      title: "Reserva cancelada",
      description: `Reserva de ${reservation.fullName} cancelada`,
      variant: "destructive"
    });
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto bg-gaming-surface border-gaming-border">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Acceso Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña de admin"
                className="bg-gaming-bg border-gaming-border"
                autoFocus
              />
            </div>
            <Button type="submit" variant="gaming" className="w-full">
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed' || r.status === 'arrived');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  const handleExtendTime = (reservation: Reservation, minutes: number) => {
    onExtendTime(reservation.id, minutes);
    toast({
      title: "Tiempo extendido",
      description: `${minutes} minutos añadidos a la reserva de ${reservation.fullName}`,
      variant: "default"
    });
  };

  const renderReservationCard = (reservation: Reservation, showActions: boolean = true) => (
    <Card key={reservation.id} className="bg-gaming-surface border-gaming-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <span>{reservation.fullName} ({reservation.alias})</span>
          </div>
          <Badge variant="outline" className={`status-${reservation.status}`}>
            {reservation.status === 'pending' && 'Pendiente'}
            {reservation.status === 'confirmed' && 'Confirmada'}
            {reservation.status === 'cancelled' && 'Cancelada'}
            {reservation.status === 'arrived' && 'Cliente Llegó'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{reservation.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{reservation.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(reservation.createdAt).toLocaleString('es-CL')}</span>
            </div>
            {reservation.startTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>Horario: {reservation.startTime} - {reservation.endTime}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Equipo:</strong> {reservation.equipmentCode}
            </div>
            <div className="text-sm">
              <strong>Plan:</strong> {reservation.planName}
            </div>
            <div className="text-sm">
              <strong>Total:</strong> <span className="text-primary font-bold">${reservation.planPrice.toLocaleString()} CLP</span>
            </div>
          </div>
        </div>

        {reservation.status === 'pending' && (
          <div className="space-y-2">
            <Label>Comprobante de Transferencia</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(selectedReceipt === reservation.receiptUrl ? null : reservation.receiptUrl)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {selectedReceipt === reservation.receiptUrl ? 'Ocultar' : 'Ver Comprobante'}
              </Button>
            </div>
            
            {selectedReceipt === reservation.receiptUrl && (
              <div className="border border-gaming-border rounded-lg p-4 bg-gaming-bg">
                <img 
                  src={reservation.receiptUrl} 
                  alt="Comprobante de transferencia"
                  className="max-w-full h-auto max-h-96 mx-auto rounded-lg"
                />
              </div>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-3 pt-4 flex-wrap">
            {reservation.status === 'pending' && (
              <>
                <Button
                  variant="default"
                  onClick={() => handleConfirm(reservation)}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar Reserva
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => handleCancel(reservation)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
            
            {reservation.status === 'confirmed' && (
              <>
                <Button
                  variant="default"
                  onClick={() => onMarkArrived(reservation.id)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Cliente Llegó
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setChangingPlan(changingPlan === reservation.id ? null : reservation.id)}
                >
                  Cambiar Plan
                </Button>
                
                {changingPlan === reservation.id && (
                  <div className="w-full mt-2">
                    <select 
                      className="w-full p-2 bg-gaming-bg border border-gaming-border rounded text-sm"
                      onChange={(e) => {
                        onChangePlan(reservation.id, e.target.value);
                        setChangingPlan(null);
                      }}
                    >
                      <option value="">Seleccionar nuevo plan</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price.toLocaleString()} CLP
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => handleExtendTime(reservation, 60)}
                >
                  +1 hora
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleExtendTime(reservation, 120)}
                >
                  +2 horas
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleExtendTime(reservation, 180)}
                >
                  +3 horas
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => onRelease(reservation.id)}
                >
                  Liberar
                </Button>
              </>
            )}
            
            {reservation.status === 'arrived' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setChangingPlan(changingPlan === reservation.id ? null : reservation.id)}
                >
                  Cambiar Plan
                </Button>
                
                {changingPlan === reservation.id && (
                  <div className="w-full mt-2">
                    <select 
                      className="w-full p-2 bg-gaming-bg border border-gaming-border rounded text-sm"
                      onChange={(e) => {
                        onChangePlan(reservation.id, e.target.value);
                        setChangingPlan(null);
                      }}
                    >
                      <option value="">Seleccionar nuevo plan</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price.toLocaleString()} CLP
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => handleExtendTime(reservation, 60)}
                >
                  +1 hora
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleExtendTime(reservation, 120)}
                >
                  +2 horas
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleExtendTime(reservation, 180)}
                >
                  +3 horas
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => onRelease(reservation.id)}
                >
                  Liberar
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gaming-surface border-gaming-border">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Panel de Administración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gaming-bg rounded-lg border border-gaming-border">
              <div className="text-2xl font-bold text-primary">{pendingReservations.length}</div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </div>
            <div className="text-center p-4 bg-gaming-bg rounded-lg border border-gaming-border">
              <div className="text-2xl font-bold text-success">{confirmedReservations.filter(r => r.status === 'confirmed').length}</div>
              <div className="text-sm text-muted-foreground">Confirmadas</div>
            </div>
            <div className="text-center p-4 bg-gaming-bg rounded-lg border border-gaming-border">
              <div className="text-2xl font-bold text-blue-500">{confirmedReservations.filter(r => r.status === 'arrived').length}</div>
              <div className="text-sm text-muted-foreground">Llegaron</div>
            </div>
            <div className="text-center p-4 bg-gaming-bg rounded-lg border border-gaming-border">
              <div className="text-2xl font-bold text-destructive">{cancelledReservations.length}</div>
              <div className="text-sm text-muted-foreground">Canceladas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different reservation status */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pending')}
          >
            Pendientes ({pendingReservations.length})
          </Button>
          <Button
            variant={activeTab === 'confirmed' ? 'default' : 'outline'}
            onClick={() => setActiveTab('confirmed')}
          >
            Confirmadas ({confirmedReservations.length})
          </Button>
          <Button
            variant={activeTab === 'cancelled' ? 'default' : 'outline'}
            onClick={() => setActiveTab('cancelled')}
          >
            Canceladas ({cancelledReservations.length})
          </Button>
        </div>

        <div className="grid gap-6">
          {activeTab === 'pending' && (
            pendingReservations.length === 0 ? (
              <Card className="bg-gaming-surface border-gaming-border">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No hay reservas pendientes de revisión</p>
                </CardContent>
              </Card>
            ) : (
              pendingReservations.map((reservation) => renderReservationCard(reservation))
            )
          )}

          {activeTab === 'confirmed' && (
            confirmedReservations.length === 0 ? (
              <Card className="bg-gaming-surface border-gaming-border">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No hay reservas confirmadas</p>
                </CardContent>
              </Card>
            ) : (
              confirmedReservations.map((reservation) => renderReservationCard(reservation))
            )
          )}

          {activeTab === 'cancelled' && (
            cancelledReservations.length === 0 ? (
              <Card className="bg-gaming-surface border-gaming-border">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No hay reservas canceladas</p>
                </CardContent>
              </Card>
            ) : (
              cancelledReservations.map((reservation) => renderReservationCard(reservation, false))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;