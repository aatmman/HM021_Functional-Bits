import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { creditScoreTrend } from '@/lib/mockData';
import { ArrowUpRight } from 'lucide-react';

const CreditScoreChart = () => {
  const startScore = creditScoreTrend[0].score;
  const endScore = creditScoreTrend[creditScoreTrend.length - 1].score;
  const change = endScore - startScore;
  const percentChange = ((change / startScore) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card-stat card-teal h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="label-subtle mb-1">Credit Score Trend</p>
          <p className="display-number text-foreground">{endScore}</p>
        </div>
        <div className="trend-up">
          <ArrowUpRight className="w-3 h-3" />
          <span>+{percentChange}%</span>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={creditScoreTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(175, 55%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(175, 55%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }}
            />
            <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
            <Tooltip
              contentStyle={{
                background: 'hsl(0, 0%, 10%)',
                border: '1px solid hsl(220, 10%, 18%)',
                borderRadius: '12px',
                padding: '12px',
              }}
              labelStyle={{ color: 'hsl(40, 10%, 95%)' }}
              itemStyle={{ color: 'hsl(175, 55%, 45%)' }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(175, 55%, 45%)"
              strokeWidth={2}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default CreditScoreChart;
