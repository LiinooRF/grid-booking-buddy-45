import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, CreditCard, Clock, Users, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addDays } from 'date-fns';

interface Equipment {
  id: string;
  code: string;
  type: 'PC' | 'CONSOLE';
  name: string;
  description?: string;
  status: 'available' | 'occupied' | 'reserved_pending' | 'reserved_confirmed';
}

interface ReservationFormProps {
  equipment: Equipment[];
  selectedEquipment?: string;
  onSubmit: (data: any) => void;
  existingReservations?: any[];
}

const ReservationForm = ({ equipment, selectedEquipment, onSubmit, existingReservations = [] }: ReservationFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    alias: '',
    phone: '',
    email: '',
    equipmentCode: selectedEquipment || '',
    reservationDate: new Date().toISOString().split('T')[0],
    startTime: '',
    hours: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [closedDays, setClosedDays] = useState<any[]>([]);
  const [eventBlocks, setEventBlocks] = useState<any[]>([]);
  
  // Cargar bloqueos de eventos cuando cambie equipo o fecha
  useEffect(() => {
    const fetchEventBlocks = async () => {
      if (!formData.equipmentCode || !formData.reservationDate) {
        setEventBlocks([]);
        return;
      }
      
      try {
        const selectedEquip = equipment.find(eq => eq.name === formData.equipmentCode);
        if (!selectedEquip) {
          setEventBlocks([]);
          return;
        }
        
        const dayStart = new Date(`${formData.reservationDate}T00:00:00`);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        
        const { data } = await supabase
          .from('event_blocks')
          .select('*')
          .contains('equipment_ids', [selectedEquip.id])
          .lte('start_time', dayEnd.toISOString())
          .gte('end_time', dayStart.toISOString());
        
        setEventBlocks(data || []);
        console.log('🎯 Event blocks loaded for', formData.equipmentCode, formData.reservationDate, ':', data);
      } catch (error) {
        console.error('Error loading event blocks:', error);
        setEventBlocks([]);
      }
    };
    
    fetchEventBlocks();
  }, [formData.equipmentCode, formData.reservationDate, equipment]);
  const generateTimeSlots = () => {
    const slots: string[] = [];
    // De 12:00 a 23:00 (último inicio permitido)
    for (let hour = 12; hour <= 23; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
    }
    return slots;
  };

  const getMaxHoursForTime = (startTime: string, selectedDate: string) => {
    if (!startTime) return 12;
    
    const [startHour] = startTime.split(':').map(Number);
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    
    // If it's today and the time has already passed, return 0
    if (isToday && currentHour >= startHour) {
      return 0;
    }
    
    // Calculate hours until closing (12AM = 24, but we use 0 for midnight)
    let hoursUntilClose;
    if (startHour === 0) { // If starting at midnight
      hoursUntilClose = 0;
    } else if (startHour >= 12) { // PM hours
      hoursUntilClose = 24 - startHour;
    } else { // AM hours (shouldn't happen in our case, but just in case)
      hoursUntilClose = 24 - startHour;
    }
    
    return Math.min(hoursUntilClose, 12);
  };

  const getAvailableHours = () => {
    if (!formData.startTime) return [] as number[];

    // Calcular horas contiguas disponibles desde la hora seleccionada
    const slotsSet = new Set(availableSlots);
    const [startHour] = formData.startTime.split(':').map(Number);

    let contiguous = 0;
    for (let i = 0; i < 12; i++) {
      const nextHour = (startHour + i) % 24;
      const timeStr = nextHour === 0 ? '00:00' : `${nextHour.toString().padStart(2, '0')}:00`;
      if (slotsSet.has(timeStr)) {
        contiguous++;
      } else {
        break;
      }
    }

    // Limitar además por horario de cierre
    const maxByClosing = getMaxHoursForTime(formData.startTime, formData.reservationDate);
    const limit = Math.min(contiguous, maxByClosing);

    return Array.from({ length: limit }, (_, i) => i + 1);
  };

  const calculateEndTime = (startTime: string, hours: number) => {
    if (!startTime || !hours) return '';
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startHour, startMin, 0, 0);
    
    const endDate = new Date(startDate.getTime() + (hours * 60 * 60 * 1000));
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  // Verificar disponibilidad real consultando reservas existentes y bloqueos de eventos
  const checkAvailability = async (equipmentCode: string, date: string) => {
    if (!equipmentCode || !date) return [];
    
    try {
      // Buscar el equipo por código
      const selectedEquip = equipment.find(eq => eq.name === equipmentCode);
      if (!selectedEquip) return [];
      
      // Calcular inicio y fin del día en ISO (UTC) basados en hora local
      const dayStartLocal = new Date(`${date}T00:00:00`);
      const nextDayLocal = new Date(`${date}T00:00:00`);
      nextDayLocal.setDate(nextDayLocal.getDate() + 1);

      // Consultar reservas para este equipo en el rango del día seleccionado
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('start_time, end_time, hours')
        .eq('equipment_id', selectedEquip.id)
        .gte('start_time', dayStartLocal.toISOString())
        .lt('start_time', nextDayLocal.toISOString())
        .in('status', ['pending', 'confirmed', 'arrived', 'active']);
      
      if (error) {
        console.error('Error consultando reservas:', error);
        return generateTimeSlots(); // Fallback a todos los slots si hay error
      }

      // Consultar bloqueos de eventos que cruzan el día seleccionado
      const { data: eventBlocks } = await supabase
        .from('event_blocks')
        .select('start_time, end_time, title')
        .contains('equipment_ids', [selectedEquip.id])
        .lte('start_time', nextDayLocal.toISOString())
        .gte('end_time', dayStartLocal.toISOString());
      
      // Generar todos los slots de tiempo posibles
      const allSlots = generateTimeSlots();
      const occupiedSlots = new Set<string>();
      
      // Marcar todas las horas ocupadas por reservas existentes
      reservations?.forEach(reservation => {
        if (!reservation.start_time || !reservation.end_time) return;
        
        const startTime = new Date(reservation.start_time);
        const endTime = new Date(reservation.end_time);
        
        // Generar todas las horas ocupadas de esta reserva
        let currentTime = new Date(startTime);
        while (currentTime < endTime) {
          const hour = currentTime.getHours();
          const timeSlot = hour === 0 ? '00:00' : `${hour.toString().padStart(2, '0')}:00`;
          occupiedSlots.add(timeSlot);
          currentTime.setHours(currentTime.getHours() + 1);
        }
      });

      // Marcar todas las horas ocupadas por bloqueos de eventos
      eventBlocks?.forEach(block => {
        if (!block.start_time || !block.end_time) return;
        
        const startTime = new Date(block.start_time);
        const endTime = new Date(block.end_time);
        
        // Generar todas las horas ocupadas por el evento
        let currentTime = new Date(startTime);
        while (currentTime < endTime) {
          const hour = currentTime.getHours();
          const timeSlot = hour === 0 ? '00:00' : `${hour.toString().padStart(2, '0')}:00`;
          occupiedSlots.add(timeSlot);  // Bloquear directamente sin sufijo '_event'
          currentTime.setHours(currentTime.getHours() + 1);
        }
      });
      
      // Filtrar slots disponibles: remover ocupados (reservas y eventos), fuera de horario y horas pasadas si es hoy
      const todayStr = new Date().toISOString().split('T')[0];
      const currentHour = new Date().getHours();
      const availableSlots = allSlots.filter(slot => {
        const [slotHour] = slot.split(':').map(Number);
        const inOperatingHours = slotHour >= 12 && slotHour <= 23;
        const notOccupied = !occupiedSlots.has(slot);
        const notPast = formData.reservationDate === todayStr ? slotHour > currentHour : true;
        return inOperatingHours && notOccupied && notPast;
      });
      
      return availableSlots;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      return generateTimeSlots(); // Fallback a todos los slots
    }
  };
  
  // Función reutilizable para actualizar los horarios disponibles
  const updateAvailableSlots = async () => {
    if (!formData.equipmentCode || !formData.reservationDate) {
      setAvailableSlots([]);
      return;
    }
    const slots = await checkAvailability(formData.equipmentCode, formData.reservationDate);
    setAvailableSlots(slots);
    if (formData.startTime && !slots.includes(formData.startTime)) {
      setFormData(prev => ({ ...prev, startTime: '', hours: 1 }));
    }
  };
  
  // Actualizar slots cuando cambian equipo/fecha, reservas o eventos
  useEffect(() => {
    updateAvailableSlots();
  }, [formData.equipmentCode, formData.reservationDate, existingReservations, eventBlocks]);

  // Suscribirse a cambios en tiempo real para bloquear horarios inmediatamente
  useEffect(() => {
    if (!formData.equipmentCode || !formData.reservationDate) return;

    const selectedEquip = equipment.find(eq => eq.name === formData.equipmentCode);
    if (!selectedEquip) return;

    const channel = supabase
      .channel('realtime-availability')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, async (payload) => {
        try {
          const row: any = payload.new || payload.old;
          if (!row || row.equipment_id !== selectedEquip.id) return;

          const rowDate = new Date(row.start_time).toISOString().split('T')[0];
          if (rowDate === formData.reservationDate) {
            await updateAvailableSlots();
          }
        } catch (e) {
          console.error('Reservation realtime update error:', e);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_blocks' }, async (payload) => {
        try {
          const row: any = payload.new || payload.old;
          if (!row || !row.equipment_ids?.includes(selectedEquip.id)) return;

          const blockStartDate = new Date(row.start_time).toISOString().split('T')[0];
          const blockEndDate = new Date(row.end_time).toISOString().split('T')[0];
          
          if (blockStartDate <= formData.reservationDate && formData.reservationDate <= blockEndDate) {
            await updateAvailableSlots();
          }
        } catch (e) {
          console.error('Event block realtime update error:', e);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formData.equipmentCode, formData.reservationDate, equipment]);

  // Cargar días cerrados al inicio
  useEffect(() => {
    const fetchClosedDays = async () => {
      const { data } = await supabase
        .from('closed_days')
        .select('*');
      
      if (data) {
        setClosedDays(data);
      }
    };

    fetchClosedDays();
  }, []);

  // Actualizar horarios automáticamente cada minuto cuando la fecha es hoy
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.reservationDate !== todayStr || !formData.equipmentCode) return;

    const interval = setInterval(() => {
      updateAvailableSlots();
    }, 60000);

    return () => clearInterval(interval);
  }, [formData.reservationDate, formData.equipmentCode]);

  const isTimeSlotAvailable = (startTime: string, hours: number, equipmentCode: string) => {
    if (!startTime || !hours || !equipmentCode || !availableSlots.length) return false;

    // El slot inicial debe estar disponible
    if (!availableSlots.includes(startTime)) return false;

    // Verificar horas contiguas disponibles desde el inicio
    const slotsSet = new Set(availableSlots);
    const [startHour] = startTime.split(':').map(Number);

    let contiguous = 0;
    for (let i = 0; i < hours; i++) {
      const nextHour = (startHour + i) % 24;
      const timeStr = nextHour === 0 ? '00:00' : `${nextHour.toString().padStart(2, '0')}:00`;
      if (slotsSet.has(timeStr)) {
        contiguous++;
      } else {
        break;
      }
    }

    if (contiguous < hours) return false;

    // Validar además contra horario de cierre
    const maxByClosing = getMaxHoursForTime(startTime, formData.reservationDate);
    return hours <= maxByClosing;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.alias || !formData.phone || !formData.email || 
        !formData.equipmentCode || !formData.reservationDate || !formData.startTime || !formData.hours) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    // Validate time restrictions
    const maxHours = getMaxHoursForTime(formData.startTime, formData.reservationDate);
    if (formData.hours > maxHours) {
      toast({
        title: "Horario no disponible",
        description: `Solo puedes reservar máximo ${maxHours} ${maxHours === 1 ? 'hora' : 'horas'} desde las ${formData.startTime}`,
        variant: "destructive"
      });
      return;
    }

    // Verificar disponibilidad del horario seleccionado
    if (!isTimeSlotAvailable(formData.startTime, formData.hours, formData.equipmentCode)) {
      toast({
        title: "Horario no disponible",
        description: "El horario seleccionado ya está reservado. Por favor selecciona otro horario.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const endTime = calculateEndTime(formData.startTime, formData.hours);
      await onSubmit({
        ...formData,
        endTime
      });
      
      toast({
        title: "Reserva enviada",
        description: "Tu reserva ha sido enviada correctamente",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        fullName: '',
        alias: '',
        phone: '',
        email: '',
        equipmentCode: '',
        reservationDate: new Date().toISOString().split('T')[0],
        startTime: '',
        hours: 1
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al enviar la reserva",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  

  return (
    <Card className="bg-gaming-surface border-gaming-border">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Nueva Reserva
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alias">Tu alias en el cyber</Label>
                <Input
                  id="alias"
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({...formData, alias: e.target.value})}
                  placeholder="Si no tienes, solo coloca tu nombre y te reservamos uno"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Selección de Equipo</h3>
            <div className="space-y-2">
              <Label htmlFor="equipmentCode">Equipo</Label>
              <Select
                value={formData.equipmentCode || undefined}
                onValueChange={(value) => setFormData({...formData, equipmentCode: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un equipo disponible" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.filter(eq => eq.status === 'available').map((eq) => (
                    <SelectItem key={eq.name} value={eq.name}>
                      {eq.name} - {eq.description || eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Fecha y Horario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reservationDate">Fecha de reserva</Label>
                <Input
                  id="reservationDate"
                  type="date"
                  value={formData.reservationDate}
                  min={new Date().toISOString().split('T')[0]}
                  max={addDays(new Date(), 5).toISOString().split('T')[0]}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const isClosedDay = closedDays.some(cd => cd.date === selectedDate);
                    
                    if (isClosedDay) {
                      const closedDay = closedDays.find(cd => cd.date === selectedDate);
                      toast({
                        title: "Día cerrado",
                        description: `No se pueden hacer reservas este día: ${closedDay?.reason}`,
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    setFormData({...formData, reservationDate: selectedDate});
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Select
                  value={formData.startTime || undefined}
                  onValueChange={(value) => setFormData({...formData, startTime: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona hora de inicio" />
                  </SelectTrigger>
                  <SelectContent>
                     {availableSlots.length > 0 ? (
                       availableSlots.map((time) => (
                         <SelectItem key={time} value={time}>
                           {time} ✅
                         </SelectItem>
                       ))
                     ) : (
                       <SelectItem value="no-slots" disabled>
                         No hay horarios disponibles
                       </SelectItem>
                     )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Cantidad de horas</Label>
              <Select
                value={formData.hours.toString()}
                onValueChange={(value) => setFormData({...formData, hours: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona cantidad de horas" />
                </SelectTrigger>
                   <SelectContent>
                     {getAvailableHours().length > 0 ? (
                       getAvailableHours().map((hour) => (
                         <SelectItem key={hour} value={hour.toString()}>
                           {hour} {hour === 1 ? 'hora' : 'horas'}
                         </SelectItem>
                       ))
                     ) : (
                        <SelectItem value="no-hours" disabled>
                          No hay horas disponibles
                        </SelectItem>
                     )}
                   </SelectContent>
              </Select>
              {formData.startTime && getMaxHoursForTime(formData.startTime, formData.reservationDate) === 0 && (
                <p className="text-sm text-destructive">
                  Esta hora ya no está disponible para hoy
                </p>
              )}
              
              {formData.equipmentCode && availableSlots.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>No hay horarios disponibles para este equipo en la fecha seleccionada</span>
                </div>
              )}
            </div>
            {formData.startTime && formData.hours && (
              <div className="text-sm text-muted-foreground">
                Horario reservado: {formData.startTime} - {calculateEndTime(formData.startTime, formData.hours)}
              </div>
            )}
          </div>

          {/* Reservation Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Resumen de Reserva</h3>
            <Card className="bg-primary/10 border-primary/30">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Horas reservadas:</span>
                    <span>{formData.hours} {formData.hours === 1 ? 'hora' : 'horas'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipo:</span>
                    <span>{formData.equipmentCode || 'No seleccionado'}</span>
                  </div>
                  {formData.startTime && formData.hours && (
                    <div className="flex justify-between">
                      <span>Horario:</span>
                      <span>{formData.startTime} - {calculateEndTime(formData.startTime, formData.hours)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg text-primary">
                    <span>¡Reserva GRATIS!</span>
                    <span>🎮</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Esta reserva es completamente gratuita. Solo confirma tu asistencia.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            type="submit" 
            variant="gaming" 
            size="lg" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              'Enviar Reserva'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;