import { useEffect, useState } from "react";
import { format, addHours, startOfDay, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  maintenance_mode: boolean;
}

interface Reservation {
  id: string;
  equipment_id: string;
  start_time: string;
  end_time: string;
  status: string;
  user_name: string;
}

interface EventBlock {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  equipment_ids: string[];
}

interface ScheduleCalendarProps {
  selectedDate: Date;
}

export function ScheduleCalendar({ selectedDate }: ScheduleCalendarProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [eventBlocks, setEventBlocks] = useState<EventBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Generar horas desde 12:00 PM hasta 12:00 AM (medianoche)
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i === 12 ? 0 : 12 + i; // 12, 13, 14, ..., 23, 0
    return format(addHours(startOfDay(selectedDate), hour), "HH:mm");
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener equipos
      const { data: equipmentData, error: equipmentError } = await supabase
        .from("equipment")
        .select("*")
        .order("name");

      if (equipmentError) throw equipmentError;

      // Obtener reservas del día seleccionado
      const startOfSelectedDay = startOfDay(selectedDate);
      const endOfSelectedDay = addHours(startOfSelectedDay, 24);

      const { data: reservationsData, error: reservationsError } = await supabase
        .from("reservations")
        .select("*")
        .gte("start_time", startOfSelectedDay.toISOString())
        .lt("start_time", endOfSelectedDay.toISOString())
        .in("status", ["pending", "confirmed", "arrived", "active"]);

      if (reservationsError) throw reservationsError;

      // Obtener bloqueos de eventos del día seleccionado
      const { data: eventBlocksData, error: eventBlocksError } = await supabase
        .from("event_blocks")
        .select("*")
        .gte("start_time", startOfSelectedDay.toISOString())
        .lt("end_time", endOfSelectedDay.toISOString());

      if (eventBlocksError) throw eventBlocksError;

      setEquipment(equipmentData || []);
      setReservations(reservationsData || []);
      setEventBlocks(eventBlocksData || []);
    } catch (error) {
      console.error("Error fetching schedule data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el calendario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Suscripción a cambios en tiempo real
    const reservationsChannel = supabase
      .channel("reservations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservations",
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const eventBlocksChannel = supabase
      .channel("event-blocks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_blocks",
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reservationsChannel);
      supabase.removeChannel(eventBlocksChannel);
    };
  }, [selectedDate]);

  const getCellStatus = (equipmentId: string, timeSlot: string) => {
    const [hours, minutes] = timeSlot.split(":").map(Number);
    const cellTime = addHours(startOfDay(selectedDate), hours);
    const cellEndTime = addHours(cellTime, 1);

    // Verificar si hay un bloqueo de evento
    const eventBlock = eventBlocks.find((block) => {
      const blockStart = new Date(block.start_time);
      const blockEnd = new Date(block.end_time);
      return (
        block.equipment_ids.includes(equipmentId) &&
        cellTime < blockEnd &&
        cellEndTime > blockStart
      );
    });

    if (eventBlock) {
      return {
        status: "event",
        title: eventBlock.title,
        description: eventBlock.description,
      };
    }

    // Verificar si hay una reserva
    const reservation = reservations.find((res) => {
      const resStart = new Date(res.start_time);
      const resEnd = new Date(res.end_time);
      return (
        res.equipment_id === equipmentId &&
        cellTime < resEnd &&
        cellEndTime > resStart
      );
    });

    if (reservation) {
      return {
        status: "reserved",
        user: reservation.user_name,
        reservationStatus: reservation.status,
      };
    }

    // Verificar si el equipo está en mantenimiento
    const eq = equipment.find((e) => e.id === equipmentId);
    if (eq?.maintenance_mode) {
      return {
        status: "maintenance",
        title: "Mantenimiento",
      };
    }

    return { status: "available" };
  };

  const getCellClass = (status: string) => {
    switch (status) {
      case "reserved":
        return "bg-gray-400 text-white";
      case "event":
        return "bg-red-500 text-white";
      case "maintenance":
        return "bg-yellow-500 text-black";
      case "available":
      default:
        return "bg-transparent border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Disponibilidad - {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">
          Disponibilidad - {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-200"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400"></div>
            <span>Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span>Evento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500"></div>
            <span>Mantenimiento</span>
          </div>
        </div>

        {/* Tabla de horarios */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-200 p-2 bg-gaming-surface text-left min-w-32">
                  Equipo
                </th>
                {timeSlots.map((time) => (
                  <th
                    key={time}
                    className="border border-gray-200 p-2 bg-gaming-surface text-center min-w-16 text-xs"
                  >
                    {time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => (
                <tr key={eq.id}>
                  <td className="border border-gray-200 p-2 font-medium bg-gaming-surface/30">
                    <div>
                      <div className="text-sm">{eq.name}</div>
                      <div className="text-xs text-muted-foreground">{eq.type}</div>
                    </div>
                  </td>
                  {timeSlots.map((time) => {
                    const cellData = getCellStatus(eq.id, time);
                    return (
                      <td
                        key={`${eq.id}-${time}`}
                        className={`border border-gray-200 p-1 text-center text-xs ${getCellClass(
                          cellData.status
                        )}`}
                        title={
                          cellData.status === "reserved"
                            ? `Reservado por: ${cellData.user}`
                            : cellData.status === "event"
                            ? `Evento: ${cellData.title} - ${cellData.description || ""}`
                            : cellData.status === "maintenance"
                            ? "En mantenimiento"
                            : "Disponible"
                        }
                      >
                        {cellData.status === "reserved" && "R"}
                        {cellData.status === "event" && "E"}
                        {cellData.status === "maintenance" && "M"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}