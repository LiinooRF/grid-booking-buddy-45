import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Monitor, Gamepad2, Users, Calendar, ArrowRight, MessageCircle, Mail } from "lucide-react";
import gamingHero from "@/assets/gaming-hero.jpg";

const Home = () => {
  useEffect(() => {
    // SEO completo
    document.title = "Gaming Grid - Centro de Gaming con PCs Gamer y Consolas | Reserva Online";
    
    // Meta description optimizada
    const metaDesc = document.querySelector('meta[name="description"]');
    const description = "Centro de gaming premium con PCs gamer de alta gama, consolas PS5 y Xbox, eventos eSports. Reserva online tu sesión gaming. Tarifas desde $5.000/hora.";
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
    const keywords = "gaming center, pc gamer, consolas, reservas online, esports, gaming santiago, centro gaming, ps5, xbox, rtx 4070";
    if (existingKeywords) {
      existingKeywords.setAttribute("content", keywords);
    } else {
      const kw = document.createElement("meta");
      kw.setAttribute("name", "keywords");
      kw.setAttribute("content", keywords);
      document.head.appendChild(kw);
    }

    // Open Graph meta tags
    const setOGTag = (property: string, content: string) => {
      const existing = document.querySelector(`meta[property="${property}"]`);
      if (existing) {
        existing.setAttribute("content", content);
      } else {
        const tag = document.createElement("meta");
        tag.setAttribute("property", property);
        tag.setAttribute("content", content);
        document.head.appendChild(tag);
      }
    };

    setOGTag("og:title", "Gaming Grid - Centro de Gaming Premium");
    setOGTag("og:description", description);
    setOGTag("og:type", "website");
    setOGTag("og:url", window.location.href);
    setOGTag("og:site_name", "Gaming Grid");

    // Twitter Card meta tags
    const setTwitterTag = (name: string, content: string) => {
      const existing = document.querySelector(`meta[name="${name}"]`);
      if (existing) {
        existing.setAttribute("content", content);
      } else {
        const tag = document.createElement("meta");
        tag.setAttribute("name", name);
        tag.setAttribute("content", content);
        document.head.appendChild(tag);
      }
    };

    setTwitterTag("twitter:card", "summary_large_image");
    setTwitterTag("twitter:title", "Gaming Grid - Centro de Gaming Premium");
    setTwitterTag("twitter:description", description);

    // Canonical URL
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

    // JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Gaming Grid",
      "description": "Centro de gaming con PCs gamer de alta gama y consolas",
      "url": window.location.origin,
      "priceRange": "$5000-$90000",
      "serviceType": "Gaming Center",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Servicios Gaming",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Sesión Gaming 1 Hora",
              "description": "Una hora de gaming en PC de alta gama"
            },
            "price": "5000",
            "priceCurrency": "CLP"
          }
        ]
      }
    };

    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.textContent = JSON.stringify(structuredData);
    } else {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gaming-background text-foreground">
      <SiteHeader current="home" />
      
      {/* Hero Section - Mejorado visualmente */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${gamingHero})` }}
      >
        {/* Overlay con gradiente más dramático */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-primary/20" />
        
        {/* Efectos de partículas/luces */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gaming-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-500" />
        </div>
        
        {/* Contenido principal con animaciones mejoradas */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-primary to-gaming-accent bg-clip-text text-transparent animate-scale-in">
              Gaming <span className="text-primary drop-shadow-2xl">Grid</span>
            </h1>
            
            <div className="relative">
              <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto font-medium leading-relaxed">
                El <span className="text-primary font-bold">centro gaming más avanzado</span> de Chile con PCs RTX 4070, consolas next-gen y la mejor experiencia eSports.
              </p>
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-gaming-accent/10 blur-xl rounded-lg"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
              <Link to="/reservas" className="group">
                <Button size="lg" className="relative px-10 py-6 text-xl font-bold bg-gradient-to-r from-primary to-gaming-accent hover:from-primary/90 hover:to-gaming-accent/90 text-black shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Reservar Ahora
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gaming-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
              
              <Link to="/eventos" className="group">
                <Button variant="outline" size="lg" className="px-10 py-6 text-xl border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm hover:border-primary transition-all duration-300 rounded-xl transform hover:scale-105 shadow-xl">
                  <Calendar className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Ver Eventos
                </Button>
              </Link>
            </div>
            
            {/* Stats/badges mejorados */}
            <div className="flex flex-wrap justify-center gap-4 mt-16">
              <Badge variant="outline" className="px-6 py-3 text-lg border-primary/50 bg-primary/10 text-primary backdrop-blur-sm">
                <Cpu className="mr-2 h-5 w-5" />
                RTX 5070 Gaming PCs
              </Badge>
              <Badge variant="outline" className="px-6 py-3 text-lg border-gaming-accent/50 bg-gaming-accent/10 text-gaming-accent backdrop-blur-sm">
                <Monitor className="mr-2 h-5 w-5" />
                280 Hz Monitors
              </Badge>
              <Badge variant="outline" className="px-6 py-3 text-lg border-white/50 bg-white/10 text-white backdrop-blur-sm">
                <Gamepad2 className="mr-2 h-5 w-5" />
                PS5 & Nintendo Switch 2
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Efecto de scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-16 bg-gradient-to-b from-primary to-transparent rounded-full"></div>
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
                  <Badge variant="outline" className="border-primary/50 text-primary">Intel Core i5 14400F</Badge>
                  <p className="text-sm text-muted-foreground">10 núcleos, 16 hilos @ 2.5GHz</p>
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
                  <Badge variant="outline" className="border-primary/50 text-primary">MSI GeForce RTX 5070 12GB</Badge>
                  <p className="text-sm text-muted-foreground">12GB GDDR6 VRAM</p>
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
                  <Badge variant="outline" className="border-primary/50 text-primary">32GB DDR5</Badge>
                  <p className="text-sm text-muted-foreground">Alta velocidad gaming</p>
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
                <div className="space-y-3">
                  <div className="flex flex-col space-y-1">
                    <Badge variant="outline" className="border-primary/50 text-primary w-fit">HyperX Cloud III</Badge>
                    <span className="text-xs text-muted-foreground">Auriculares gaming</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge variant="outline" className="border-primary/50 text-primary w-fit">Monitor Legion 280Hz 27"</Badge>
                    <span className="text-xs text-muted-foreground">Monitor gaming</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge variant="outline" className="border-primary/50 text-primary w-fit">Razer DeathAdder Essential</Badge>
                    <span className="text-xs text-muted-foreground">Mouse gaming</span>
                  </div>
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

      {/* Discord Community Section - Mejorado */}
      <section className="py-24 bg-gradient-to-br from-gaming-surface/40 via-background to-gaming-surface/20 relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#5865F2]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="bg-gaming-surface/80 border-gaming-border border-2 rounded-3xl p-12 hover:border-primary/50 transition-all duration-500 backdrop-blur-sm shadow-2xl transform hover:scale-[1.02]">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white via-[#5865F2] to-primary bg-clip-text text-transparent">
                  ¡Únete a nuestra comunidad en <span className="text-[#5865F2] drop-shadow-lg">Discord</span>!
                </h2>
                
                <p className="text-muted-foreground text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
                  Conecta con otros gamers, participa en <span className="text-primary font-semibold">eventos exclusivos</span>, torneos emocionantes y comparte estrategias con jugadores de todo Chile. ¡Forma parte de la familia Gaming Grid!
                </p>
                
                <a 
                  href="https://discord.gg/sjkY4mVGnc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-block"
                >
                  <Button size="lg" className="relative px-12 py-6 text-xl font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      <MessageCircle className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                      Unirse al Discord
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4752C4] to-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer igual que en otras páginas */}
      <footer className="bg-gaming-surface/80 border-t border-gaming-border py-8">
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
  );
};

export default Home;
