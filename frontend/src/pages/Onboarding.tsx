import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Wallet, 
  CreditCard, 
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  age: string;
  employmentType: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  existingEMIs: string;
  creditScore: string;
  activeLoans: string;
  creditUtilization: string;
}

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    age: '',
    employmentType: 'Salaried',
    monthlyIncome: '',
    monthlyExpenses: '',
    existingEMIs: '',
    creditScore: '',
    activeLoans: '',
    creditUtilization: '',
  });
  const { isAuthenticated, isOnboarded, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  const totalSteps = 4;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding({
        age: parseInt(formData.age) || 25,
        employmentType: formData.employmentType,
        monthlyIncome: parseInt(formData.monthlyIncome) || 50000,
        monthlyExpenses: parseInt(formData.monthlyExpenses) || 20000,
        existingEMIs: parseInt(formData.existingEMIs) || 0,
        creditScore: parseInt(formData.creditScore) || 700,
        activeLoans: parseInt(formData.activeLoans) || 0,
        creditUtilization: parseInt(formData.creditUtilization) || 30,
      });
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const employmentTypes = ['Salaried', 'Self-Employed', 'Business Owner', 'Freelancer', 'Student'];

  const stepConfig = {
    1: { icon: User, title: 'Basic Profile', subtitle: "Let's start with some basic information about you" },
    2: { icon: Wallet, title: 'Your Finances', subtitle: 'Tell us about your income and expenses' },
    3: { icon: CreditCard, title: 'Credit Snapshot', subtitle: 'Help us understand your current credit situation' },
    4: { icon: CheckCircle2, title: 'All Set!', subtitle: "Review your information and let's get started" },
  };

  const currentStep = stepConfig[step as keyof typeof stepConfig];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header 
        className="p-6"
        style={{ borderBottom: '1px solid hsl(25 10% 12%)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(28 85% 52%) 0%, hsl(25 80% 45%) 100%)',
              boxShadow: '0 4px 20px -4px hsl(28 85% 52% / 0.4)',
            }}
          >
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">Credit Decision Coach</span>
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 py-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all"
                style={{
                  background: s === step
                    ? 'linear-gradient(135deg, hsl(28 85% 52%) 0%, hsl(25 80% 45%) 100%)'
                    : s < step
                    ? 'linear-gradient(135deg, hsl(145 55% 42%) 0%, hsl(145 50% 35%) 100%)'
                    : 'linear-gradient(145deg, hsl(25 10% 16%) 0%, hsl(25 10% 12%) 100%)',
                  color: s <= step ? 'hsl(20 8% 6%)' : 'hsl(30 8% 50%)',
                  boxShadow: s === step ? '0 4px 16px -4px hsl(28 85% 52% / 0.4)' : 'none',
                }}
              >
                {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
          <div 
            className="h-3 rounded-full overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(25 10% 10%) 0%, hsl(25 10% 8%) 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(28 85% 48%) 0%, hsl(28 85% 52%) 100%)',
                boxShadow: '0 0 12px hsl(28 85% 52% / 0.4)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className="text-center mb-10">
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: 'linear-gradient(145deg, hsl(28 40% 16%) 0%, hsl(28 35% 12%) 100%)',
                    boxShadow: '0 4px 20px -4px hsl(28 85% 52% / 0.2)',
                    border: '1px solid hsl(28 85% 52% / 0.2)',
                  }}
                >
                  <currentStep.icon className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {currentStep.title}
                </h2>
                <p className="text-muted-foreground">{currentStep.subtitle}</p>
              </div>

              {/* Step Content */}
              <div className="card-stat p-8">
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Your Age</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => updateFormData('age', e.target.value)}
                        placeholder="25"
                        className="input-premium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-4">Employment Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        {employmentTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => updateFormData('employmentType', type)}
                            className="p-4 rounded-2xl text-left transition-all duration-300"
                            style={{
                              background: formData.employmentType === type
                                ? 'linear-gradient(145deg, hsl(28 40% 16%) 0%, hsl(28 35% 12%) 100%)'
                                : 'linear-gradient(145deg, hsl(25 10% 14%) 0%, hsl(25 10% 11%) 100%)',
                              border: formData.employmentType === type
                                ? '1px solid hsl(28 85% 52% / 0.4)'
                                : '1px solid hsl(25 10% 18%)',
                              color: formData.employmentType === type ? 'hsl(28 85% 60%)' : 'hsl(35 20% 92%)',
                            }}
                          >
                            <Briefcase className="w-5 h-5 mb-2" />
                            <span className="text-sm font-medium">{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={formData.monthlyIncome}
                        onChange={(e) => updateFormData('monthlyIncome', e.target.value)}
                        placeholder="50000"
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Monthly Expenses (₹)</label>
                      <input
                        type="number"
                        value={formData.monthlyExpenses}
                        onChange={(e) => updateFormData('monthlyExpenses', e.target.value)}
                        placeholder="20000"
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Existing EMIs (₹/month)</label>
                      <input
                        type="number"
                        value={formData.existingEMIs}
                        onChange={(e) => updateFormData('existingEMIs', e.target.value)}
                        placeholder="0"
                        className="input-premium"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Current Credit Score (300-900)</label>
                      <input
                        type="number"
                        value={formData.creditScore}
                        onChange={(e) => updateFormData('creditScore', e.target.value)}
                        placeholder="700"
                        min="300"
                        max="900"
                        className="input-premium"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Leave blank if you don't know — we'll estimate it</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Number of Active Loans</label>
                      <input
                        type="number"
                        value={formData.activeLoans}
                        onChange={(e) => updateFormData('activeLoans', e.target.value)}
                        placeholder="0"
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Credit Utilization (%)</label>
                      <input
                        type="number"
                        value={formData.creditUtilization}
                        onChange={(e) => updateFormData('creditUtilization', e.target.value)}
                        placeholder="30"
                        min="0"
                        max="100"
                        className="input-premium"
                      />
                      <p className="text-xs text-muted-foreground mt-2">How much of your credit limit do you typically use?</p>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Age', value: `${formData.age || '25'} years` },
                        { label: 'Employment', value: formData.employmentType },
                        { label: 'Monthly Income', value: `₹${parseInt(formData.monthlyIncome || '50000').toLocaleString()}` },
                        { label: 'Monthly Expenses', value: `₹${parseInt(formData.monthlyExpenses || '20000').toLocaleString()}` },
                        { label: 'Existing EMIs', value: `₹${parseInt(formData.existingEMIs || '0').toLocaleString()}` },
                        { label: 'Credit Score', value: formData.creditScore || '~700' },
                      ].map((item) => (
                        <div 
                          key={item.label}
                          className="p-4 rounded-2xl"
                          style={{
                            background: 'linear-gradient(145deg, hsl(25 10% 16%) 0%, hsl(25 10% 12%) 100%)',
                          }}
                        >
                          <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                          <p className="font-semibold text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div 
                      className="p-5 rounded-2xl"
                      style={{
                        background: 'linear-gradient(145deg, hsl(145 25% 13%) 0%, hsl(145 20% 9%) 100%)',
                        border: '1px solid hsl(145 55% 42% / 0.3)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: 'hsl(145, 55%, 55%)' }} />
                        <div>
                          <p className="font-medium text-foreground">You're all set!</p>
                          <p className="text-sm text-muted-foreground">
                            We'll use this information to personalize your credit health dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="text-muted-foreground hover:text-foreground rounded-full px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              className="rounded-full px-8 h-12 font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, hsl(28 85% 52%) 0%, hsl(25 80% 45%) 100%)',
                color: 'hsl(20 8% 6%)',
                boxShadow: '0 4px 16px -4px hsl(28 85% 52% / 0.4)',
              }}
            >
              {step === totalSteps ? 'Finish Setup' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
