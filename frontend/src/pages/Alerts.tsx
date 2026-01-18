import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { riskAlerts } from '@/lib/mockData';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { useState } from 'react';

type Severity = 'all' | 'high' | 'medium' | 'low';

const Alerts = () => {
  const [filter, setFilter] = useState<Severity>('all');

  const filteredAlerts = filter === 'all' 
    ? riskAlerts 
    : riskAlerts.filter(alert => alert.severity === filter);

  const getSeverityStyles = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': 
        return {
          icon: <AlertTriangle className="w-5 h-5" style={{ color: 'hsl(8, 65%, 60%)' }} />,
          bg: 'linear-gradient(145deg, hsl(8 35% 14%) 0%, hsl(8 30% 10%) 100%)',
          border: 'hsl(8 25% 20%)',
          glow: 'hsl(8 65% 50% / 0.1)',
        };
      case 'medium': 
        return {
          icon: <AlertCircle className="w-5 h-5" style={{ color: 'hsl(38, 85%, 60%)' }} />,
          bg: 'linear-gradient(145deg, hsl(38 25% 14%) 0%, hsl(35 20% 10%) 100%)',
          border: 'hsl(38 20% 20%)',
          glow: 'hsl(38 85% 52% / 0.1)',
        };
      case 'low': 
        return {
          icon: <CheckCircle2 className="w-5 h-5" style={{ color: 'hsl(145, 55%, 55%)' }} />,
          bg: 'linear-gradient(145deg, hsl(145 25% 13%) 0%, hsl(145 20% 9%) 100%)',
          border: 'hsl(145 20% 18%)',
          glow: 'hsl(145 55% 42% / 0.1)',
        };
    }
  };

  const filterOptions: { value: Severity; label: string; count: number }[] = [
    { value: 'all', label: 'All Alerts', count: riskAlerts.length },
    { value: 'high', label: 'High', count: riskAlerts.filter(a => a.severity === 'high').length },
    { value: 'medium', label: 'Medium', count: riskAlerts.filter(a => a.severity === 'medium').length },
    { value: 'low', label: 'Low', count: riskAlerts.filter(a => a.severity === 'low').length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Risk Alerts</h1>
            <p className="text-muted-foreground">Proactive warnings to protect your credit health</p>
          </div>

          {/* Filter */}
          <div 
            className="flex items-center gap-1 p-1.5 rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, hsl(25 10% 12%) 0%, hsl(25 10% 9%) 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          >
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                style={{
                  background: filter === option.value
                    ? 'linear-gradient(145deg, hsl(25 10% 18%) 0%, hsl(25 10% 14%) 100%)'
                    : 'transparent',
                  color: filter === option.value ? 'hsl(35 20% 92%)' : 'hsl(30 8% 50%)',
                  boxShadow: filter === option.value ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
                }}
              >
                {option.label}
                <span 
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: filter === option.value 
                      ? 'linear-gradient(135deg, hsl(28 85% 52% / 0.2) 0%, hsl(28 85% 52% / 0.1) 100%)'
                      : 'hsl(25 10% 20%)',
                    color: filter === option.value ? 'hsl(28 85% 60%)' : 'hsl(30 8% 50%)',
                  }}
                >
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Summary */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { severity: 'high' as const, label: 'High Priority', cardClass: 'card-coral' },
            { severity: 'medium' as const, label: 'Medium Priority', cardClass: 'card-amber' },
            { severity: 'low' as const, label: 'Low Priority', cardClass: 'card-green' },
          ].map((item, index) => {
            const count = riskAlerts.filter(a => a.severity === item.severity).length;
            const styles = getSeverityStyles(item.severity);
            
            return (
              <motion.div
                key={item.severity}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={item.cardClass}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="label-subtle mb-1">{item.label}</p>
                    <p className="display-number-sm text-foreground">{count}</p>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${styles.glow}, transparent)`,
                    }}
                  >
                    {styles.icon}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-stat text-center py-16"
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{
                  background: 'linear-gradient(135deg, hsl(145 55% 42% / 0.2) 0%, hsl(145 55% 42% / 0.1) 100%)',
                }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: 'hsl(145, 55%, 55%)' }} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No alerts in this category</h3>
              <p className="text-muted-foreground">Great job maintaining your credit health!</p>
            </motion.div>
          ) : (
            filteredAlerts.map((alert, index) => {
              const styles = getSeverityStyles(alert.severity);
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-[24px] p-6 transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
                  style={{
                    background: styles.bg,
                    border: `1px solid ${styles.border}`,
                    boxShadow: `0 4px 24px -4px ${styles.glow}`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${styles.glow}50, transparent)`,
                      }}
                    >
                      {styles.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{alert.title}</h3>
                        <span className={`badge-risk-${alert.severity}`}>
                          {alert.severity}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {alert.description}
                      </p>

                      <div className="flex items-center gap-5 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Filter className="w-4 h-4" />
                          <span>Rule: {alert.rule}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{
                        background: 'linear-gradient(145deg, hsl(25 10% 18%) 0%, hsl(25 10% 14%) 100%)',
                      }}
                    >
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Understanding Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-stat"
        >
          <h3 className="font-semibold text-foreground mb-6">Understanding Risk Alerts</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                severity: 'high' as const,
                title: 'High Priority',
                description: 'Immediate action recommended. These issues may significantly impact your credit score.',
              },
              {
                severity: 'medium' as const,
                title: 'Medium Priority',
                description: 'Worth addressing soon. These could become high priority if not managed.',
              },
              {
                severity: 'low' as const,
                title: 'Low Priority',
                description: 'Informational or positive signals. Good to be aware of for optimization.',
              },
            ].map((item) => {
              const styles = getSeverityStyles(item.severity);
              return (
                <div key={item.severity}>
                  <div className="flex items-center gap-3 mb-3">
                    {styles.icon}
                    <span className="font-medium text-foreground">{item.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
