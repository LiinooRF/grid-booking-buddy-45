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
  external_link?: string;
  max_groups?: number;
  participants_per_group?: number;
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
  const [externalLink, setExternalLink] = useState(initialData?.external_link || '');
  const [maxGroups, setMaxGroups] = useState(initialData?.max_groups?.toString() || '');
  const [participantsPerGroup, setParticipantsPerGroup] = useState(initialData?.participants_per_group?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !eventDate) {
      return;
    }

    const eventData: Partial<Event> = {
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl.trim() || undefined,
      event_date: eventDate ? eventDate.toISOString().split('T')[0] : '',
      is_group_event: isGroupEvent,
      max_participants: maxParticipants ? parseInt(maxParticipants) : undefined,
      status: status as 'active' | 'inactive' | 'completed',
      external_link: externalLink.trim() || undefined,
      max_groups: maxGroups ? parseInt(maxGroups) : undefined,
      participants_per_group: participantsPerGroup ? parseInt(participantsPerGroup) : undefined
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
      setExternalLink('');
      setMaxGroups('');
      setParticipantsPerGroup('');
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>
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
              <Label htmlFor="description">Descripción del Evento</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe los detalles del evento, reglas, premios, etc..."
                rows={4}
              />
            </div>
          </div>

          {/* URLs y Enlaces */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enlaces del Evento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="externalLink">Enlace de Inscripción</Label>
                <Input
                  id="externalLink"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://forms.google.com/..."
                  type="url"
                />
              </div>
            </div>
          </div>

          {/* Configuración de Participantes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuración de Participantes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isGroupEvent"
                    checked={isGroupEvent}
                    onChange={(e) => setIsGroupEvent(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isGroupEvent">Evento Grupal</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Estado del Evento</Label>
                <Select value={status} onValueChange={(value: 'active' | 'inactive' | 'completed') => setStatus(value)}>
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

            {/* Lógica condicional para tipo de evento */}
            {isGroupEvent ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="participantsPerGroup">Participantes por Grupo</Label>
                  <Input
                    id="participantsPerGroup"
                    type="number"
                    value={participantsPerGroup}
                    onChange={(e) => {
                      setParticipantsPerGroup(e.target.value);
                      // Auto-calcular max_participants si se tienen ambos valores
                      if (maxGroups && e.target.value) {
                        setMaxParticipants((parseInt(maxGroups) * parseInt(e.target.value)).toString());
                      }
                    }}
                    placeholder="ej: 5"
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxGroups">Máximo de Grupos</Label>
                  <Input
                    id="maxGroups"
                    type="number"
                    value={maxGroups}
                    onChange={(e) => {
                      setMaxGroups(e.target.value);
                      // Auto-calcular max_participants si se tienen ambos valores
                      if (participantsPerGroup && e.target.value) {
                        setMaxParticipants((parseInt(participantsPerGroup) * parseInt(e.target.value)).toString());
                      }
                    }}
                    placeholder="ej: 8"
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Total Participantes</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    placeholder="Calculado automáticamente"
                    min="1"
                    className="bg-muted/50"
                    readOnly
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  placeholder="Número máximo de participantes individuales"
                  min="1"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3">
            {isEditing ? 'Actualizar Evento' : 'Crear Evento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}