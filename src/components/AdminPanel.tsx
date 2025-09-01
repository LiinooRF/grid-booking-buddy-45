import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventBlockForm } from "@/components/EventBlockForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Eye, Check, X, Clock, User, Phone, Mail, Calendar, BarChart3, DollarSign, Users, TrendingUp, Filter, Download, Search, RefreshCw, Settings, Wrench, Plus, Trash2 } from "lucide-react";

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
  equipment: any[];
  onToggleMaintenance: (equipmentId: string, maintenanceMode: boolean, reason?: string) => void;
  onAddClosedDay: (date: string, reason: string) => void;
  onRemoveClosedDay: (id: string) => void;
}

const AdminPanel = ({ reservations, onConfirm, onCancel, onMarkArrived, onRelease, onExtendTime, onLogin, isAuthenticated, onChangeHours, equipment, onToggleMaintenance, onAddClosedDay, onRemoveClosedDay }: AdminPanelProps) => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [eventBlocks, setEventBlocks] = useState<any[]>([]);
  const [loadingEventBlocks, setLoadingEventBlocks] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [closedDays, setClosedDays] = useState<any[]>([]);
  const [newClosedDate, setNewClosedDate] = useState('');
  const [newClosedReason, setNewClosedReason] = useState('');
  const [maintenanceReasons, setMaintenanceReasons] = useState<{[key: string]: string}>({});

  // Cargar días cerrados
  useEffect(() => {
    const fetchClosedDays = async () => {
      const { data } = await supabase
        .from('closed_days')
        .select('*')
        .order('date', { ascending: true });
      
      if (data) {
        setClosedDays(data);
      }
    };

    if (isAuthenticated) {
      fetchClosedDays();
    }
  }, [isAuthenticated]);

  // Cargar bloqueos de eventos
  useEffect(() => {
    const fetchEventBlocks = async () => {
      setLoadingEventBlocks(true);
      try {
        const { data } = await supabase
          .from('event_blocks')
          .select('*')
          .order('start_time', { ascending: true });
        
        if (data) {
          setEventBlocks(data);
        }
      } catch (error) {
        console.error('Error loading event blocks:', error);
      } finally {
        setLoadingEventBlocks(false);
      }
    };

    if (isAuthenticated) {
      fetchEventBlocks();
    }
  }, [isAuthenticated]);

  const handleDeleteEventBlock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_blocks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setEventBlocks(prev => prev.filter(block => block.id !== id));
      
      toast({
        title: "Bloqueo eliminado",
        description: "El bloqueo de evento ha sido eliminado",
      });
    } catch (error) {
      console.error('Error deleting event block:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el bloqueo",
        variant: "destructive"
      });
    }
  };

  const refreshEventBlocks = async () => {
    try {
      const { data } = await supabase
        .from('event_blocks')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (data) {
        setEventBlocks(data);
      }
    } catch (error) {
      console.error('Error refreshing event blocks:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'GamingGrid29!') {
      onLogin(password);
    }
    setPassword('');
  };

  const handleToggleMaintenance = async (equipmentId: string, maintenanceMode: boolean, reason?: string) => {
    await onToggleMaintenance(equipmentId, maintenanceMode, reason);
  };

  const handleAddClosedDay = async () => {
    if (newClosedDate && newClosedReason) {
      await onAddClosedDay(newClosedDate, newClosedReason);
      setNewClosedDate('');
      setNewClosedReason('');
      
      // Refresh closed days
      const { data } = await supabase
        .from('closed_days')
        .select('*')
        .order('date', { ascending: true });
      
      if (data) {
        setClosedDays(data);
      }
    }
  };

  const handleRemoveClosedDay = async (id: string) => {
    await onRemoveClosedDay(id);
    
    // Refresh closed days
    const { data } = await supabase
      .from('closed_days')
      .select('*')
      .order('date', { ascending: true });
    
    if (data) {
      setClosedDays(data);
    }
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

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    const matchesDate = !filterDate || reservation.reservationDate === filterDate;
    const matchesSearch = !searchTerm || 
      reservation.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phone.includes(searchTerm) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesDate && matchesSearch;
  });

  const pendingReservations = filteredReservations.filter(r => r.status === 'pending');
  const confirmedReservations = filteredReservations.filter(r => r.status === 'confirmed' || r.status === 'arrived');
  const cancelledReservations = filteredReservations.filter(r => r.status === 'cancelled');

  // Statistics  
  const todayReservations = reservations.filter(r => 
    r.reservationDate === new Date().toLocaleDateString('en-CA')
  );

  const equipmentUsage = reservations
    .filter(r => r.status === 'confirmed' || r.status === 'arrived')
    .reduce((acc, r) => {
      acc[r.equipmentCode] = (acc[r.equipmentCode] || 0) + r.hours;
      return acc;
    }, {} as Record<string, number>);

  const exportData = () => {
    const csvContent = [
      ['Fecha', 'Cliente', 'Alias', 'Teléfono', 'Email', 'Equipo', 'Horas', 'Estado', 'Hora Inicio', 'Hora Fin'].join(','),
      ...filteredReservations.map(r => [
        r.reservationDate,
        r.fullName,
        r.alias,
        r.phone,
        r.email,
        r.equipmentCode,
        r.hours,
        r.status,
        r.startTime || '',
        r.endTime || ''
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Datos exportados",
      description: "El archivo CSV ha sido descargado",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gaming-surface border-gaming-border">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendientes ({pendingReservations.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Confirmadas ({confirmedReservations.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Todas ({filteredReservations.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <div className="text-sm text-muted-foreground">Activas</div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Resumen de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Reservas:</span>
                  <span className="font-bold">{todayReservations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pendientes:</span>
                  <span className="font-bold text-yellow-500">{todayReservations.filter(r => r.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Activas:</span>
                  <span className="font-bold text-green-500">{todayReservations.filter(r => r.status === 'arrived').length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Uso de Equipos
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-3">
                   {Object.entries(equipmentUsage).length > 0 ? (
                     Object.entries(equipmentUsage).slice(0, 5).map(([equipment, hours]) => (
                       <div key={equipment} className="flex justify-between items-center">
                         <span>{equipment}</span>
                         <Badge variant="outline">{hours}h</Badge>
                       </div>
                     ))
                   ) : (
                     <div className="text-sm text-muted-foreground">No hay datos de uso disponibles</div>
                   )}
                 </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Buscar cliente, alias, equipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-40"
                />
                <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterStatus('all'); }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
                <Button variant="outline" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {pendingReservations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Reservas Pendientes de Aprobación</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Equipo</TableHead>
                      <TableHead>Fecha/Hora</TableHead>
                      <TableHead>Horas</TableHead>
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
                        <TableCell>
                          <Badge variant="outline">{reservation.equipmentCode}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{reservation.reservationDate}</div>
                            {reservation.startTime && reservation.endTime && (
                              <div className="text-muted-foreground">
                                {reservation.startTime} - {reservation.endTime}
                              </div>
                            )}
                          </div>
                        </TableCell>
                         <TableCell>
                           <div className="font-medium">{reservation.hours}h</div>
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
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-muted-foreground">No hay reservas pendientes</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-6">
          {confirmedReservations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Reservas Confirmadas y Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Equipo</TableHead>
                      <TableHead>Fecha/Hora</TableHead>
                      <TableHead>Horas</TableHead>
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
                              <a href={`tel:${reservation.phone}`} className="hover:text-primary">
                                {reservation.phone}
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${reservation.email}`} className="hover:text-primary">
                                {reservation.email}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reservation.equipmentCode}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{reservation.reservationDate}</div>
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
                              <span className="text-sm">{reservation.hours}h</span>
                              <Select
                                value={reservation.hours.toString()}
                                onValueChange={(value) => onChangeHours(reservation.id, parseInt(value))}
                              >
                                <SelectTrigger className="w-16 h-7 text-xs">
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
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={reservation.status === 'arrived' ? 'default' : 'secondary'}>
                            {reservation.status === 'confirmed' ? 'Confirmada' : 'Activa'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {reservation.status === 'confirmed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onMarkArrived(reservation.id)}
                                title="Marcar como llegó"
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onExtendTime(reservation.id, 60)}
                              title="Extender 1 hora"
                              className="text-xs px-2"
                            >
                              +1h
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onExtendTime(reservation.id, 120)}
                              title="Extender 2 horas"
                              className="text-xs px-2"
                            >
                              +2h
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onExtendTime(reservation.id, 180)}
                              title="Extender 3 horas"
                              className="text-xs px-2"
                            >
                              +3h
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onRelease(reservation.id)}
                              title="Liberar equipo"
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
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-muted-foreground">No hay reservas confirmadas</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Buscar cliente, alias, equipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="confirmed">Confirmadas</SelectItem>
                    <SelectItem value="arrived">Activas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-40"
                />
                <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterStatus('all'); }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
                <Button variant="outline" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Todas las Reservas ({filteredReservations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.fullName}</div>
                          <div className="text-sm text-muted-foreground">({reservation.alias})</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{reservation.equipmentCode}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{reservation.reservationDate}</div>
                          {reservation.startTime && reservation.endTime && (
                            <div className="text-muted-foreground">
                              {reservation.startTime} - {reservation.endTime}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{reservation.hours}h</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            reservation.status === 'confirmed' ? 'secondary' :
                            reservation.status === 'arrived' ? 'default' :
                            reservation.status === 'cancelled' ? 'destructive' :
                            'outline'
                          }
                        >
                          {reservation.status === 'pending' ? 'Pendiente' :
                           reservation.status === 'confirmed' ? 'Confirmada' :
                           reservation.status === 'arrived' ? 'Activa' :
                           'Cancelada'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(reservation.createdAt).toLocaleString('es-CL')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mantenimiento de Equipos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Mantenimiento de Equipos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {equipment.map((eq) => (
                  <div key={eq.id} className="flex items-center justify-between p-3 border border-gaming-border rounded-md">
                    <div>
                      <div className="font-medium">{eq.name}</div>
                      <div className="text-sm text-muted-foreground">{eq.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {eq.status === 'occupied' ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Check className="h-4 w-4 mr-1" />
                              Activar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Activar Equipo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p>¿Desactivar modo mantenimiento para {eq.name}?</p>
                              <Button 
                                onClick={() => handleToggleMaintenance(eq.id, false)}
                                className="w-full"
                              >
                                Activar Equipo
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Wrench className="h-4 w-4 mr-1" />
                              Mantenimiento
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Poner en Mantenimiento</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="maintenance-reason">Razón del mantenimiento</Label>
                                <Textarea
                                  id="maintenance-reason"
                                  placeholder="Ej: Limpieza profunda, actualización de software..."
                                  value={maintenanceReasons[eq.id] || ''}
                                  onChange={(e) => {
                                    setMaintenanceReasons(prev => ({
                                      ...prev,
                                      [eq.id]: e.target.value
                                    }));
                                  }}
                                />
                              </div>
                              <Button 
                                onClick={() => handleToggleMaintenance(eq.id, true, maintenanceReasons[eq.id] || "Mantenimiento general")}
                                variant="destructive"
                                className="w-full"
                              >
                                Poner en Mantenimiento
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Días Cerrados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Días Cerrados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Agregar nuevo día cerrado */}
                <div className="space-y-3 p-3 border border-gaming-border rounded-md bg-background/50">
                  <div className="space-y-2">
                    <Label htmlFor="closed-date">Fecha</Label>
                    <Input
                      id="closed-date"
                      type="date"
                      value={newClosedDate}
                      onChange={(e) => setNewClosedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closed-reason">Razón</Label>
                    <Input
                      id="closed-reason"
                      placeholder="Ej: Evento especial, reparaciones..."
                      value={newClosedReason}
                      onChange={(e) => setNewClosedReason(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleAddClosedDay}
                    disabled={!newClosedDate || !newClosedReason}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Día Cerrado
                  </Button>
                </div>

                {/* Lista de días cerrados */}
                <div className="space-y-2">
                  {closedDays.length > 0 ? (
                    closedDays.map((day) => (
                      <div key={day.id} className="flex items-center justify-between p-3 border border-gaming-border rounded-md">
                        <div>
                          <div className="font-medium">{day.date}</div>
                          <div className="text-sm text-muted-foreground">{day.reason}</div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveClosedDay(day.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No hay días cerrados configurados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bloqueos por Eventos */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Bloqueos por Eventos
                  </CardTitle>
                  <EventBlockForm equipment={equipment} onSuccess={refreshEventBlocks} />
                </div>
              </CardHeader>
              <CardContent>
                {loadingEventBlocks ? (
                  <div className="text-center py-4">Cargando bloqueos...</div>
                ) : eventBlocks.length > 0 ? (
                  <div className="space-y-3">
                    {eventBlocks.map((block) => (
                      <div key={block.id} className="flex items-center justify-between p-3 border border-gaming-border rounded-md">
                        <div className="flex-1">
                          <div className="font-medium">{block.title}</div>
                          {block.description && (
                            <div className="text-sm text-muted-foreground mb-1">{block.description}</div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(block.start_time).toLocaleDateString('es-CL')} {' '}
                            {new Date(block.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {new Date(block.end_time).toLocaleDateString('es-CL')} {' '}
                            {new Date(block.end_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Equipos: {block.equipment_ids.length} equipos bloqueados
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEventBlock(block.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No hay bloqueos por eventos configurados
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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