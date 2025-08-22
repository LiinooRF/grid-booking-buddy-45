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
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          {/* Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-4 hover-scale transition-transform"
          >
            <img
              src="./lovable-uploads/96474a0a-1b4b-4240-8f77-bbaebb6bb1eb.png"
              alt="GRID Logo"
              className="h-12 w-auto md:h-14 lg:h-16"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold">
                <span className="text-white">GAMING</span>{" "}
                <span className="text-primary">GRID</span>
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {current === "reservas" ? "Sistema de Reservas" : "Eventos"}
              </p>
            </div>
          </NavLink>

          {/* Navigation */}
          <div className="flex items-center gap-2 md:gap-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${baseLink} ${isActive || current === "home" ? active : inactive}`
              }
            >
              <Home className="h-4 w-4 mr-2" /> Inicio
            </NavLink>
            <NavLink
              to="/reservas"
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive || current === "reservas" ? active : inactive
                }`
              }
            >
              <Calendar className="h-4 w-4 mr-2" /> Reservas
            </NavLink>
            <NavLink
              to="/eventos"
              className={({ isActive }) =>
                `${baseLink} ${
                  isActive || current === "eventos" ? active : inactive
                }`
              }
            >
              <Trophy className="h-4 w-4 mr-2" /> Eventos
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
