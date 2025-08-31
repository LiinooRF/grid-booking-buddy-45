import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Monitor, Gamepad2, Users, Calendar, ArrowRight, Zap, Shield, Wifi, MessageCircle, Mail } from "lucide-react";
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
                  <Badge variant="outline" className="border-primary/50 text-primary">32GB DDR4</Badge>
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

              {/* Servicios Premium */}
              <Card className="bg-gaming-surface border-gaming-border hover:border-primary/50 transition-colors duration-300 md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl text-primary flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Servicios Premium
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Coaching Pro</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">Consultar</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-primary" />
                      <span>Streaming Setup</span>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">Consultar</Badge>
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
