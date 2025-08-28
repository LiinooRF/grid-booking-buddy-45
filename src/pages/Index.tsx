import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SiteHeader from "@/components/SiteHeader";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Cpu, HardDrive, Monitor, Zap } from "lucide-react";
import logoGrid from "@/assets/logo-grid.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current="home" />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${logoGrid})`,
          }}
        />
        {/* Overlay opaco */}
        <div className="absolute inset-0 bg-black/70" />
        
        {/* Contenido del hero */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
            GAMING <span className="text-primary">GRID</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            La experiencia de gaming definitiva con equipos de última generación
          </p>
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-black font-bold px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/25"
            onClick={() => navigate('/reservas')}
          >
            Hacer Reserva
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* PC Specs Section */}
      <section className="py-20 px-4 bg-gaming-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
              ¿Cuáles son las especificaciones de los <span className="text-primary">PC Gamer</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Nuestros equipos están diseñados para ofrecerte la mejor experiencia de juego con las últimas tecnologías
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU */}
            <Card className="bg-gaming-surface/50 border-gaming-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-white">Procesador</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold text-primary mb-2">Intel Core i7-13700K</h3>
                <p className="text-muted-foreground">16 núcleos, hasta 5.4 GHz</p>
                <p className="text-sm text-muted-foreground mt-2">Máximo rendimiento para gaming y streaming</p>
              </CardContent>
            </Card>

            {/* GPU */}
            <Card className="bg-gaming-surface/50 border-gaming-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Monitor className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-white">Tarjeta Gráfica</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold text-primary mb-2">RTX 4070 Ti</h3>
                <p className="text-muted-foreground">12GB GDDR6X</p>
                <p className="text-sm text-muted-foreground mt-2">Ray Tracing y DLSS 3.0 para máxima calidad</p>
              </CardContent>
            </Card>

            {/* RAM */}
            <Card className="bg-gaming-surface/50 border-gaming-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-white">Memoria RAM</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold text-primary mb-2">32GB DDR5</h3>
                <p className="text-muted-foreground">5600 MHz</p>
                <p className="text-sm text-muted-foreground mt-2">Multitarea sin límites</p>
              </CardContent>
            </Card>

            {/* Storage */}
            <Card className="bg-gaming-surface/50 border-gaming-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <HardDrive className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-white">Almacenamiento</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold text-primary mb-2">1TB NVMe SSD</h3>
                <p className="text-muted-foreground">PCIe Gen 4</p>
                <p className="text-sm text-muted-foreground mt-2">Tiempos de carga ultrarrápidos</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-6">También incluye:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gaming-surface/30 rounded-lg p-6 border border-gaming-border">
                <h4 className="text-lg font-semibold text-primary mb-2">Monitores 4K</h4>
                <p className="text-muted-foreground">144Hz para la experiencia visual perfecta</p>
              </div>
              <div className="bg-gaming-surface/30 rounded-lg p-6 border border-gaming-border">
                <h4 className="text-lg font-semibold text-primary mb-2">Periféricos Gaming</h4>
                <p className="text-muted-foreground">Mouse, teclado y audífonos profesionales</p>
              </div>
              <div className="bg-gaming-surface/30 rounded-lg p-6 border border-gaming-border">
                <h4 className="text-lg font-semibold text-primary mb-2">Internet de Alta Velocidad</h4>
                <p className="text-muted-foreground">Conexión dedicada para gaming online</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Placeholder */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
            Precios <span className="text-primary">Accesibles</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            Planes flexibles que se adaptan a tu estilo de juego
          </p>
          
          {/* Placeholder para tabla de precios */}
          <div className="bg-gaming-surface/30 border border-gaming-border rounded-xl p-12">
            <h3 className="text-xl text-white mb-4">Tabla de Precios</h3>
            <p className="text-muted-foreground">
              Aquí irá la tabla de precios que me enviarás
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gaming-surface/50 border-t border-gaming-border py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src={logoGrid}
              alt="Gaming Grid logo"
              className="h-12 w-auto"
              loading="lazy"
            />
            <div>
              <h3 className="text-xl font-bold">
                <span className="text-white">GAMING</span>{" "}
                <span className="text-primary">GRID</span>
              </h3>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            La mejor experiencia de gaming en equipos de última generación
          </p>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <span>📧 contacto@gaminggrid.cl</span>
            <span>📱 +56 9 1234 5678</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
