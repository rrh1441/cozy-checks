import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { Button } from './ui/button';
import { ShieldAlert, LogOut } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6" />
            <Link to="/" className="text-xl font-bold">
              Security Scanner
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-opacity-80">
                  Dashboard
                </Link>
                <Link to="/scans" className="hover:text-opacity-80">
                  Scans
                </Link>
                <Link to="/reports" className="hover:text-opacity-80">
                  Reports
                </Link>
                <div className="flex items-center space-x-2">
                  <span>
                    {user?.firstName} {user?.lastName}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/80"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-opacity-80">
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="secondary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;