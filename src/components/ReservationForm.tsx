import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, CreditCard, Clock, Users } from "lucide-react";

interface Equipment {
  id: string;
  code: string;
  type: 'PC' | 'CONSOLE';
  name: string;
  status: 'available' | 'occupied' | 'reserved_pending' | 'reserved_confirmed';
}

interface ReservationFormProps {
  equipment: Equipment[];
  selectedEquipment?: string;
  onSubmit: (data: any) => void;
}

const ReservationForm = ({ equipment, selectedEquipment, onSubmit }: ReservationFormProps) => {
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


  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 12; hour < 24; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
    }
    slots.push("00:00"); // Add midnight
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
    const maxHours = getMaxHoursForTime(formData.startTime, formData.reservationDate);
    const hours = [];
    for (let i = 1; i <= maxHours; i++) {
      hours.push(i);
    }
    return hours;
  };

  const calculateEndTime = (startTime: string, hours: number) => {
    if (!startTime || !hours) return '';
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startHour, startMin, 0, 0);
    
    const endDate = new Date(startDate.getTime() + (hours * 60 * 60 * 1000));
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const isTimeSlotAvailable = (startTime: string, endTime: string, equipmentCode: string) => {
    // This would check against existing reservations in a real app
    // For now, we'll just validate the time range
    if (!startTime || !endTime) return false;
    
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    
    // Validate operating hours
    if (startHour < 12 || (endHour > 0 && endHour < 12 && endTime !== "00:00")) {
      return false;
    }
    
    return true;
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
                value={formData.equipmentCode}
                onValueChange={(value) => setFormData({...formData, equipmentCode: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un equipo disponible" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.filter(eq => eq.status === 'available').map((eq) => (
                    <SelectItem key={eq.code} value={eq.code}>
                      {eq.code} - {eq.name}
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
                  onChange={(e) => setFormData({...formData, reservationDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) => setFormData({...formData, startTime: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona hora de inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeSlots().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
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
                    {getAvailableHours().map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour} {hour === 1 ? 'hora' : 'horas'}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
              {formData.startTime && getMaxHoursForTime(formData.startTime, formData.reservationDate) === 0 && (
                <p className="text-sm text-destructive">
                  Esta hora ya no está disponible para hoy
                </p>
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