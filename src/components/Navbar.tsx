
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/store';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, User, History, LogOut } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, authStatus, logout } = useStore();
  
  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };
  
  const navLinks = [
    { name: 'Home', path: '/', icon: <Search className="w-4 h-4 mr-2" /> },
    ...(isAuthenticated 
      ? [
          { name: 'History', path: '/history', icon: <History className="w-4 h-4 mr-2" /> },
          { name: 'Profile', path: '/profile', icon: <User className="w-4 h-4 mr-2" /> }
        ] 
      : []
    )
  ];
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/70 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl font-bold text-gradient">Horizon</span>
          </Link>
          
          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={isActive(link.path) ? "nav-link-active" : "nav-link"}
              >
                <span className="flex items-center">
                  {link.icon}
                  {link.name}
                </span>
              </Link>
            ))}
          </nav>
          
          {/* Auth buttons - desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                className="flex items-center"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${
                    isActive(link.path) 
                      ? "bg-primary/20 text-primary font-medium" 
                      : "text-foreground hover:bg-primary/10"
                  } px-4 py-3 rounded-lg flex items-center`}
                  onClick={closeMobileMenu}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              
              {/* Auth buttons - mobile */}
              <div className="pt-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <button
                    className="w-full mt-2 px-4 py-3 rounded-lg text-left flex items-center text-foreground hover:bg-primary/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </button>
                ) : (
                  <div className="flex flex-col space-y-2 mt-2">
                    <Link 
                      to="/login" 
                      className="px-4 py-3 rounded-lg text-foreground hover:bg-primary/10"
                      onClick={closeMobileMenu}
                    >
                      Log in
                    </Link>
                    <Link 
                      to="/signup" 
                      className="px-4 py-3 rounded-lg bg-primary text-white text-center"
                      onClick={closeMobileMenu}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
