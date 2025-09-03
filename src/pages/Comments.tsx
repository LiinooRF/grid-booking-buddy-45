import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CommentsAdminPanel from "@/components/CommentsAdminPanel";
import { MessageSquare, ThumbsUp, ThumbsDown, Lightbulb, Shield, MessageCircle, Mail } from "lucide-react";

interface Comment {
  id: string;
  name: string;
  email: string;
  type: 'positive' | 'negative' | 'suggestion';
  message: string;
  games_request?: string;
  created_at: string;
}

export default function Comments() {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<'positive' | 'negative' | 'suggestion'>('positive');
  const [message, setMessage] = useState("");
  const [gamesRequest, setGamesRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments for admin panel
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchComments();
    }
  }, [isAdminAuthenticated]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setComments((data || []).map(item => ({
        ...item,
        type: item.type as 'positive' | 'negative' | 'suggestion'
      })));
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los comentarios",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            name,
            email,
            type,
            message,
            games_request: gamesRequest || null
          }
        ]);

      if (error) throw error;

      toast({
        title: "¡Comentario enviado!",
        description: "Gracias por tu feedback. Tu comentario ha sido registrado.",
        variant: "default"
      });

      // Reset form
      setName("");
      setEmail("");
      setMessage("");
      setGamesRequest("");
      setType('positive');

      // Refresh comments if admin panel is open
      if (isAdminAuthenticated) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el comentario. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = (password: string) => {
    if (password === 'GamingGrid29!') {
      setIsAdminAuthenticated(true);
      setShowAdminPanel(true);
      toast({
        title: "Acceso concedido",
        description: "Bienvenido al panel de administración",
        variant: "default"
      });
    } else {
      toast({
        title: "Acceso denegado",
        description: "Contraseña incorrecta",
        variant: "destructive"
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado correctamente",
        variant: "default"
      });

      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario",
        variant: "destructive"
      });
    }
  };

  if (showAdminPanel) {
    return (
      <div className="min-h-screen bg-gaming-background text-foreground">
        <SiteHeader current="comentarios" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Panel de Administración - Comentarios</h1>
            <Button 
              variant="outline" 
              onClick={() => setShowAdminPanel(false)}
            >
              ← Volver al formulario
            </Button>
          </div>
          <CommentsAdminPanel
            comments={comments}
            isAuthenticated={isAdminAuthenticated}
            onLogin={handleAdminLogin}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-background text-foreground">
      <SiteHeader current="comentarios" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Comparte tu Experiencia</h1>
            <p className="text-lg text-muted-foreground">
              Tu opinión es muy importante para nosotros. Cuéntanos cómo fue tu experiencia en Gaming Grid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <ThumbsUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">Experiencia Positiva</h3>
                <p className="text-muted-foreground">
                  ¿Te gustó nuestro servicio? Comparte lo que más te agradó.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <ThumbsDown className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-semibold mb-2">Experiencia Negativa</h3>
                <p className="text-muted-foreground">
                  ¿Algo no estuvo bien? Ayúdanos a mejorar contándonos qué pasó.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Formulario de Comentarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Tipo de comentario *</Label>
                  <RadioGroup 
                    value={type} 
                    onValueChange={(value) => setType(value as 'positive' | 'negative' | 'suggestion')}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="positive" id="positive" />
                      <Label htmlFor="positive" className="flex items-center gap-2 cursor-pointer">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        Experiencia Positiva
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="negative" id="negative" />
                      <Label htmlFor="negative" className="flex items-center gap-2 cursor-pointer">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        Experiencia Negativa
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="suggestion" id="suggestion" />
                      <Label htmlFor="suggestion" className="flex items-center gap-2 cursor-pointer">
                        <Lightbulb className="h-4 w-4 text-blue-500" />
                        Sugerencia
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tu comentario *</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos sobre tu experiencia..."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="games" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    ¿Hay algún juego que te gustaría que agreguemos? (Opcional)
                  </Label>
                  <Textarea
                    id="games"
                    value={gamesRequest}
                    onChange={(e) => setGamesRequest(e.target.value)}
                    placeholder="Sugiérenos nuevos juegos que te gustaría jugar..."
                    className="min-h-[80px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="gaming" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Comentario"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Admin Panel Access */}
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAdminPanel(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Shield className="h-4 w-4 mr-2" />
              Panel de Administración
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gaming-border bg-gaming-surface/30 mt-8">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-primary">¿Necesitas ayuda?</h3>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
                <a 
                  href="https://wa.me/56978414767" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp: +56 9 7841 4767</span>
                </a>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <a 
                  href="mailto:TheGridChile@gmail.com"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>TheGridChile@gmail.com</span>
                </a>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <a 
                  href="https://discord.gg/sjkY4mVGnc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#5865F2] hover:text-[#4752C4] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Discord</span>
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                Gaming Grid - Antonio Varas 1347, LOCAL 106, Providencia.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}