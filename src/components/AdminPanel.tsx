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
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface AdminPanelProps {
  reservations: Reservation[];
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onLogin: (password: string) => void;
  isAuthenticated: boolean;
}

const AdminPanel = ({ reservations, onConfirm, onCancel, onLogin, isAuthenticated }: AdminPanelProps) => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gaming-bg rounded-lg border border-gaming-border">
              <div className="text-2xl font-bold text-primary">{pendingReservations.length}</div>
              <div className="text-sm text-muted-foreground">Reservas Pendientes</div>
            </div>
            <div className="text-center p-4 bg-gaming-bg rounded-lg border border-gaming-border">
              <div className="text-2xl font-bold text-success">{reservations.filter(r => r.status === 'confirmed').length}</div>
              <div className="text-sm text-muted-foreground">Confirmadas</div>
            </div>
            <div className="text-center p-4 bg-gaming-bg rounded-lg border border-gaming-border">
              <div className="text-2xl font-bold text-destructive">{reservations.filter(r => r.status === 'cancelled').length}</div>
              <div className="text-sm text-muted-foreground">Canceladas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {pendingReservations.length === 0 ? (
        <Card className="bg-gaming-surface border-gaming-border">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No hay reservas pendientes de revisión</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingReservations.map((reservation) => (
            <Card key={reservation.id} className="bg-gaming-surface border-gaming-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>{reservation.fullName} ({reservation.alias})</span>
                  </div>
                  <Badge variant="outline" className="status-pending">
                    Pendiente
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

                <div className="flex gap-3 pt-4">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;