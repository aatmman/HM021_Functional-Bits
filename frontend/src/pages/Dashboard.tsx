import DashboardLayout from '@/components/layout/DashboardLayout';
import CreditHealthCard from '@/components/dashboard/CreditHealthCard';
import CreditScoreChart from '@/components/dashboard/CreditScoreChart';
import StatsCards from '@/components/dashboard/StatsCards';
import RiskAlertsCard from '@/components/dashboard/RiskAlertsCard';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Your complete credit health overview</p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* CHI Card - Takes 2 columns */}
          <div className="lg:col-span-2">
            <CreditHealthCard />
          </div>

          {/* Risk Alerts */}
          <div className="lg:col-span-1">
            <RiskAlertsCard />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Credit Score Chart */}
          <div className="lg:col-span-2">
            <CreditScoreChart />
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card-stat"
          >
            <h3 className="text-lg font-semibold text-foreground mb-5">Quick Actions</h3>
            <div className="space-y-3">
              {[
                {
                  to: '/playground',
                  title: 'Loan Playground',
                  subtitle: 'Simulate a new loan',
                  gradient: '#1A1B20',
                  border: 'rgba(108, 93, 211, 0.3)',
                  iconColor: '#6C5DD3',
                },
                {
                  to: '/simulator',
                  title: 'Credit Simulator',
                  subtitle: 'Test what-if scenarios',
                  gradient: '#1A1B20',
                  border: 'rgba(76, 229, 177, 0.3)',
                  iconColor: '#4CE5B1',
                },
                {
                  to: '/alerts',
                  title: 'View All Alerts',
                  subtitle: '3 active warnings',
                  gradient: '#1A1B20',
                  border: 'rgba(255, 205, 84, 0.3)',
                  iconColor: '#FFCD54',
                },
              ].map((action, index) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
                  style={{
                    background: action.gradient,
                    border: `1px solid ${action.border}`,
                  }}
                >
                  <div>
                    <p className="font-medium text-foreground">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.subtitle}</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${action.iconColor}20, ${action.iconColor}10)`,
                    }}
                  >
                    <ArrowRight className="w-5 h-5" style={{ color: action.iconColor }} />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
