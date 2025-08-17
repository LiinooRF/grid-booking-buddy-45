import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, Check, X, Clock, User, Phone, Mail, Calendar } from "lucide-react";

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

interface AdminPanelProps {
  reservations: Reservation[];
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onMarkArrived: (id: string) => void;
  onRelease: (id: string) => void;
  onExtendTime: (id: string, minutes: number) => void;
  onLogin: (password: string) => void;
  isAuthenticated: boolean;
  onChangeHours: (reservationId: string, newHours: number) => void;
  hourlyRate: number;
}

const AdminPanel = ({ reservations, onConfirm, onCancel, onMarkArrived, onRelease, onExtendTime, onLogin, isAuthenticated, onChangeHours, hourlyRate }: AdminPanelProps) => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
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

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">{pendingReservations.length}</div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-500">{confirmedReservations.filter(r => r.status === 'confirmed').length}</div>
            <div className="text-sm text-muted-foreground">Confirmadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-500">{confirmedReservations.filter(r => r.status === 'arrived').length}</div>
            <div className="text-sm text-muted-foreground">Llegaron</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-destructive">{reservations.filter(r => r.status === 'cancelled').length}</div>
            <div className="text-sm text-muted-foreground">Canceladas</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reservations */}
      {pendingReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Reservas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Horas/Precio</TableHead>
                  <TableHead>Comprobante</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.fullName}</div>
                        <div className="text-sm text-muted-foreground">({reservation.alias})</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {reservation.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {reservation.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{reservation.equipmentCode}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{reservation.reservationDate}</div>
                        {reservation.startTime && reservation.endTime && (
                          <div className="text-muted-foreground">
                            {reservation.startTime} - {reservation.endTime}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{reservation.hours}h</div>
                        <div className="text-primary font-bold">
                          ${reservation.totalPrice.toLocaleString()} CLP
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(selectedReceipt === reservation.receiptUrl ? null : reservation.receiptUrl)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onConfirm(reservation.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onCancel(reservation.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Confirmed Reservations */}
      {confirmedReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Reservas Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Horas/Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {confirmedReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.fullName}</div>
                        <div className="text-sm text-muted-foreground">({reservation.alias})</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {reservation.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {reservation.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{reservation.equipmentCode}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{reservation.reservationDate}</div>
                        {reservation.startTime && reservation.endTime && (
                          <div className="text-muted-foreground">
                            {reservation.startTime} - {reservation.endTime}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span>{reservation.hours}h</span>
                          <Select
                            value={reservation.hours.toString()}
                            onValueChange={(value) => onChangeHours(reservation.id, parseInt(value))}
                          >
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hour) => (
                                <SelectItem key={hour} value={hour.toString()}>
                                  {hour}h
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="text-primary font-bold">
                          ${reservation.totalPrice.toLocaleString()} CLP
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={reservation.status === 'arrived' ? 'default' : 'secondary'}>
                        {reservation.status === 'confirmed' ? 'Confirmada' : 'Cliente Llegó'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {reservation.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMarkArrived(reservation.id)}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onExtendTime(reservation.id, 60)}
                        >
                          +1h
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onExtendTime(reservation.id, 120)}
                        >
                          +2h
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onExtendTime(reservation.id, 180)}
                        >
                          +3h
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onRelease(reservation.id)}
                        >
                          Liberar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Comprobante de Transferencia</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReceipt(null)}
                >
                  ✕
                </Button>
              </div>
              <img 
                src={selectedReceipt} 
                alt="Comprobante de transferencia"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;