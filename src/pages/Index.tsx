
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import SearchForm from '@/components/SearchForm';
import { Search, Shield, Calendar, User, FileText } from 'lucide-react';

const Index = () => {
  useEffect(() => {
    // Create light beam elements for the background effect
    const createLightBeams = () => {
      const container = document.getElementById('light-beams-container');
      if (!container) return;
      
      // Clear existing beams
      container.innerHTML = '';
      
      // Create new beams
      for (let i = 0; i < 3; i++) {
        const beam = document.createElement('div');
        beam.className = 'light-beam';
        
        // Random positioning
        const size = Math.floor(Math.random() * 300) + 300;
        const top = Math.floor(Math.random() * 80);
        const left = Math.floor(Math.random() * 80);
        
        beam.style.width = `${size}px`;
        beam.style.height = `${size}px`;
        beam.style.top = `${top}%`;
        beam.style.left = `${left}%`;
        
        container.appendChild(beam);
      }
    };
    
    createLightBeams();
    
    // Recreate beams on resize for responsiveness
    window.addEventListener('resize', createLightBeams);
    
    return () => {
      window.removeEventListener('resize', createLightBeams);
    };
  }, []);
  
  const features = [
    {
      icon: <Shield className="h-10 w-10 text-horizon-orange" />,
      title: "Comprehensive Identity Reports",
      description: "Get detailed information about any individual, including contact details, social media presence, and more."
    },
    {
      icon: <Calendar className="h-10 w-10 text-horizon-orange" />,
      title: "Fast & Accurate Results",
      description: "Our advanced algorithms deliver accurate information quickly, with most reports ready in minutes."
    },
    {
      icon: <User className="h-10 w-10 text-horizon-orange" />,
      title: "One Free Report",
      description: "New users receive one free comprehensive report upon signup. Explore the full power of our service."
    },
    {
      icon: <FileText className="h-10 w-10 text-horizon-orange" />,
      title: "Detailed Analysis",
      description: "Each report includes an AI-generated summary, identifying key patterns and insights from the data."
    }
  ];
  
  const steps = [
    {
      number: "01",
      title: "Enter the name",
      description: "Start with the person's full name and any additional identifiers you know."
    },
    {
      number: "02",
      title: "We search extensively",
      description: "Our system searches across multiple data sources to compile comprehensive information."
    },
    {
      number: "03",
      title: "Review the results",
      description: "Receive a detailed report organized into easy-to-navigate sections."
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Background light beams */}
      <div id="light-beams-container" className="absolute inset-0 overflow-hidden -z-10"></div>
      
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Discover Everything About <span className="text-gradient">Anyone</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 animate-fade-in animate-delay-100">
              Our comprehensive background checks reveal detailed information about anyone. Uncover the truth with just a name.
            </p>
            <div className="flex justify-center space-x-4 animate-fade-in animate-delay-200">
              <Link to="/signup">
                <Button variant="default" size="lg" className="btn-gradient">
                  Get One Free Report
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="mt-8 md:mt-12 animation-fade-in animate-delay-300">
            <SearchForm />
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Our background check process is simple, fast, and comprehensive. Just follow these steps:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative flex flex-col glass-card p-6 card-hover"
              >
                <span className="text-4xl font-bold text-horizon-orange/30 mb-4">
                  {step.number}
                </span>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-foreground/80">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Reports</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Our background checks provide detailed information across multiple categories
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <GlassCard 
                key={index}
                className="flex flex-col items-center text-center p-6 card-hover h-full"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/80">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 bg-sunrise-gradient text-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Sign up now and receive one free comprehensive report. Uncover information about anyone with just a name.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" variant="default" className="w-full sm:w-auto bg-white text-horizon-orange hover:bg-white/90">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/80 text-white hover:bg-white/20">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-foreground/5">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-foreground/70 text-sm">
                © 2023 Horizon. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-foreground/70 hover:text-foreground text-sm">Privacy Policy</a>
              <a href="#" className="text-foreground/70 hover:text-foreground text-sm">Terms of Service</a>
              <a href="#" className="text-foreground/70 hover:text-foreground text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
