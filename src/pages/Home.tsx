import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Monitor, Gamepad2, Clock, Users, Calendar, ArrowRight } from "lucide-react";
import gamingHero from "@/assets/gaming-hero.jpg";

const Home = () => {
  useEffect(() => {
    // SEO basics
    document.title = "Inicio | Gaming Grid";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Inicio de Gaming Grid: reserva PCs y consolas y descubre eventos de eSports."
      );
    } else {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      m.setAttribute(
        "content",
        "Inicio de Gaming Grid: reserva PCs y consolas y descubre eventos de eSports."
      );
      document.head.appendChild(m);
    }
    // Canonical
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    const canonicalHref = window.location.origin + "/";
    if (existingCanonical) {
      existingCanonical.setAttribute("href", canonicalHref);
    } else {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      link.setAttribute("href", canonicalHref);
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gaming-background text-foreground">
      <SiteHeader current="home" />
      
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${gamingHero})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Bienvenido a <span className="text-primary">Gaming Grid</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            El mejor centro de gaming con PCs de alta gama, consolas de última generación y eventos épicos de eSports.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/reservas">
              <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-black shadow-lg">
                Reservar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/eventos">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-white/30 bg-white/10 text-white hover:bg-white/20">
                Ver Eventos
                <Calendar className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Especificaciones PC Section */}
      <section className="py-20 bg-gaming-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Cuáles son las especificaciones de los <span className="text-primary">PC Gamer</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Nuestros equipos están equipados con la última tecnología para ofrecerte la mejor experiencia de gaming.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gaming-surface border-gaming-border hover:border-primary/50 transition-colors duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Cpu className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Procesador</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="border-primary/50 text-primary">AMD Ryzen 7 5800X</Badge>
                  <p className="text-sm text-muted-foreground">8 núcleos, 16 hilos @ 3.8GHz</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gaming-surface border-gaming-border hover:border-primary/50 transition-colors duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Monitor className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Tarjeta Gráfica</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="border-primary/50 text-primary">RTX 4070 Super</Badge>
                  <p className="text-sm text-muted-foreground">12GB GDDR6X VRAM</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gaming-surface border-gaming-border hover:border-primary/50 transition-colors duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <HardDrive className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Memoria RAM</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="border-primary/50 text-primary">32GB DDR4</Badge>
                  <p className="text-sm text-muted-foreground">3200MHz RGB Gaming</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gaming-surface border-gaming-border hover:border-primary/50 transition-colors duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Gamepad2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Periféricos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="border-primary/50 text-primary">Gaming Pro</Badge>
                  <p className="text-sm text-muted-foreground">Teclado mecánico RGB, Mouse gaming</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Precios Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nuestros <span className="text-primary">Precios</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tarifas competitivas para que disfrutes al máximo de nuestros equipos gaming.
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gaming Sessions */}
              <Card className="bg-gaming-surface border-gaming-border hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Sesiones Gaming</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>1 Hora</span>
                    <Badge variant="outline" className="border-primary/50 text-primary">$5,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>3 Horas</span>
                    <Badge variant="outline" className="border-primary/50 text-primary">$10,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pase Completo</span>
                    <Badge variant="outline" className="border-primary/50 text-primary">$20,000</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Gaming Packages */}
              <Card className="bg-gaming-surface border-gaming-border hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Paquetes Gaming</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block">Starter Boost</span>
                      <span className="text-sm text-muted-foreground">5 horas</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">$15,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block">XP Pack</span>
                      <span className="text-sm text-muted-foreground">10 horas</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">$26,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block">Level Up</span>
                      <span className="text-sm text-muted-foreground">25 horas</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">$50,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block">Elite Pass</span>
                      <span className="text-sm text-muted-foreground">50 horas</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">$90,000</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Combo Deals */}
              <Card className="bg-gaming-surface border-gaming-border hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Combos Especiales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block">Gamer Snack Pack</span>
                      <span className="text-sm text-muted-foreground">1hr + bebida + snack</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">$7,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block">AFK Combo</span>
                      <span className="text-sm text-muted-foreground">1hr + bebida + snack + 2 refill</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">$12,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block">Duo Pack</span>
                      <span className="text-sm text-muted-foreground">2hrs + snack + bebida x persona</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">$14,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block">Full Day Fuel</span>
                      <span className="text-sm text-muted-foreground">Pase + 2 snacks + 2 bebidas</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">$25,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block">Power Boost</span>
                      <span className="text-sm text-muted-foreground">4hrs + bebida + snack + refill</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">$18,000</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Adicionales */}
              <Card className="bg-gaming-surface border-gaming-border hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Adicionales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Snack</span>
                    <Badge variant="outline" className="border-primary/50 text-primary">$2,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Bebida</span>
                    <Badge variant="outline" className="border-primary/50 text-primary">$2,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Café</span>
                    <Badge variant="outline" className="border-primary/50 text-primary">$2,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Persona Adicional</span>
                    <Badge variant="outline" className="border-primary/50 text-primary">$3,000</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Torneos */}
              <Card className="bg-gaming-surface border-gaming-border hover:border-primary/50 transition-colors duration-300 md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Torneos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Entrada a Torneo</span>
                      <Badge variant="outline" className="border-primary/50 text-primary text-lg px-4 py-2">$20,000</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Incluye entrada al torneo y grandes premios para el ganador
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Link to="/reservas">
                <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-black shadow-lg">
                  <Users className="mr-2 h-5 w-5" />
                  Reservar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gaming-surface border-t border-gaming-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Gaming Grid. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
