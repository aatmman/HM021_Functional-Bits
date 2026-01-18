import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { riskAlerts } from '@/lib/mockData';
import { Link } from 'react-router-dom';

const RiskAlertsCard = () => {
  const getSeverityStyles = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': 
        return {
          icon: <AlertTriangle className="w-4 h-4" style={{ color: 'hsl(8, 65%, 60%)' }} />,
          bg: 'linear-gradient(145deg, hsl(8 35% 14%) 0%, hsl(8 30% 10%) 100%)',
          border: 'hsl(8 25% 20%)',
        };
      case 'medium': 
        return {
          icon: <AlertCircle className="w-4 h-4" style={{ color: 'hsl(38, 85%, 60%)' }} />,
          bg: 'linear-gradient(145deg, hsl(38 25% 14%) 0%, hsl(35 20% 10%) 100%)',
          border: 'hsl(38 20% 20%)',
        };
      case 'low': 
        return {
          icon: <CheckCircle2 className="w-4 h-4" style={{ color: 'hsl(145, 55%, 55%)' }} />,
          bg: 'linear-gradient(145deg, hsl(145 25% 13%) 0%, hsl(145 20% 9%) 100%)',
          border: 'hsl(145 20% 18%)',
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card-stat h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Risk Alerts</h3>
        <Link 
          to="/alerts" 
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-3">
        {riskAlerts.slice(0, 3).map((alert, index) => {
          const styles = getSeverityStyles(alert.severity);
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              className="p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                background: styles.bg,
                border: `1px solid ${styles.border}`,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {styles.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground text-sm truncate">{alert.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {alert.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RiskAlertsCard;
