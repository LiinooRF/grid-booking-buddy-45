import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, Image, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  start_time?: string;
  end_time?: string;
}

interface EventFormProps {
  onSubmit: (eventData: Partial<Event>) => void;
  initialData?: Partial<Event>;
  isEditing?: boolean;
}

export default function EventForm({ onSubmit, initialData, isEditing = false }: EventFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [eventDate, setEventDate] = useState<Date | undefined>(
    initialData?.event_date ? new Date(initialData.event_date) : undefined
  );
  const [isGroupEvent, setIsGroupEvent] = useState(initialData?.is_group_event || false);
  const [maxParticipants, setMaxParticipants] = useState(initialData?.max_participants?.toString() || '');
  const [status, setStatus] = useState(initialData?.status || 'active');
  const [externalLink, setExternalLink] = useState(initialData?.external_link || '');
  const [maxGroups, setMaxGroups] = useState(initialData?.max_groups?.toString() || '');
  const [participantsPerGroup, setParticipantsPerGroup] = useState(initialData?.participants_per_group?.toString() || '');
  const [startTime, setStartTime] = useState(initialData?.start_time || '19:00');
  const [endTime, setEndTime] = useState(initialData?.end_time || '23:00');

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error al subir imagen",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error al subir imagen",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error de archivo",
          description: "Por favor selecciona una imagen válida",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error de archivo",
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setImageFile(file);
      setImageUrl(''); // Clear URL input when file is selected
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !eventDate) {
      return;
    }

    let finalImageUrl = imageUrl;

    // Upload image if file is selected
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        return; // Stop if upload failed
      }
    }

    const eventData: Partial<Event> = {
      title: title.trim(),
      description: description.trim(),
      image_url: finalImageUrl.trim() || undefined,
      event_date: eventDate ? eventDate.toISOString().split('T')[0] : '',
      is_group_event: isGroupEvent,
      max_participants: maxParticipants ? parseInt(maxParticipants) : undefined,
      status: status as 'active' | 'inactive' | 'completed',
      external_link: externalLink.trim() || undefined,
      max_groups: maxGroups ? parseInt(maxGroups) : undefined,
      participants_per_group: participantsPerGroup ? parseInt(participantsPerGroup) : undefined,
      start_time: startTime,
      end_time: endTime
    };

    onSubmit(eventData);

    // Reset form if not editing
    if (!isEditing) {
      setTitle('');
      setDescription('');
      setImageUrl('');
      setImageFile(null);
      setEventDate(undefined);
      setIsGroupEvent(false);
      setMaxParticipants('');
      setStatus('active');
      setExternalLink('');
      setMaxGroups('');
      setParticipantsPerGroup('');
      setStartTime('19:00');
      setEndTime('23:00');
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

          {/* Imagen del Evento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Imagen del Evento</h3>
            
            {/* Preview de imagen */}
            {(imageUrl || imageFile) && (
              <div className="relative w-full max-w-md mx-auto">
                <img 
                  src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} 
                  alt="Preview del evento" 
                  className="w-full h-48 object-cover rounded-lg border border-gaming-border"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImageFile(null);
                    setImageUrl('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subir archivo */}
              <div className="space-y-2">
                <Label htmlFor="imageFile">Subir Imagen</Label>
                <div className="relative">
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/90"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF
                </p>
              </div>

              {/* O URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">O URL de Imagen</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageFile(null); // Clear file when URL is entered
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  type="url"
                  disabled={!!imageFile || uploading}
                />
              </div>
            </div>
          </div>

          {/* Enlaces */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enlaces del Evento</h3>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de Inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de Finalización</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
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

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3" disabled={uploading}>
            {uploading ? 'Subiendo imagen...' : (isEditing ? 'Actualizar Evento' : 'Crear Evento')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}