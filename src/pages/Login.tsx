
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useLogin } = useApi();
  const loginMutation = useLogin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await loginMutation.mutateAsync({ email, password });
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="light-beam" style={{ width: '500px', height: '500px', top: '10%', left: '60%' }}></div>
        <div className="light-beam" style={{ width: '400px', height: '400px', top: '70%', left: '30%' }}></div>
      </div>
      
      <GlassCard className="w-full max-w-md mx-auto overflow-hidden animate-scale-in">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-foreground/70">
              Log in to continue your background checks
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/60 border-white/50"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-gradient"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Log in'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-foreground/70">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-foreground/70 text-sm mt-4">
              New users get one free report!
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;
