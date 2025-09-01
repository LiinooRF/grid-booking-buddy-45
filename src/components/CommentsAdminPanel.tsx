import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, MessageSquare, ThumbsUp, ThumbsDown, Lightbulb, Download, Search, RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Comment {
  id: string;
  name: string;
  email: string;
  type: 'positive' | 'negative' | 'suggestion';
  message: string;
  games_request?: string;
  created_at: string;
}

interface CommentsAdminPanelProps {
  comments: Comment[];
  isAuthenticated: boolean;
  onLogin: (password: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export default function CommentsAdminPanel({
  comments,
  isAuthenticated,
  onLogin,
  onDeleteComment
}: CommentsAdminPanelProps) {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Panel de Administración - Comentarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña de admin"
                autoFocus
              />
            </div>
            <Button type="submit" variant="gaming" className="w-full">
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Filter comments
  const filteredComments = comments.filter(comment => {
    const matchesType = filterType === 'all' || comment.type === filterType;
    const matchesSearch = !searchTerm || 
      comment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comment.games_request && comment.games_request.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  const getCommentStats = () => {
    const totalComments = comments.length;
    const positiveComments = comments.filter(c => c.type === 'positive').length;
    const negativeComments = comments.filter(c => c.type === 'negative').length;
    const suggestions = comments.filter(c => c.type === 'suggestion').length;

    return { totalComments, positiveComments, negativeComments, suggestions };
  };

  const stats = getCommentStats();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-500';
      case 'negative':
        return 'bg-red-500';
      case 'suggestion':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Fecha', 'Nombre', 'Email', 'Tipo', 'Mensaje', 'Juegos Solicitados'].join(','),
      ...filteredComments.map(c => [
        format(new Date(c.created_at), 'dd/MM/yyyy HH:mm'),
        c.name,
        c.email,
        c.type,
        `"${c.message.replace(/"/g, '""')}"`,
        c.games_request ? `"${c.games_request.replace(/"/g, '""')}"` : ''
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comentarios_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Datos exportados",
      description: "El archivo CSV ha sido descargado",
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gaming-surface border-gaming-border">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comentarios ({filteredComments.length})
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Solicitudes de Juegos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalComments}</div>
                <div className="text-sm text-muted-foreground">Total Comentarios</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-green-500">{stats.positiveComments}</div>
                <div className="text-sm text-muted-foreground">Positivos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-red-500">{stats.negativeComments}</div>
                <div className="text-sm text-muted-foreground">Negativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.suggestions}</div>
                <div className="text-sm text-muted-foreground">Sugerencias</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Buscar en comentarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="positive">Positivos</option>
                  <option value="negative">Negativos</option>
                  <option value="suggestion">Sugerencias</option>
                </select>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterType('all'); }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
                <Button variant="outline" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {filteredComments.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Comentarios Recibidos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Mensaje</TableHead>
                      <TableHead>Juegos</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(comment.created_at), "dd/MM/yyyy", { locale: es })}
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), "HH:mm", { locale: es })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{comment.name}</div>
                            <div className="text-sm text-muted-foreground">{comment.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getTypeColor(comment.type)} text-white flex items-center gap-1 w-fit`}>
                            {getTypeIcon(comment.type)}
                            {comment.type === 'positive' ? 'Positivo' : 
                             comment.type === 'negative' ? 'Negativo' : 'Sugerencia'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm line-clamp-3">{comment.message}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {comment.games_request && (
                            <div className="max-w-xs">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {comment.games_request}
                              </p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-8 text-muted-foreground">
                No hay comentarios que coincidan con los filtros.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Solicitudes de Juegos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.filter(c => c.games_request).length > 0 ? (
                  comments.filter(c => c.games_request).map((comment) => (
                    <Card key={comment.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{comment.name}</h4>
                            <p className="text-sm text-muted-foreground">{comment.email}</p>
                          </div>
                          <Badge variant="outline">
                            {format(new Date(comment.created_at), "dd/MM/yyyy", { locale: es })}
                          </Badge>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-sm">{comment.games_request}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay solicitudes de juegos todavía.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}