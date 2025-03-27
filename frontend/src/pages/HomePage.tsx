import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { Button } from '../components/ui/button';
import SearchForm from '../components/SearchForm';
import { ShieldCheck } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-[80vh] flex flex-col">
      <section className="flex-1 flex flex-col justify-center py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8 flex justify-center">
            <ShieldCheck className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Secure Your Code with Intelligent Scans
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automatically detect vulnerabilities, security risks, and code quality issues using AI-powered analysis.
          </p>

          {isAuthenticated ? (
            <div className="max-w-xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Scan a Repository</h2>
              <SearchForm />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="min-w-32">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="min-w-32">
                  Log In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">GitHub Integration</h3>
              <p>Scan repositories and pull requests directly from GitHub with ease.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
              <p>Get intelligent insights through AI scanning of vulnerabilities and code issues.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Comprehensive Reports</h3>
              <p>Generate detailed reports with prioritized remediation suggestions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;