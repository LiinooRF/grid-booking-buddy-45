import { MessageCircle, Mail } from "lucide-react";
import logoGrid from "@/assets/logo-grid.png";

const SiteFooter = () => {
  return (
    <footer className="bg-gaming-surface/50 border-t border-gaming-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Logo y Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
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
          <p className="text-muted-foreground">
            La mejor experiencia de gaming en equipos de última generación
          </p>
        </div>

        {/* Contacto */}
        <div className="text-center space-y-4">
          <h4 className="text-lg font-semibold text-primary">¿Necesitas ayuda?</h4>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
            <a 
              href="https://wa.me/56978414767" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp: +56 9 7841 4767</span>
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a 
              href="mailto:TheGridChile@gmail.com"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors hover:scale-105"
            >
              <Mail className="h-4 w-4" />
              <span>TheGridChile@gmail.com</span>
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Gaming Grid - Antonio Varas 1347, LOCAL 106, Providencia.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;