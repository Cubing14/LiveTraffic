import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { User } from "lucide-react";

const TopHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border shadow-sm z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">LiveTraffic</h1>
          <p className="text-sm text-muted-foreground">Ibagué, a tu ritmo</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.nombre?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default TopHeader;