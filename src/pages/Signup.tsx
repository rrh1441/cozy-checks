
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useSignup } = useApi();
  const signupMutation = useSignup();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signupMutation.mutateAsync({ name, email, password });
      toast({
        title: "Account created",
        description: "Welcome to Horizon! You now have one free report.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const benefits = [
    "One free comprehensive report",
    "Detailed background intelligence",
    "Investigation history tracking",
    "Premium report features"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="light-beam" style={{ width: '500px', height: '500px', top: '10%', left: '60%' }}></div>
        <div className="light-beam" style={{ width: '400px', height: '400px', top: '70%', left: '30%' }}></div>
      </div>
      
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Sign up form */}
        <GlassCard className="flex-1 overflow-hidden animate-fade-in">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
              <p className="text-foreground/70">
                New members receive one free comprehensive report
              </p>
            </div>
            
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white/60 border-white/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/60 border-white/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/60 border-white/50"
                />
                <p className="text-xs text-foreground/70">
                  Must be at least 8 characters
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-gradient"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Get Your Free Report'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-foreground/70">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </GlassCard>
        
        {/* Benefits panel */}
        <div className="flex-1 hidden md:block">
          <GlassCard className="h-full p-8 flex flex-col bg-sunrise-gradient text-white animate-fade-in animate-delay-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Benefits of Your Free Account
              </h2>
              <p className="text-white/90">
                Unlock powerful background intelligence with just an email and password.
              </p>
            </div>
            
            <div className="space-y-4 flex-1">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1 bg-white/20 rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-auto pt-8 border-t border-white/20">
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-lg font-medium mb-1">
                  Your First Report Is On Us
                </p>
                <p className="text-sm text-white/90">
                  Create your account now and receive one comprehensive report completely free. No credit card required.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Signup;
