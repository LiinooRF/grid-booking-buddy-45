import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, CreditCard, Clock, Users } from "lucide-react";

interface Plan {
  id: string;
  category: string;
  name: string;
  includes: string;
  price: number;
}

interface Equipment {
  code: string;
  name: string;
  type: 'PC' | 'CONSOLE';
  status: string;
}

interface ReservationFormProps {
  plans: Plan[];
  equipment: Equipment[];
  selectedEquipment?: string;
  onSubmit: (data: any) => void;
}

const ReservationForm = ({ plans, equipment, selectedEquipment, onSubmit }: ReservationFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    alias: '',
    phone: '',
    email: '',
    equipmentCode: selectedEquipment || '',
    planId: '',
    receipt: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableEquipment = equipment.filter(eq => eq.status === 'available');
  const selectedPlan = plans.find(p => p.id === formData.planId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Archivo muy grande",
          description: "El archivo debe ser menor a 5MB",
          variant: "destructive"
        });
        return;
      }
      setFormData(prev => ({ ...prev, receipt: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.alias || !formData.phone || !formData.email || 
        !formData.equipmentCode || !formData.planId || !formData.receipt) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos y sube el comprobante",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      toast({
        title: "Reserva enviada",
        description: "Tu reserva está en revisión. Te contactaremos pronto.",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        fullName: '',
        alias: '',
        phone: '',
        email: '',
        equipmentCode: '',
        planId: '',
        receipt: null
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la reserva. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedPlans = plans.reduce((acc, plan) => {
    if (!acc[plan.category]) acc[plan.category] = [];
    acc[plan.category].push(plan);
    return acc;
  }, {} as Record<string, Plan[]>);

  return (
    <Card className="bg-gaming-surface border-gaming-border">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Nueva Reserva
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Tu nombre completo"
                className="bg-gaming-bg border-gaming-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alias">Usuario Gaming *</Label>
              <Input
                id="alias"
                value={formData.alias}
                onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
                placeholder="Tu alias en el cyber"
                className="bg-gaming-bg border-gaming-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+56 9 1234 5678"
                className="bg-gaming-bg border-gaming-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu@email.com"
                className="bg-gaming-bg border-gaming-border"
              />
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipo *</Label>
            <Select 
              value={formData.equipmentCode} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, equipmentCode: value }))}
            >
              <SelectTrigger className="bg-gaming-bg border-gaming-border">
                <SelectValue placeholder="Selecciona un equipo disponible" />
              </SelectTrigger>
              <SelectContent>
                {availableEquipment.map((eq) => (
                  <SelectItem key={eq.code} value={eq.code}>
                    {eq.code} - {eq.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plan Selection */}
          <div className="space-y-4">
            <Label>Plan de Gaming *</Label>
            <div className="grid gap-4">
              {Object.entries(groupedPlans).map(([category, categoryPlans]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">{category}</h3>
                  <div className="grid gap-2">
                    {categoryPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.planId === plan.id 
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                            : 'border-gaming-border bg-gaming-bg hover:border-gaming-accent'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, planId: plan.id }))}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{plan.name}</h4>
                            <p className="text-sm text-muted-foreground">{plan.includes}</p>
                          </div>
                          <Badge variant="outline" className="text-primary">
                            ${plan.price.toLocaleString()} CLP
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <Card className="bg-gaming-bg border-gaming-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Información de Pago</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Método:</strong> Transferencia Bancaria</p>
                <p><strong>Titular:</strong> Gaming Grid</p>
                <p><strong>Banco:</strong> Banco Estado</p>
                <p><strong>Tipo:</strong> Cuenta Vista</p>
                <p><strong>Número:</strong> 90278363871</p>
              </div>
              
              {selectedPlan && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <p className="font-semibold text-primary">
                    Total a transferir: ${selectedPlan.price.toLocaleString()} CLP
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt">Comprobante de Transferencia *</Label>
            <div className="border-2 border-dashed border-gaming-border rounded-lg p-6 text-center">
              <input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="receipt" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {formData.receipt ? formData.receipt.name : "Haz clic para subir tu comprobante"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Imagen hasta 5MB (JPG, PNG, etc.)
                </p>
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="gaming" 
            size="lg" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              'Enviar Reserva'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;