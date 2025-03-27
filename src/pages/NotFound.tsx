
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="light-beam" style={{ width: '500px', height: '500px', top: '20%', left: '70%' }}></div>
        <div className="light-beam" style={{ width: '400px', height: '400px', top: '60%', left: '20%' }}></div>
      </div>
      
      <GlassCard className="max-w-md w-full p-8 text-center animate-scale-in">
        <h1 className="text-7xl font-bold mb-4 text-gradient">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-foreground/70 mb-8">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="btn-gradient">
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </GlassCard>
    </div>
  );
};

export default NotFound;
