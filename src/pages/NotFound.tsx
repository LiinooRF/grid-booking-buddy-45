import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gaming-bg via-background to-gaming-surface">
      <div className="text-center space-y-6">
        <div className="text-8xl mb-4">🎮</div>
        <h1 className="text-6xl font-bold gaming-text-glow mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Game Over! Página no encontrada</p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 gaming-glow transition-all duration-300 rounded-md font-bold uppercase tracking-wider"
        >
          Volver al Gaming Grid
        </a>
      </div>
    </div>
  );
};

export default NotFound;
