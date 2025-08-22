import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";

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

interface EventRegistrationFormProps {
  event: Event;
  onSubmit: (registrationData: {
    participant_name: string;
    participant_phone: string;
    participant_email: string;
    group_name?: string;
    notes?: string;
  }) => void;
}

export default function EventRegistrationForm({ event, onSubmit }: EventRegistrationFormProps) {
  const [participantName, setParticipantName] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [groupName, setGroupName] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!participantName.trim() || !participantPhone.trim() || !participantEmail.trim()) {
      return;
    }

    const registrationData = {
      participant_name: participantName.trim(),
      participant_phone: participantPhone.trim(),
      participant_email: participantEmail.trim(),
      group_name: event.is_group_event ? groupName.trim() : undefined,
      notes: notes.trim() || undefined
    };

    onSubmit(registrationData);

    // Reset form
    setParticipantName('');
    setParticipantPhone('');
    setParticipantEmail('');
    setGroupName('');
    setNotes('');
  };

  if (event.status !== 'active') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Este evento no está disponible para inscripciones.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {event.is_group_event ? (
            <Users className="h-5 w-5" />
          ) : (
            <UserPlus className="h-5 w-5" />
          )}
          Inscribirse al Evento
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Completa el formulario para inscribirte a: <strong>{event.title}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="participantName">
                {event.is_group_event ? 'Nombre del Representante *' : 'Nombre Completo *'}
              </Label>
              <Input
                id="participantName"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            {event.is_group_event && (
              <div className="space-y-2">
                <Label htmlFor="groupName">Nombre del Grupo/Equipo</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Nombre de tu grupo o equipo"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="participantPhone">Teléfono *</Label>
              <Input
                id="participantPhone"
                type="tel"
                value={participantPhone}
                onChange={(e) => setParticipantPhone(e.target.value)}
                placeholder="+56 9 1234 5678"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participantEmail">Email *</Label>
              <Input
                id="participantEmail"
                type="email"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Comentarios Adicionales</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cualquier información adicional..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            Inscribirse al Evento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}