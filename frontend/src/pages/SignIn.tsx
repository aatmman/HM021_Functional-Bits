import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, hsl(25 10% 10%) 0%, hsl(20 8% 6%) 100%)',
        }}
      >
        {/* Decorative glows */}
        <div 
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'hsl(28 85% 52% / 0.08)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'hsl(170 45% 42% / 0.06)' }}
        />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-10">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(28 85% 52%) 0%, hsl(25 80% 45%) 100%)',
                boxShadow: '0 4px 24px -4px hsl(28 85% 52% / 0.4)',
              }}
            >
              <TrendingUp className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Credit Decision Coach</span>
          </div>

          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Welcome back
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Sign in to continue monitoring your credit health and making smarter decisions.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-5">
            <div className="card-amber">
              <p className="label-subtle mb-2">Active Users</p>
              <p className="display-number-xs text-foreground">12,847</p>
            </div>
            <div className="card-green">
              <p className="label-subtle mb-2">Decisions Made</p>
              <p className="display-number-xs text-foreground">45K+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(28 85% 52%) 0%, hsl(25 80% 45%) 100%)',
                boxShadow: '0 4px 20px -4px hsl(28 85% 52% / 0.4)',
              }}
            >
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Credit Decision Coach</span>
          </div>

          <div className="mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Sign in
            </h2>
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(145deg, hsl(8 35% 14%) 0%, hsl(8 30% 10%) 100%)',
                  border: '1px solid hsl(8 65% 50% / 0.3)',
                }}
              >
                <p className="text-sm" style={{ color: 'hsl(8 65% 60%)' }}>{error}</p>
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Email
                </label>
                <div className="relative">
                  <div 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, hsl(25 10% 18%) 0%, hsl(25 10% 14%) 100%)',
                    }}
                  >
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-premium pl-20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Password
                </label>
                <div className="relative">
                  <div 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, hsl(25 10% 18%) 0%, hsl(25 10% 14%) 100%)',
                    }}
                  >
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-premium pl-20"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-full font-semibold text-base transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, hsl(28 85% 52%) 0%, hsl(25 80% 45%) 100%)',
                color: 'hsl(20 8% 6%)',
                boxShadow: '0 4px 20px -4px hsl(28 85% 52% / 0.4)',
              }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
