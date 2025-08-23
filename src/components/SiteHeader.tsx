import { NavLink } from "react-router-dom";
import { Calendar, Home, Trophy } from "lucide-react";

interface SiteHeaderProps {
  current: "home" | "reservas" | "eventos";
}

export function SiteHeader({ current }: SiteHeaderProps) {
  const baseLink =
    "px-4 py-2 rounded-md font-medium transition-all duration-200 hover-scale story-link";
  const inactive = "text-white/90 hover:text-primary/90 hover:bg-primary/10";
  const active =
    "bg-primary text-black shadow-lg shadow-primary/25 ring-1 ring-primary/60";

  return (
    <header className="border-b border-gaming-border bg-gaming-surface/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 py-3 md:px-4 md:py-3">
        <nav className="flex items-center justify-between">
          {/* Brand con tu logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 md:gap-4 hover-scale transition-transform"
          >
            <img
              src="./lovable-uploads/93081e9c-4ed3-407c-8d8b-2c07bb625826.png"
              alt="GRID Logo"
              className="h-10 w-auto md:h-12 lg:h-14"
            />
            
            <div className="hidden xs:block">
              <h1 className="text-base md:text-lg lg:text-xl font-bold leading-tight">
                <span className="text-white">GAMING</span>{" "}
                <span className="text-primary">GRID</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden md:block">
                {current === "reservas" ? "Sistema de Reservas" : "Eventos"}
              </p>
            </div>
          </NavLink>

          {/* Navigation - Más grande para móvil */}
          <div className="flex items-center gap-2 md:gap-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 md:px-4 md:py-2 rounded-md font-medium transition-all duration-200 hover-scale text-sm md:text-sm ${
                  isActive || current === "home" ? active : inactive
                }`
              }
            >
              <Home className="h-4 w-4 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden sm:inline">Inicio</span>
            </NavLink>
            
            <NavLink
              to="/reservas"
              className={({ isActive }) =>
                `px-3 py-2 md:px-4 md:py-2 rounded-md font-medium transition-all duration-200 hover-scale text-sm md:text-sm ${
                  isActive || current === "reservas" ? active : inactive
                }`
              }
            >
              <Calendar className="h-4 w-4 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden sm:inline">Reservas</span>
            </NavLink>
            
            <NavLink
              to="/eventos"
              className={({ isActive }) =>
                `px-3 py-2 md:px-4 md:py-2 rounded-md font-medium transition-all duration-200 hover-scale text-sm md:text-sm ${
                  isActive || current === "eventos" ? active : inactive
                }`
              }
            >
              <Trophy className="h-4 w-4 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden sm:inline">Eventos</span>
            </NavLink>
          </div>
        </nav>
      </div>
      {/* Accent bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0" />
    </header>
  );
}

export default SiteHeader;
