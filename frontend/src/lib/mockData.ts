// Mock data for Credit Decision Coach

export const mockUser = {
  id: "1",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  avatar: "",
  age: 28,
  employmentType: "Salaried",
  monthlyIncome: 85000,
  monthlyExpenses: 35000,
  existingEMIs: 12000,
  creditScore: 742,
  creditUtilization: 35,
  activeLoans: 2,
  joinedAt: "2024-06-15",
};

export const creditScoreTrend = [
  { month: "Jul", score: 698 },
  { month: "Aug", score: 705 },
  { month: "Sep", score: 712 },
  { month: "Oct", score: 725 },
  { month: "Nov", score: 738 },
  { month: "Dec", score: 742 },
];

export const calculateCHI = (
  creditScore: number,
  emiToIncomeRatio: number,
  activeLoans: number,
  missedPayments: number = 0
): number => {
  // Weighted composite score calculation
  const scoreComponent = (creditScore / 900) * 40;
  const emiComponent = Math.max(0, (1 - emiToIncomeRatio / 100) * 30);
  const loanComponent = Math.max(0, (1 - activeLoans / 10) * 15);
  const paymentComponent = Math.max(0, (1 - missedPayments / 5) * 15);
  
  return Math.round(scoreComponent + emiComponent + loanComponent + paymentComponent);
};

export const getRiskLevel = (chi: number): 'low' | 'medium' | 'high' => {
  if (chi >= 70) return 'low';
  if (chi >= 40) return 'medium';
  return 'high';
};

export const riskAlerts = [
  {
    id: "1",
    title: "High EMI Burden",
    description: "Your EMI consumes 46% of your income. This may reduce future loan eligibility.",
    severity: "high" as const,
    rule: "EMI > 40% of income",
    createdAt: "2024-12-15",
  },
  {
    id: "2",
    title: "Credit Utilization Rising",
    description: "Your credit utilization is at 65%. Consider paying down balances.",
    severity: "medium" as const,
    rule: "Credit utilization > 60%",
    createdAt: "2024-12-10",
  },
  {
    id: "3",
    title: "Score Improvement",
    description: "Your credit score has improved by 44 points in the last 6 months.",
    severity: "low" as const,
    rule: "Positive trend detected",
    createdAt: "2024-12-01",
  },
];

export const simulationActions = [
  {
    id: "miss_emi",
    title: "Miss 1 EMI",
    description: "See the impact of missing a single EMI payment",
    impact: -35,
    direction: "down" as const,
    explanation: "Missing one EMI may reduce your score by ~30-40 points. Payment history accounts for 35% of your credit score.",
    alternative: "Set up auto-debit or extend tenure by 6 months to reduce EMI by ₹2,100 if you're tight on cash.",
  },
  {
    id: "increase_util",
    title: "Increase Utilization",
    description: "Use more of your available credit limit",
    impact: -25,
    direction: "down" as const,
    explanation: "Increasing utilization above 70% signals credit dependency. Each 10% increase above 30% costs ~5-10 points.",
    alternative: "Request a credit limit increase instead, or spread expenses across multiple cards.",
  },
  {
    id: "extend_tenure",
    title: "Extend Tenure",
    description: "Increase your loan repayment period",
    impact: 5,
    direction: "up" as const,
    explanation: "Extending tenure lowers your EMI-to-income ratio, which can slightly improve your credit health index.",
    alternative: "Consider this option if you need immediate cash flow relief.",
  },
  {
    id: "close_loan",
    title: "Close a Loan",
    description: "Pay off and close an existing loan",
    impact: 15,
    direction: "up" as const,
    explanation: "Closing a loan reduces your debt burden and may improve your score by 10-20 points over 2-3 months.",
    alternative: "Prioritize closing high-interest loans first for maximum impact.",
  },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateEMI = (principal: number, rate: number, tenure: number): number => {
  const monthlyRate = rate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
};

export const calculateTotalInterest = (principal: number, emi: number, tenure: number): number => {
  return (emi * tenure) - principal;
};
