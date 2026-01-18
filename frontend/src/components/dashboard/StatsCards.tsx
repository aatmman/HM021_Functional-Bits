import { motion } from 'framer-motion';
import { Wallet, CreditCard, PiggyBank, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/mockData';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// Mini sparkline data for each card
const sparklineData = {
  income: [
    { value: 75 }, { value: 82 }, { value: 78 }, { value: 85 }, { value: 88 }, { value: 92 }, { value: 95 }
  ],
  expenses: [
    { value: 65 }, { value: 58 }, { value: 62 }, { value: 55 }, { value: 52 }, { value: 48 }, { value: 45 }
  ],
  emi: [
    { value: 40 }, { value: 42 }, { value: 40 }, { value: 38 }, { value: 40 }, { value: 42 }, { value: 40 }
  ],
  disposable: [
    { value: 50 }, { value: 55 }, { value: 58 }, { value: 62 }, { value: 65 }, { value: 70 }, { value: 75 }
  ],
};

const StatsCards = () => {
  const { user } = useAuth();
  if (!user) return null;

  const disposableIncome = user.monthlyIncome - user.monthlyExpenses - user.existingEMIs;

  const stats = [
    {
      label: 'Monthly Income',
      value: formatCurrency(user.monthlyIncome),
      change: '+2.5%',
      isPositive: true,
      icon: Wallet,
      cardClass: 'card-purple',
      chartColor: '#6C5DD3',
      chartData: sparklineData.income,
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(user.monthlyExpenses),
      change: '-1.2%',
      isPositive: false,
      icon: CreditCard,
      cardClass: 'card-coral',
      chartColor: '#FF9F6D',
      chartData: sparklineData.expenses,
    },
    {
      label: 'Active EMIs',
      value: formatCurrency(user.existingEMIs),
      change: '2 loans',
      isPositive: null,
      icon: TrendingDown,
      cardClass: 'card-amber',
      chartColor: '#FFCD54',
      chartData: sparklineData.emi,
    },
    {
      label: 'Disposable',
      value: formatCurrency(disposableIncome),
      change: '+5.1%',
      isPositive: true,
      icon: PiggyBank,
      cardClass: 'card-teal',
      chartColor: '#4CE5B1',
      chartData: sparklineData.disposable,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`${stat.cardClass} relative overflow-hidden`}
        >
          {/* Top row: Icon + Trend badge */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(145deg, ${stat.chartColor}20, ${stat.chartColor}10)`,
                boxShadow: `0 2px 8px ${stat.chartColor}20`,
              }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.chartColor }} />
            </div>
            {stat.isPositive !== null ? (
              <div className={stat.isPositive ? 'trend-up' : 'trend-down'}>
                {stat.isPositive ?
                  <ArrowUpRight className="w-3 h-3" /> :
                  <ArrowDownRight className="w-3 h-3" />
                }
                <span>{stat.change}</span>
              </div>
            ) : (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: 'linear-gradient(135deg, hsl(25 10% 20%) 0%, hsl(25 10% 16%) 100%)',
                  color: 'hsl(35 20% 70%)',
                }}
              >
                {stat.change}
              </span>
            )}
          </div>

          {/* Mini chart behind the value */}
          <div className="absolute bottom-0 left-0 right-0 h-20 opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stat.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={stat.chartColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${index})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Value + Label */}
          <div className="relative z-10">
            <p className="display-number-sm text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
