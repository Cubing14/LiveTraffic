import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

const TopHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header 
      className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm border-b border-border/50 shadow-sm z-50"
      role="banner"
    >
      <div className="flex items-center justify-between px-4 py-4 safe-area-inset-top">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg" aria-hidden="true">🚗</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">LiveTraffic</h1>
            <p className="text-sm text-muted-foreground">Ibagué, a tu ritmo</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 hover:bg-primary/10 focus:ring-2 focus:ring-primary/50 rounded-full p-2"
          aria-label="Ir al perfil de usuario"
        >
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarImage 
              src={user?.user_metadata?.avatar_url} 
              alt="Foto de perfil del usuario"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.user_metadata?.nombre?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
};

export default TopHeader;