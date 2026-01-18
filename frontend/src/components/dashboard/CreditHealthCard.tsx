import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { calculateCHI, getRiskLevel } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';

const CreditHealthCard = () => {
  const { user } = useAuth();

  if (!user) return null;

  const emiToIncomeRatio = ((user.existingEMIs / user.monthlyIncome) * 100);
  const chi = calculateCHI(user.creditScore, emiToIncomeRatio, user.activeLoans, 0);
  const riskLevel = getRiskLevel(chi);

  const getRiskStyles = () => {
    switch (riskLevel) {
      case 'low':
        return {
          textColor: '#4CE5B1',
          bgGradient: '#1A1B20',
          glowColor: 'rgba(76, 229, 177, 0.15)',
          progressColor: '#4CE5B1',
        };
      case 'medium':
        return {
          textColor: '#FFCD54',
          bgGradient: '#1A1B20',
          glowColor: 'rgba(255, 205, 84, 0.15)',
          progressColor: '#FFCD54',
        };
      case 'high':
        return {
          textColor: '#FF9F6D',
          bgGradient: '#1A1B20',
          glowColor: 'rgba(255, 159, 109, 0.15)',
          progressColor: '#FF9F6D',
        };
    }
  };

  const styles = getRiskStyles();

  const getTrendIcon = () => {
    if (chi >= 60) return <TrendingUp className="w-4 h-4" />;
    if (chi >= 40) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[28px] p-8"
      style={{
        background: styles.bgGradient,
        boxShadow: `0 8px 40px -8px ${styles.glowColor}, 0 4px 24px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)`,
        border: `1px solid ${styles.glowColor}`,
      }}
    >
      {/* Decorative glows */}
      <div
        className="absolute -right-20 -top-20 w-60 h-60 rounded-full blur-3xl pointer-events-none"
        style={{ background: styles.glowColor }}
      />
      <div
        className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: styles.glowColor }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="label-subtle mb-2">Credit Health Index</p>
            <div className="flex items-baseline gap-3">
              <span
                className="display-number-lg"
                style={{ color: styles.textColor }}
              >
                {chi}
              </span>
              <span className="text-2xl text-muted-foreground font-display">/100</span>
            </div>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${styles.glowColor}, transparent)`,
              border: `1px solid ${styles.textColor}30`,
            }}
          >
            <span style={{ color: styles.textColor }}>{getTrendIcon()}</span>
            <span className="capitalize font-semibold text-sm" style={{ color: styles.textColor }}>
              {riskLevel} Risk
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div
            className="h-4 rounded-full overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(25 10% 10%) 0%, hsl(25 10% 8%) 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${chi}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${styles.progressColor}90, ${styles.progressColor})`,
                boxShadow: `0 0 16px ${styles.progressColor}60`,
              }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span>Critical</span>
            <span>Caution</span>
            <span>Healthy</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Credit Score', value: user.creditScore },
            { label: 'EMI Ratio', value: `${emiToIncomeRatio.toFixed(0)}%` },
            { label: 'Active Loans', value: user.activeLoans },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-5 rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, hsl(25 10% 12%) 0%, hsl(25 10% 9%) 100%)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.02)',
              }}
            >
              <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
              <p className="display-number-xs text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CreditHealthCard;
