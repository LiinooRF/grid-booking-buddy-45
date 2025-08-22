import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarX, Clock, AlertCircle } from "lucide-react";

interface ClosedPlatformProps {
  reason: string;
}

const ClosedPlatform = ({ reason }: ClosedPlatformProps) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gaming-surface to-gaming-dark flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto border-gaming-border bg-gaming-surface/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <CalendarX className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Plataforma Cerrada
          </CardTitle>
          <Badge variant="destructive" className="mx-auto">
            <AlertCircle className="h-4 w-4 mr-2" />
            Cerrado hoy
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="capitalize">{formattedDate}</span>
            </div>
          </div>
          
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h3 className="font-semibold text-red-400 mb-2">Motivo del cierre:</h3>
            <p className="text-sm text-red-300">{reason}</p>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Lo sentimos por los inconvenientes.</p>
            <p>Vuelve mañana para hacer tu reserva.</p>
          </div>
          
          <div className="pt-4 border-t border-gaming-border">
            <p className="text-xs text-muted-foreground">
              Para emergencias, contacta directamente al administrador
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClosedPlatform;