import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Slider } from '@/components/ui/slider';
import { 
  calculateEMI, 
  calculateTotalInterest, 
  formatCurrency, 
  calculateCHI, 
  getRiskLevel 
} from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  IndianRupee,
  Percent,
  Calendar,
  Wallet
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Playground = () => {
  const { user } = useAuth();
  
  // Loan parameters
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenure, setTenure] = useState(36);
  const [monthlyExpenses, setMonthlyExpenses] = useState(user?.monthlyExpenses || 35000);
  const [existingEMIs, setExistingEMIs] = useState(user?.existingEMIs || 12000);
  const [creditUtilization, setCreditUtilization] = useState(user?.creditUtilization || 35);

  // Calculations
  const emi = useMemo(() => calculateEMI(loanAmount, interestRate, tenure), [loanAmount, interestRate, tenure]);
  const totalInterest = useMemo(() => calculateTotalInterest(loanAmount, emi, tenure), [loanAmount, emi, tenure]);
  const totalPayment = loanAmount + totalInterest;
  
  const newTotalEMI = existingEMIs + emi;
  const monthlyIncome = user?.monthlyIncome || 85000;
  const newEMIRatio = (newTotalEMI / monthlyIncome) * 100;
  
  const currentCHI = calculateCHI(user?.creditScore || 742, (existingEMIs / monthlyIncome) * 100, user?.activeLoans || 2);
  const newCHI = calculateCHI(user?.creditScore || 742, newEMIRatio, (user?.activeLoans || 2) + 1);
  const chiChange = newCHI - currentCHI;
  
  const riskLevel = getRiskLevel(newCHI);

  // Score simulation data
  const scoreSimulation = useMemo(() => {
    const baseScore = user?.creditScore || 742;
    const impact = chiChange > 0 ? 5 : chiChange > -10 ? -5 : -15;
    return [
      { month: 'Now', score: baseScore },
      { month: 'M1', score: baseScore + Math.round(impact * 0.3) },
      { month: 'M2', score: baseScore + Math.round(impact * 0.5) },
      { month: 'M3', score: baseScore + Math.round(impact * 0.7) },
      { month: 'M4', score: baseScore + Math.round(impact * 0.85) },
      { month: 'M5', score: baseScore + impact },
      { month: 'M6', score: baseScore + impact },
    ];
  }, [user?.creditScore, chiChange]);

  const SliderInput = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step, 
    formatValue, 
    icon: Icon 
  }: { 
    label: string; 
    value: number; 
    onChange: (v: number) => void; 
    min: number; 
    max: number; 
    step: number; 
    formatValue: (v: number) => string;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, hsl(25 10% 18%) 0%, hsl(25 10% 14%) 100%)',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
            }}
          >
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span 
          className="text-sm font-bold px-4 py-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, hsl(28 85% 52% / 0.15) 0%, hsl(28 85% 52% / 0.1) 100%)',
            color: 'hsl(28 85% 60%)',
            border: '1px solid hsl(28 85% 52% / 0.2)',
          }}
        >
          {formatValue(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Loan Decision Playground</h1>
          <p className="text-muted-foreground">Play with numbers and see real-time impact on your finances</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="card-stat space-y-8"
          >
            <h2 className="text-lg font-semibold text-foreground">Loan Parameters</h2>

            <SliderInput
              label="Loan Amount"
              value={loanAmount}
              onChange={setLoanAmount}
              min={100000}
              max={5000000}
              step={50000}
              formatValue={(v) => formatCurrency(v)}
              icon={IndianRupee}
            />

            <SliderInput
              label="Interest Rate"
              value={interestRate}
              onChange={setInterestRate}
              min={6}
              max={20}
              step={0.25}
              formatValue={(v) => `${v.toFixed(2)}%`}
              icon={Percent}
            />

            <SliderInput
              label="Tenure (months)"
              value={tenure}
              onChange={setTenure}
              min={12}
              max={84}
              step={6}
              formatValue={(v) => `${v} months`}
              icon={Calendar}
            />

            <div 
              className="pt-8 mt-8"
              style={{ borderTop: '1px solid hsl(25 10% 18%)' }}
            >
              <h3 className="text-sm font-semibold text-muted-foreground mb-6">Your Current Situation</h3>
              
              <div className="space-y-8">
                <SliderInput
                  label="Monthly Expenses"
                  value={monthlyExpenses}
                  onChange={setMonthlyExpenses}
                  min={10000}
                  max={100000}
                  step={5000}
                  formatValue={(v) => formatCurrency(v)}
                  icon={Wallet}
                />

                <SliderInput
                  label="Existing EMIs"
                  value={existingEMIs}
                  onChange={setExistingEMIs}
                  min={0}
                  max={50000}
                  step={1000}
                  formatValue={(v) => formatCurrency(v)}
                  icon={TrendingDown}
                />

                <SliderInput
                  label="Credit Utilization"
                  value={creditUtilization}
                  onChange={setCreditUtilization}
                  min={0}
                  max={100}
                  step={5}
                  formatValue={(v) => `${v}%`}
                  icon={Percent}
                />
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Outputs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* EMI Card - Hero */}
            <div className="card-amber relative overflow-hidden">
              <div 
                className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'hsl(28 85% 52% / 0.1)' }}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <p className="label-subtle">Monthly EMI</p>
                  <span className={newEMIRatio > 40 ? 'badge-risk-high' : newEMIRatio > 30 ? 'badge-risk-medium' : 'badge-risk-low'}>
                    {newEMIRatio.toFixed(0)}% of income
                  </span>
                </div>
                <p className="display-number-lg text-foreground">{formatCurrency(emi)}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card-coral">
                <p className="label-subtle mb-2">Total Interest</p>
                <p className="display-number-xs" style={{ color: 'hsl(8, 65%, 60%)' }}>{formatCurrency(totalInterest)}</p>
              </div>
              <div className="card-stat">
                <p className="label-subtle mb-2">Total Payment</p>
                <p className="display-number-xs text-foreground">{formatCurrency(totalPayment)}</p>
              </div>
            </div>

            {/* Risk Badge */}
            <div className={`${
              riskLevel === 'low' ? 'card-green' : 
              riskLevel === 'medium' ? 'card-amber' : 'card-coral'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-subtle mb-2">Risk Assessment</p>
                  <p className="text-xl font-bold capitalize text-foreground">{riskLevel} Risk</p>
                </div>
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: riskLevel === 'low' 
                      ? 'linear-gradient(135deg, hsl(145 55% 42% / 0.2) 0%, hsl(145 55% 42% / 0.1) 100%)'
                      : riskLevel === 'medium'
                      ? 'linear-gradient(135deg, hsl(38 85% 52% / 0.2) 0%, hsl(38 85% 52% / 0.1) 100%)'
                      : 'linear-gradient(135deg, hsl(8 65% 50% / 0.2) 0%, hsl(8 65% 50% / 0.1) 100%)',
                  }}
                >
                  {riskLevel === 'low' ? (
                    <CheckCircle2 className="w-7 h-7" style={{ color: 'hsl(145, 55%, 55%)' }} />
                  ) : (
                    <AlertCircle className="w-7 h-7" style={{ color: riskLevel === 'medium' ? 'hsl(38, 85%, 60%)' : 'hsl(8, 65%, 60%)' }} />
                  )}
                </div>
              </div>
            </div>

            {/* CHI Change */}
            <div className="card-stat">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="label-subtle mb-2">Credit Health Impact</p>
                  <div className="flex items-baseline gap-3">
                    <span className="display-number-sm text-foreground">{currentCHI}</span>
                    <span className="text-muted-foreground text-xl">→</span>
                    <span className={`display-number-sm`} style={{ color: chiChange >= 0 ? 'hsl(145, 55%, 55%)' : 'hsl(8, 65%, 60%)' }}>
                      {newCHI}
                    </span>
                  </div>
                </div>
                <div className={chiChange >= 0 ? 'trend-up' : 'trend-down'}>
                  {chiChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{chiChange >= 0 ? '+' : ''}{chiChange}</span>
                </div>
              </div>
            </div>

            {/* Score Simulation Chart */}
            <div className="card-teal">
              <p className="label-subtle mb-4">Projected Score Trend</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreSimulation} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(170, 45%, 42%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(170, 45%, 42%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(30, 8%, 50%)', fontSize: 11 }}
                    />
                    <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                    <Tooltip
                      contentStyle={{
                        background: 'linear-gradient(145deg, hsl(25 10% 14%) 0%, hsl(25 10% 11%) 100%)',
                        border: '1px solid hsl(25 10% 20%)',
                        borderRadius: '16px',
                        padding: '12px 16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                      }}
                      labelStyle={{ color: 'hsl(35 20% 92%)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(170, 45%, 50%)"
                      strokeWidth={3}
                      fill="url(#projectionGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendation */}
            <div 
              className="rounded-[24px] p-6"
              style={{
                background: 'linear-gradient(145deg, hsl(28 40% 14%) 0%, hsl(28 35% 10%) 100%)',
                border: '1px solid hsl(28 85% 52% / 0.2)',
                boxShadow: '0 4px 24px -4px hsl(28 85% 52% / 0.1)',
              }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, hsl(28 85% 52% / 0.2) 0%, hsl(28 85% 52% / 0.1) 100%)',
                  }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Recommended Option</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {newEMIRatio > 40 
                      ? `Consider extending tenure to 48 months to reduce EMI to ${formatCurrency(calculateEMI(loanAmount, interestRate, 48))} (${((calculateEMI(loanAmount, interestRate, 48) + existingEMIs) / monthlyIncome * 100).toFixed(0)}% of income)`
                      : newEMIRatio > 30
                      ? 'This loan is affordable but leaves less room for savings. Consider a smaller amount if possible.'
                      : 'This loan fits well within your budget. You have healthy financial headroom.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Playground;
