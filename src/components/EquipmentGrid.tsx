import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Gamepad2, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Equipment {
  id: string;
  code: string;
  type: 'PC' | 'CONSOLE';
  name: string;
  status: 'available' | 'occupied' | 'reserved_pending' | 'reserved_confirmed';
  occupiedUntil?: string;
  currentPlayer?: string;
}

interface EquipmentGridProps {
  equipment: Equipment[];
  onSelect?: (equipment: Equipment) => void;
  onOccupy?: (id: string) => void;
  onLiberate?: (id: string) => void;
  onExtend?: (id: string, minutes: number) => void;
  isAdmin?: boolean;
  selectedEquipment?: string;
}

const statusConfig = {
  available: {
    label: "Disponible",
    className: "status-available",
    bgClass: "bg-status-available/10 border-status-available/30"
  },
  occupied: {
    label: "Ocupado Local",
    className: "status-occupied",
    bgClass: "bg-status-occupied/10 border-status-occupied/30"
  },
  reserved_pending: {
    label: "Reserva Pendiente",
    className: "status-pending",
    bgClass: "bg-status-pending/10 border-status-pending/30"
  },
  reserved_confirmed: {
    label: "Reservado",
    className: "status-reserved",
    bgClass: "bg-status-reserved/10 border-status-reserved/30"
  }
};

const EquipmentGrid = ({ 
  equipment, 
  onSelect, 
  onOccupy, 
  onLiberate, 
  onExtend, 
  isAdmin = false,
  selectedEquipment 
}: EquipmentGridProps) => {
  const handleSelect = (eq: Equipment) => {
    if (eq.status === 'available' && onSelect) {
      onSelect(eq);
    }
  };

  const pcs = equipment.filter(item => item.type === 'PC');
  const consoles = equipment.filter(item => item.type === 'CONSOLE');

  const renderEquipmentCard = (eq: Equipment) => {
    const config = statusConfig[eq.status];
    const isSelected = selectedEquipment === eq.code;
    
    return (
      <Card 
        key={eq.id}
        className={cn(
          "cursor-pointer transition-all duration-300 hover:scale-[1.02]",
          config.bgClass,
          isSelected && "ring-2 ring-primary",
          eq.status === 'available' && "modern-border"
        )}
        onClick={() => handleSelect(eq)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {eq.type === 'PC' ? (
                <Monitor className="h-5 w-5 text-primary" />
              ) : (
                <Gamepad2 className="h-5 w-5 text-primary" />
              )}
              <span className="font-bold text-primary">{eq.code}</span>
            </div>
            <Badge variant="outline" className={config.className}>
              {config.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <div className="font-medium">{eq.name}</div>
            {eq.occupiedUntil && (
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                <span>Hasta: {eq.occupiedUntil}</span>
              </div>
            )}
            {eq.currentPlayer && (
              <div className="flex items-center gap-1 mt-1">
                <Users className="h-3 w-3" />
                <span>{eq.currentPlayer}</span>
              </div>
            )}
          </div>
          
          {isAdmin && (
            <div className="flex gap-2 flex-wrap">
              {eq.status === 'available' && (
                <Button 
                  variant="admin" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOccupy?.(eq.id);
                  }}
                >
                  Ocupar
                </Button>
              )}
              
              {(eq.status === 'occupied' || eq.status === 'reserved_confirmed') && (
                <>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLiberate?.(eq.id);
                    }}
                  >
                    Liberar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExtend?.(eq.id, 30);
                    }}
                  >
                    +30min
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEquipmentSection = (items: Equipment[], title: string, icon: string) => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary flex items-center justify-center gap-2">
          <span className="text-2xl">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(renderEquipmentCard)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {renderEquipmentSection(pcs, 'PCs Gaming', '💻')}
      {renderEquipmentSection(consoles, 'Consolas', '🎮')}
    </div>
  );
};

export default EquipmentGrid;