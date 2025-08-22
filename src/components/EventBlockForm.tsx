import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

const eventBlockSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  startTime: z.string().min(1, "La hora de inicio es obligatoria"),
  endDate: z.string().min(1, "La fecha de fin es obligatoria"),
  endTime: z.string().min(1, "La hora de fin es obligatoria"),
  equipmentIds: z.array(z.string()).min(1, "Selecciona al menos un equipo"),
});

type EventBlockForm = z.infer<typeof eventBlockSchema>;

interface Equipment {
  id: string;
  name: string;
  type: string;
}

interface EventBlockFormProps {
  equipment: Equipment[];
  onSuccess?: () => void;
}

export function EventBlockForm({ equipment, onSuccess }: EventBlockFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EventBlockForm>({
    resolver: zodResolver(eventBlockSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      startTime: "15:00",
      endDate: format(new Date(), "yyyy-MM-dd"),
      endTime: "18:00",
      equipmentIds: [],
    },
  });

  const onSubmit = async (data: EventBlockForm) => {
    try {
      setLoading(true);

      // Combinar fecha y hora
      const startDateTime = new Date(`${data.startDate}T${data.startTime}:00`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}:00`);

      // Validar que la fecha de fin sea posterior a la de inicio
      if (endDateTime <= startDateTime) {
        toast({
          title: "Error",
          description: "La fecha y hora de fin debe ser posterior a la de inicio",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("event_blocks").insert({
        title: data.title,
        description: data.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        equipment_ids: data.equipmentIds,
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Bloqueo de evento creado correctamente",
      });

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating event block:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el bloqueo de evento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Bloquear por Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">Crear Bloqueo por Evento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Torneo de FIFA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del evento..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Fecha y Hora de Inicio</h3>
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Inicio</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Fecha y Hora de Fin</h3>
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Fin</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Fin</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="equipmentIds"
              render={() => (
                <FormItem>
                  <FormLabel>Equipos a Bloquear</FormLabel>
                  <FormDescription>
                    Selecciona los equipos que no estarán disponibles durante el evento
                  </FormDescription>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                    {equipment.map((eq) => (
                      <FormField
                        key={eq.id}
                        control={form.control}
                        name="equipmentIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={eq.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(eq.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, eq.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== eq.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  {eq.name}
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  {eq.type}
                                </p>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Bloqueo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}