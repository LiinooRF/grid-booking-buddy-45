import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_date: string;
  is_group_event: boolean;
  max_participants?: number;
  status: 'active' | 'inactive' | 'completed';
}

interface EventFormProps {
  onSubmit: (eventData: Partial<Event>) => void;
  initialData?: Partial<Event>;
  isEditing?: boolean;
}

export default function EventForm({ onSubmit, initialData, isEditing = false }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [eventDate, setEventDate] = useState<Date | undefined>(
    initialData?.event_date ? new Date(initialData.event_date) : undefined
  );
  const [isGroupEvent, setIsGroupEvent] = useState(initialData?.is_group_event || false);
  const [maxParticipants, setMaxParticipants] = useState(initialData?.max_participants?.toString() || '');
  const [status, setStatus] = useState(initialData?.status || 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !eventDate) {
      return;
    }

    const eventData: Partial<Event> = {
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl.trim() || undefined,
      event_date: eventDate.toISOString().split('T')[0],
      is_group_event: isGroupEvent,
      max_participants: maxParticipants ? parseInt(maxParticipants) : undefined,
      status: status as 'active' | 'inactive' | 'completed'
    };

    onSubmit(eventData);

    // Reset form if not editing
    if (!isEditing) {
      setTitle('');
      setDescription('');
      setImageUrl('');
      setEventDate(undefined);
      setIsGroupEvent(false);
      setMaxParticipants('');
      setStatus('active');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Evento *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Torneo de FIFA 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha del Evento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !eventDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe los detalles del evento..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de la Imagen</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              type="url"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Tipo de Evento</Label>
              <Select value={isGroupEvent.toString()} onValueChange={(value) => setIsGroupEvent(value === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Individual</SelectItem>
                  <SelectItem value="true">Grupal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Máximo Participantes</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="Ej: 20"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as 'active' | 'inactive' | 'completed')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            {isEditing ? 'Actualizar Evento' : 'Crear Evento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}