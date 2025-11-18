import { Map, Route, TrafficCone, AlertTriangle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav = ({ activeTab, setActiveTab }: BottomNavProps) => {
  const navItems = [
    { id: "map", label: "Mapa", icon: Map, path: "/map", ariaLabel: "Ir al mapa de tráfico" },
    { id: "routes", label: "Rutas", icon: Route, path: "/routes", ariaLabel: "Planificar rutas" },
    { id: "lights", label: "Semáforos", icon: TrafficCone, path: "/traffic-lights", ariaLabel: "Ver estado de semáforos" },
    { id: "incidents", label: "Incidentes", icon: AlertTriangle, path: "/incidents", ariaLabel: "Ver incidentes de tráfico" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="grid grid-cols-4 safe-area-inset-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center justify-center py-4 px-2 transition-all duration-200",
              "hover:bg-accent/50 focus:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
              "min-h-[64px] touch-manipulation"
            )}
            activeClassName="text-primary font-semibold bg-primary/10 border-t-2 border-primary"
            aria-label={item.ariaLabel}
          >
            <item.icon className="w-6 h-6 mb-1" aria-hidden="true" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
