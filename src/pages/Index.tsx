import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary to-primary/80">
      <div className="text-center space-y-6 p-8">
        <img src={logo} alt="LiveTraffic Logo" className="h-32 w-32 mx-auto rounded-3xl shadow-2xl" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary-foreground">LiveTraffic</h1>
          <p className="text-xl text-primary-foreground/90">Ibagué, a tu ritmo</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;

