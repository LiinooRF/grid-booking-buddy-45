import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";

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
      <main className="container mx-auto px-4 py-10">
        <section className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Bienvenido a <span className="text-primary">Gaming Grid</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Tu centro de juegos: reserva PCs y consolas de alto rendimiento y participa en nuestros eventos.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/reservas"
              className="px-5 py-3 rounded-md bg-primary text-black font-medium shadow-lg shadow-primary/25 ring-1 ring-primary/60 hover:opacity-90 transition"
            >
              Ir a Reservas
            </Link>
            <Link
              to="/eventos"
              className="px-5 py-3 rounded-md border border-gaming-border bg-gaming-surface/50 hover:bg-gaming-surface transition"
            >
              Ver Eventos
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
