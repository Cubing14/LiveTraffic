import { Map, Route, TrafficCone, AlertTriangle, User, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav = ({ activeTab, setActiveTab }: BottomNavProps) => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const navItems = [
    { id: "map", label: "Mapa", icon: Map, path: "/map" },
    { id: "routes", label: "Rutas", icon: Route, path: "/routes" },
    { id: "lights", label: "Semáforos", icon: TrafficCone, path: "/traffic-lights" },
    { id: "incidents", label: "Incidentes", icon: AlertTriangle, path: "/incidents" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-2 transition-colors",
              "hover:bg-accent/50"
            )}
            activeClassName="text-primary font-semibold bg-primary/5"
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="flex flex-col items-center justify-center py-3 px-2 h-auto hover:bg-accent/50"
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span className="text-xs">Salir</span>
        </Button>
      </div>
    </nav>
  );
};

export default BottomNav;
