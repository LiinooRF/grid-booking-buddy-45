import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Home } from "lucide-react";

interface SiteHeaderProps {
  current: "home" | "reservas" | "eventos";
}

export function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <header className="border-b border-primary/20 bg-black/95 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-primary/10">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-4 hover:scale-105 transition-transform duration-200">
            <img
              src="/lovable-uploads/4c96efc2-aefc-4592-918a-c87ffd48a6d7.png"
              alt="Gaming Grid"
              className="h-12 w-auto"
            />
          </NavLink>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" className={({ isActive }) => 
                `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive || current === "home" 
                    ? "bg-primary text-black shadow-lg shadow-primary/25" 
                    : "text-white hover:text-primary hover:bg-primary/10"
                }`
              }>
                <Home className="h-4 w-4 inline mr-2" />
                Inicio
              </NavLink>
              <NavLink to="/reservas" className={({ isActive }) => 
                `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive || current === "reservas" 
                    ? "bg-primary text-black shadow-lg shadow-primary/25" 
                    : "text-white hover:text-primary hover:bg-primary/10"
                }`
              }>
                <Calendar className="h-4 w-4 inline mr-2" />
                Reservas
              </NavLink>
              <NavLink to="/eventos" className={({ isActive }) => 
                `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive || current === "eventos" 
                    ? "bg-primary text-black shadow-lg shadow-primary/25" 
                    : "text-white hover:text-primary hover:bg-primary/10"
                }`
              }>
                🏆 Eventos
              </NavLink>
            </nav>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              <NavLink to="/" className={({ isActive }) => 
                `p-2 rounded-lg transition-all duration-200 ${
                  isActive || current === "home" 
                    ? "bg-primary text-black" 
                    : "text-white hover:text-primary"
                }`
              }>
                <Home className="h-5 w-5" />
              </NavLink>
              <NavLink to="/reservas" className={({ isActive }) => 
                `p-2 rounded-lg transition-all duration-200 ${
                  isActive || current === "reservas" 
                    ? "bg-primary text-black" 
                    : "text-white hover:text-primary"
                }`
              }>
                <Calendar className="h-5 w-5" />
              </NavLink>
              <NavLink to="/eventos" className={({ isActive }) => 
                `p-2 rounded-lg transition-all duration-200 text-sm ${
                  isActive || current === "eventos" 
                    ? "bg-primary text-black" 
                    : "text-white hover:text-primary"
                }`
              }>
                🏆
              </NavLink>
            </div>

            {/* CTA Button */}
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-black transition-all duration-200 hidden lg:flex"
              onClick={() => window.open('https://gaminggrid.cl', '_blank')}
            >
              Sitio Web
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
