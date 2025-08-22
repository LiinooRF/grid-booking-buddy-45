import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface SiteHeaderProps {
  current: "reservas" | "eventos";
}

export function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <header className="border-b border-gaming-border bg-gaming-surface/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/4c96efc2-aefc-4592-918a-c87ffd48a6d7.png"
              alt="Gaming Grid logo"
              className="h-9 w-auto"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold">
                <span className="text-white">GAMING</span>{" "}
                <span className="text-primary">GRID</span>
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {current === "reservas" ? "Sistema de Reservas" : "Eventos"}
              </p>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-2 md:gap-3">
            <NavLink to="/reservas" className={({ isActive }) => isActive ? "[&_button]:bg-primary [&_button]:text-black" : ""}>
              <Button variant="outline" className="h-9 md:h-10">
                Reservas
              </Button>
            </NavLink>
            <NavLink to="/eventos" className={({ isActive }) => isActive ? "[&_button]:bg-primary [&_button]:text-black" : ""}>
              <Button variant="outline" className="h-9 md:h-10">
                Eventos
              </Button>
            </NavLink>
            <div className="hidden md:flex items-center gap-2 ml-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">12PM - 12AM</span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
