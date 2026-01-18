import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowRight, 
  Shield, 
  Sparkles, 
  AlertTriangle, 
  Calculator,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Explainable Simulator',
      description: 'See exactly how your actions affect your credit score with clear explanations.',
    },
    {
      icon: Shield,
      title: 'Credit Health Index',
      description: 'One composite score that tells you everything about your credit health.',
    },
    {
      icon: AlertTriangle,
      title: 'Risk Alerts',
      description: 'Proactive warnings before risky behaviors impact your credit.',
    },
    {
      icon: Calculator,
      title: 'Decision Playground',
      description: 'Play with loan scenarios and see real-time impact on your finances.',
    },
  ];

  const benefits = [
    'Understand trade-offs in loan decisions',
    'Simulate actions and see consequences',
    'Monitor your credit health',
    'Receive proactive warnings',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Credit Decision Coach</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/signin">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analytics-first credit intelligence</span>
            </motion.div>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Make smarter, safer{' '}
              <span className="text-gradient-primary">credit decisions</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Most credit platforms calculate numbers. We coach you into safer financial decisions 
              with explainable simulations and proactive risk detection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-base rounded-xl">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/signin">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-xl border-border hover:bg-muted">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 shadow-lg">
              <div className="grid md:grid-cols-3 gap-6">
                {/* CHI Preview */}
                <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 border border-border/50 p-6">
                  <p className="label-subtle mb-2">Credit Health Index</p>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="display-number-lg text-success">78</span>
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[78%] rounded-full bg-success" />
                  </div>
                </div>

                {/* Stats Preview */}
                <div className="space-y-4">
                  <div className="rounded-2xl bg-card p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Credit Score</p>
                    <p className="display-number-sm text-foreground">742</p>
                  </div>
                  <div className="rounded-2xl bg-card p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Active Loans</p>
                    <p className="display-number-sm text-foreground">2</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Everything you need to make confident decisions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four powerful features designed to give you complete visibility into your credit health.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl font-bold text-foreground mb-6">
                A decision coach, not just a calculator
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We don't just show you numbers. We help you understand the trade-offs, 
                simulate outcomes, and make decisions you'll be confident about.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <Link to="/signup" className="inline-block mt-8">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Start your journey
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <div className="rounded-2xl card-amber border p-6">
                  <p className="label-subtle mb-2">Monthly EMI</p>
                  <p className="display-number-sm text-foreground">₹12,500</p>
                </div>
                <div className="rounded-2xl card-green border p-6">
                  <p className="label-subtle mb-2">Score Change</p>
                  <p className="display-number-sm text-success">+15</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-2xl card-teal border p-6">
                  <p className="label-subtle mb-2">Risk Level</p>
                  <p className="text-lg font-semibold text-accent">Low</p>
                </div>
                <div className="rounded-2xl card-coral border p-6">
                  <p className="label-subtle mb-2">Interest Saved</p>
                  <p className="display-number-sm text-foreground">₹45K</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-6">
              Ready to take control of your credit?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users making smarter financial decisions every day.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-base rounded-xl">
                Get Started — It's Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">Credit Decision Coach</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Credit Decision Coach. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
