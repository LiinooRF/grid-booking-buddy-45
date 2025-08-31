import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, User, Star, Gamepad2, Send, ThumbsUp, ThumbsDown, Clock, Mail } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const commentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  rating: z.string().min(1, "Selecciona una calificación"),
  type: z.string().min(1, "Selecciona el tipo de comentario"),
  message: z.string().min(10, "El comentario debe tener al menos 10 caracteres"),
  gameRequest: z.string().optional()
});

type CommentFormData = z.infer<typeof commentSchema>;

interface Comment {
  id: string;
  name: string;
  email?: string;
  rating: number;
  type: 'positive' | 'negative' | 'suggestion' | 'game_request';
  message: string;
  gameRequest?: string;
  createdAt: string;
}

const Comments = () => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: "",
      email: "",
      rating: "",
      type: "",
      message: "",
      gameRequest: ""
    }
  });

  useEffect(() => {
    // SEO para página de comentarios
    document.title = "Comentarios y Sugerencias - Gaming Grid | Comparte tu Experiencia";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    const description = "Comparte tu experiencia en Gaming Grid. Déjanos tus comentarios, calificaciones y sugerencias de juegos. Tu opinión nos ayuda a mejorar.";
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    } else {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      m.setAttribute("content", description);
      document.head.appendChild(m);
    }

    // Keywords meta tag
    const existingKeywords = document.querySelector('meta[name="keywords"]');
    const keywords = "comentarios gaming, sugerencias juegos, experiencia cliente, calificaciones, feedback gaming center";
    if (existingKeywords) {
      existingKeywords.setAttribute("content", keywords);
    } else {
      const kw = document.createElement("meta");
      kw.setAttribute("name", "keywords");
      kw.setAttribute("content", keywords);
      document.head.appendChild(kw);
    }
  }, []);

  const onSubmit = (data: CommentFormData) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email || undefined,
      rating: parseInt(data.rating),
      type: data.type as 'positive' | 'negative' | 'suggestion' | 'game_request',
      message: data.message,
      gameRequest: data.gameRequest || undefined,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [newComment, ...prev]);
    
    toast({
      title: "¡Gracias por tu comentario!",
      description: "Tu opinión es muy importante para nosotros",
    });

    form.reset();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'suggestion': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'game_request': return <Gamepad2 className="h-4 w-4 text-purple-500" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'positive': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Positivo</Badge>;
      case 'negative': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Negativo</Badge>;
      case 'suggestion': return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Sugerencia</Badge>;
      case 'game_request': return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Petición de Juego</Badge>;
      default: return <Badge>Comentario</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gaming-background text-foreground">
      <SiteHeader current="comentarios" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Comparte tu <span className="text-primary">Experiencia</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tu opinión es muy importante para nosotros. Cuéntanos sobre tu experiencia, 
            sugiere mejoras o solicita nuevos juegos para nuestro catálogo.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Formulario */}
          <Card className="bg-gaming-surface border-gaming-border">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                Deja tu Comentario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="tu@email.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calificación</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una calificación" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="5">5 estrellas - Excelente</SelectItem>
                              <SelectItem value="4">4 estrellas - Muy bueno</SelectItem>
                              <SelectItem value="3">3 estrellas - Bueno</SelectItem>
                              <SelectItem value="2">2 estrellas - Regular</SelectItem>
                              <SelectItem value="1">1 estrella - Malo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de comentario</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="positive">Experiencia positiva</SelectItem>
                              <SelectItem value="negative">Experiencia negativa</SelectItem>
                              <SelectItem value="suggestion">Sugerencia de mejora</SelectItem>
                              <SelectItem value="game_request">Petición de juego</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("type") === "game_request" && (
                    <FormField
                      control={form.control}
                      name="gameRequest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Qué juego te gustaría que agreguemos?</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del juego" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tu comentario</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cuéntanos sobre tu experiencia, sugerencias o comentarios..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Comentario
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Lista de comentarios */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Comentarios Recientes</h2>
            
            {comments.length === 0 ? (
              <Card className="bg-gaming-surface/50 border-gaming-border">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Sé el primero en compartir tu experiencia
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id} className="bg-gaming-surface border-gaming-border">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">{comment.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(comment.rating)}
                              <span className="text-sm text-muted-foreground">
                                {comment.rating}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(comment.type)}
                          {getTypeBadge(comment.type)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-3">{comment.message}</p>
                      
                      {comment.gameRequest && (
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-3">
                          <p className="text-sm">
                            <strong className="text-primary">Juego solicitado:</strong> {comment.gameRequest}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(comment.createdAt).toLocaleDateString('es-CL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer igual que en otras páginas */}
      <footer className="bg-gaming-surface/80 border-t border-gaming-border py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm">
              <a 
                href="https://wa.me/56978414767"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
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
            </div>
            <p className="text-xs text-muted-foreground">
              Gaming Grid - Antonio Varas 1347, LOCAL 106, Providencia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Comments;