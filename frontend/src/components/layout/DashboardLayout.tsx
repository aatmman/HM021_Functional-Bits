import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isAuthenticated, isOnboarded, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Main content */}
      <div className="ml-20">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-8 py-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="input-premium pl-10 w-64 py-2.5 text-sm"
              />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <button className="relative p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {getGreeting()}, <span className="text-foreground font-medium">{user?.name}</span> 👋
                </span>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content with neon border wrapper */}
        <div className="p-6">
          <div
            className="rounded-[24px] p-6 min-h-[calc(100vh-120px)]"
            style={{
              border: '1px solid rgba(108, 93, 211, 0.2)',
              background: '#0D0D10',
              boxShadow: '0 0 60px rgba(108, 93, 211, 0.05)'
            }}
          >
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="p-2"
            >
              {children}
            </motion.main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
