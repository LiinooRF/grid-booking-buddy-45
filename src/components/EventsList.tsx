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
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Event Image */}
              {event.image_url && (
                <div className="lg:w-1/3">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-48 lg:h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Event Content */}
              <div className={`flex-1 ${!event.image_url ? 'w-full' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {getStatusText(event.status)}
                  </Badge>
                </div>
                
                {/* Event Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.event_date), "PPP", { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {event.is_group_event ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span>{event.is_group_event ? 'Evento Grupal' : 'Evento Individual'}</span>
                  </div>
                  {event.max_participants && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Máximo: {event.max_participants} participantes</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.participant_count || 0} inscritos</span>
                  </div>
                </div>
                
                {/* Action Button */}
                <Button 
                  variant={event.status === 'active' ? 'default' : 'secondary'}
                  size="sm"
                  disabled={event.status !== 'active'}
                  onClick={() => onEventSelect(event)}
                  className="w-full sm:w-auto"
                >
                  {event.status === 'active' ? 'Ver Detalles' : 'No Disponible'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}