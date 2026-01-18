import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Sparkles,
  AlertTriangle,
  User,
  LogOut,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/playground', icon: Calculator, label: 'Playground' },
  { to: '/simulator', icon: Sparkles, label: 'Simulator' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-24 flex flex-col items-center py-8 z-50"
      style={{
        background: '#0D0D10',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-10"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6C5DD3 0%, #8F7EE5 100%)',
            boxShadow: '0 4px 20px -4px rgba(108, 93, 211, 0.5)',
          }}
        >
          <TrendingUp className="w-7 h-7" style={{ color: '#FFFFFF' }} />
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-3">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.to}
                className="relative flex flex-col items-center justify-center group"
              >
                {/* Icon container - circular */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                    ? ''
                    : 'hover:scale-105'
                    }`}
                  style={{
                    background: isActive
                      ? 'rgba(108, 93, 211, 0.15)'
                      : '#1A1B20',
                    boxShadow: isActive
                      ? '0 4px 16px -4px rgba(108, 93, 211, 0.3)'
                      : '0 2px 8px rgba(0, 0, 0, 0.3)',
                    border: isActive
                      ? '1px solid rgba(108, 93, 211, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <Icon
                    className="w-5 h-5 transition-colors"
                    style={{ color: isActive ? '#6C5DD3' : '#888888' }}
                  />
                </div>
                <span
                  className={`text-[10px] mt-2 font-medium transition-colors`}
                  style={{ color: isActive ? '#6C5DD3' : '#888888' }}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -left-6 w-1 h-8 rounded-r-full"
                    style={{ background: '#6C5DD3' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={logout}
        className="flex flex-col items-center justify-center group"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(145deg, hsl(8 35% 16%) 0%, hsl(8 30% 12%) 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
            border: '1px solid hsl(8 25% 20%)',
          }}
        >
          <LogOut className="w-5 h-5 text-destructive" />
        </div>
        <span className="text-[10px] mt-2 font-medium text-sidebar-foreground">Logout</span>
      </motion.button>
    </aside>
  );
};

export default Sidebar;
