import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, calculateCHI, getRiskLevel } from '@/lib/mockData';
import {
  User,
  Mail,
  Calendar,
  Briefcase,
  Wallet,
  CreditCard,
  Shield,
  LogOut,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  if (!user) return null;

  const emiToIncomeRatio = ((user.existingEMIs / user.monthlyIncome) * 100);
  const chi = calculateCHI(user.creditScore, emiToIncomeRatio, user.activeLoans, 0);
  const riskLevel = getRiskLevel(chi);

  const profileSections = [
    {
      title: 'Personal Information',
      icon: User,
      items: [
        { label: 'Full Name', value: user.name },
        { label: 'Email', value: user.email },
        { label: 'Age', value: `${user.age} years` },
        { label: 'Employment', value: user.employmentType },
      ],
    },
    {
      title: 'Financial Profile',
      icon: Wallet,
      items: [
        { label: 'Monthly Income', value: formatCurrency(user.monthlyIncome) },
        { label: 'Monthly Expenses', value: formatCurrency(user.monthlyExpenses) },
        { label: 'Existing EMIs', value: formatCurrency(user.existingEMIs) },
        { label: 'Disposable Income', value: formatCurrency(user.monthlyIncome - user.monthlyExpenses - user.existingEMIs) },
      ],
    },
    {
      title: 'Credit Information',
      icon: CreditCard,
      items: [
        { label: 'Credit Score', value: user.creditScore.toString() },
        { label: 'Active Loans', value: user.activeLoans.toString() },
        { label: 'Credit Utilization', value: `${user.creditUtilization}%` },
        { label: 'EMI-to-Income Ratio', value: `${emiToIncomeRatio.toFixed(1)}%` },
      ],
    },
  ];

  const settingsItems = [
    { label: 'Account Security', description: 'Password and 2FA settings', icon: Shield },
    { label: 'Notification Preferences', description: 'Email and push notifications', icon: Mail },
    { label: 'Connected Accounts', description: 'Linked bank accounts and cards', icon: CreditCard },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="card-stat text-center">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-primary">
                  {user.name.charAt(0)}
                </span>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-1">{user.name}</h2>
              <p className="text-muted-foreground mb-4">{user.email}</p>

              <div className="flex items-center justify-center gap-2 mb-6">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Member since {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30">
                <div>
                  <p className="label-subtle mb-1">CHI Score</p>
                  <p className={`text-2xl font-bold ${riskLevel === 'low' ? 'text-success' :
                    riskLevel === 'medium' ? 'text-warning' : 'text-destructive'
                    }`}>{chi}</p>
                </div>
                <div>
                  <p className="label-subtle mb-1">Credit Score</p>
                  <p className="text-2xl font-bold text-foreground">{user.creditScore}</p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full mt-6 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {profileSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                className="card-stat"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {section.items.map((item) => (
                    <div key={item.label} className="p-4 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card-stat"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">Settings</h3>

              <div className="space-y-3">
                {settingsItems.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
