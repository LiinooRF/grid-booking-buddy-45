import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_date: string;
  is_group_event: boolean;
  max_participants?: number;
  status: 'active' | 'inactive' | 'completed';
  participant_count?: number;
}

interface EventsListProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  selectedEventId?: string;
}

export default function EventsList({ events, onEventSelect, selectedEventId }: EventsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'completed':
        return 'Completado';
      default:
        return 'Desconocido';
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No hay eventos disponibles.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card 
          key={event.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedEventId === event.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onEventSelect(event)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.event_date), "PPP", { locale: es })}
                  </div>
                  <div className="flex items-center gap-1">
                    {event.is_group_event ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    {event.is_group_event ? 'Grupal' : 'Individual'}
                  </div>
                  {event.max_participants && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Max: {event.max_participants}
                    </div>
                  )}
                </div>
              </div>
              <Badge className={getStatusColor(event.status)}>
                {getStatusText(event.status)}
              </Badge>
            </div>
          </CardHeader>
          
          {(event.description || event.image_url) && (
            <CardContent>
              {event.image_url && (
                <div className="mb-3">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {event.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {event.description}
                </p>
              )}
              
              <div className="flex justify-between items-center">
                {event.participant_count !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    {event.participant_count} inscrito{event.participant_count !== 1 ? 's' : ''}
                  </span>
                )}
                <Button 
                  variant={event.status === 'active' ? 'default' : 'secondary'}
                  size="sm"
                  disabled={event.status !== 'active'}
                >
                  {event.status === 'active' ? 'Inscribirse' : 'No Disponible'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}