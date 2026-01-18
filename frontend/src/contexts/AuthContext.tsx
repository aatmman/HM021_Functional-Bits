import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUser } from '@/lib/mockData';
import { authApi, profileApi, setToken, clearToken, Profile } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  age: number;
  employmentType: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingEMIs: number;
  creditScore: number;
  creditUtilization: number;
  activeLoans: number;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert API profile to frontend User format
const profileToUser = (profile: Profile): User => ({
  id: profile.id,
  name: profile.name || profile.email.split('@')[0],
  email: profile.email,
  avatar: profile.avatar || '',
  age: profile.age || 25,
  employmentType: profile.employment_type || 'Salaried',
  monthlyIncome: profile.monthly_income,
  monthlyExpenses: profile.monthly_expenses,
  existingEMIs: profile.existing_emis,
  creditScore: profile.credit_score,
  creditUtilization: profile.credit_utilization,
  activeLoans: profile.active_loans,
  joinedAt: profile.joined_at,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const profile = await profileApi.getProfile();
          setUser(profileToUser(profile));
          setIsOnboarded(profile.age !== null && profile.employment_type !== null);
        } catch (error) {
          // Token invalid, clear it
          clearToken();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      // Fetch full profile after login
      const profile = await profileApi.getProfile();
      setUser(profileToUser(profile));
      setIsOnboarded(response.user.is_onboarded);
    } catch (error) {
      // Fallback to mock for development if API fails
      console.warn('API login failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 800));
      setUser(mockUser);
      setIsOnboarded(true);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await authApi.signup({ email, password });
      console.log('Signup successful, token stored:', !!localStorage.getItem('auth_token'));

      // Fetch profile after signup
      const profile = await profileApi.getProfile();
      setUser(profileToUser(profile));
      setIsOnboarded(response.user.is_onboarded || false); // New user needs onboarding
    } catch (error) {
      // Fallback to mock for development
      console.warn('API signup failed, using mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 800));
      setUser({
        ...mockUser,
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
      });
      setIsOnboarded(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
    clearToken();
    setUser(null);
    setIsOnboarded(false);
  };

  const completeOnboarding = async (data: Partial<User>) => {
    try {
      const onboardingData = {
        name: data.name,
        age: data.age!,
        employment_type: data.employmentType!,
        monthly_income: data.monthlyIncome!,
        monthly_expenses: data.monthlyExpenses!,
        existing_emis: data.existingEMIs,
        credit_utilization: data.creditUtilization,
        active_loans: data.activeLoans,
      };

      const profile = await profileApi.completeOnboarding(onboardingData);
      setUser(profileToUser(profile));
      setIsOnboarded(true);
    } catch (error) {
      console.warn('Onboarding API call failed, using local state:', error);
      if (user) {
        setUser({ ...user, ...data });
      }
      setIsOnboarded(true);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await profileApi.getProfile();
      setUser(profileToUser(profile));
    } catch (error) {
      console.warn('Failed to refresh profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isOnboarded,
      isLoading,
      login,
      signup,
      logout,
      completeOnboarding,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
