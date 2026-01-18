/**
 * API Service for Credit Decision Coach
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = 'http://localhost:8000/api';

// Helper to get auth token from storage
const getToken = (): string | null => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.warn('[API] No auth token found in localStorage');
  }
  return token;
};

// Helper to set auth token
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Helper to clear auth token
export const clearToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Base fetch wrapper with auth
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    console.log(`[API] Request to ${endpoint} with token: ${token.substring(0, 20)}...`);
  } else {
    console.warn(`[API] Request to ${endpoint} without token`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok && response.status === 401) {
    console.error(`[API] 401 Unauthorized for ${endpoint}. Token present: ${!!token}`);
  }

  return response;
};

// Generic API call handler
const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetchWithAuth(endpoint, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    const errorMessage = error.detail || error.message || `HTTP error! status: ${response.status}`;
    console.error(`[API] Error ${response.status} for ${endpoint}:`, error);
    throw new Error(errorMessage);
  }

  return response.json();
};

// ============ Auth API ============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_onboarded: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(response.access_token);
    return response;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('[API] Signup response received, setting token:', response.access_token ? 'Token present' : 'No token');
    setToken(response.access_token);
    console.log('[API] Token stored, verifying:', localStorage.getItem('auth_token') ? 'Stored' : 'Not stored');
    return response;
  },

  logout: async (): Promise<void> => {
    await fetchWithAuth('/auth/logout', { method: 'POST' });
    clearToken();
  },

  getCurrentUser: async (): Promise<User> => {
    return apiCall<User>('/auth/me');
  },
};

// ============ Profile API ============

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  avatar: string;
  age: number | null;
  employment_type: string | null;
  monthly_income: number;
  monthly_expenses: number;
  existing_emis: number;
  credit_utilization: number;
  active_loans: number;
  credit_score: number;
  joined_at: string;
  email: string;
  emi_to_income_ratio: number;
  disposable_income: number;
}

export interface OnboardingData {
  name?: string;
  age: number;
  employment_type: string;
  monthly_income: number;
  monthly_expenses: number;
  existing_emis?: number;
  credit_utilization?: number;
  active_loans?: number;
}

export const profileApi = {
  getProfile: async (): Promise<Profile> => {
    return apiCall<Profile>('/profiles/me');
  },

  completeOnboarding: async (data: OnboardingData): Promise<Profile> => {
    return apiCall<Profile>('/profiles/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProfile: async (data: Partial<OnboardingData>): Promise<Profile> => {
    return apiCall<Profile>('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============ Credit Score API ============

export interface CreditScoreTrendItem {
  month: string;
  score: number;
}

export interface CreditScoreHistory {
  trend: CreditScoreTrendItem[];
  current_score: number;
}

export const creditScoreApi = {
  getHistory: async (): Promise<CreditScoreHistory> => {
    return apiCall<CreditScoreHistory>('/credit-scores/history');
  },

  getCurrentScore: async (): Promise<{ score: number }> => {
    return apiCall<{ score: number }>('/credit-scores/current');
  },
};

// ============ CHI API ============

export interface CHIResponse {
  chi_score: number;
  risk_level: 'low' | 'medium' | 'high';
  breakdown: Record<string, unknown>;
}

export interface CHICalculateRequest {
  credit_score: number;
  emi_to_income_ratio: number;
  active_loans: number;
  missed_payments?: number;
}

export const chiApi = {
  getCurrent: async (): Promise<CHIResponse> => {
    return apiCall<CHIResponse>('/chi/current');
  },

  calculate: async (data: CHICalculateRequest): Promise<CHIResponse> => {
    return apiCall<CHIResponse>('/chi/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============ Risk Alerts API ============

export interface RiskAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  rule: string;
  created_at: string;
  is_active: boolean;
}

export interface RiskAlertsResponse {
  alerts: RiskAlert[];
  counts: { high: number; medium: number; low: number };
}

export const riskAlertsApi = {
  getAlerts: async (): Promise<RiskAlertsResponse> => {
    return apiCall<RiskAlertsResponse>('/risk-alerts');
  },

  getAlert: async (id: string): Promise<RiskAlert> => {
    return apiCall<RiskAlert>(`/risk-alerts/${id}`);
  },

  regenerate: async (): Promise<RiskAlertsResponse> => {
    return apiCall<RiskAlertsResponse>('/risk-alerts/generate', {
      method: 'POST',
    });
  },
};

// ============ Loans API ============

export interface LoanCalculateRequest {
  loan_amount: number;
  interest_rate: number;
  tenure_months: number;
  monthly_income?: number;
  monthly_expenses?: number;
  existing_emis?: number;
  credit_score?: number;
  active_loans?: number;
}

export interface LoanCalculateResponse {
  emi: number;
  total_interest: number;
  total_payment: number;
  new_total_emi: number;
  new_emi_ratio: number;
  current_chi: number;
  new_chi: number;
  chi_change: number;
  risk_level: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface LoanComparisonItem {
  tenure_months: number;
  emi: number;
  total_interest: number;
  total_payment: number;
  emi_ratio: number;
}

export interface LoanComparisonResponse {
  loan_amount: number;
  interest_rate: number;
  options: LoanComparisonItem[];
}

export const loansApi = {
  calculatePlayground: async (data: LoanCalculateRequest): Promise<LoanCalculateResponse> => {
    return apiCall<LoanCalculateResponse>('/loans/playground/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getComparison: async (
    loanAmount: number,
    interestRate: number,
    monthlyIncome?: number,
    existingEmis?: number
  ): Promise<LoanComparisonResponse> => {
    const params = new URLSearchParams({
      loan_amount: loanAmount.toString(),
      interest_rate: interestRate.toString(),
    });
    if (monthlyIncome) params.append('monthly_income', monthlyIncome.toString());
    if (existingEmis) params.append('existing_emis', existingEmis.toString());

    return apiCall<LoanComparisonResponse>(`/loans/comparison?${params}`);
  },
};

// ============ Simulator API ============

export interface SimulationAction {
  id: string;
  title: string;
  description: string;
  impact: number;
  direction: 'up' | 'down';
  explanation: string;
  alternative: string;
}

export interface SimulateResponse {
  current_score: number;
  projected_score: number;
  impact: number;
  direction: 'up' | 'down';
  explanation: string;
  alternative: string;
}

export const simulatorApi = {
  getActions: async (): Promise<SimulationAction[]> => {
    return apiCall<SimulationAction[]>('/loans/simulator/actions');
  },

  simulate: async (actionId: string, currentScore?: number): Promise<SimulateResponse> => {
    return apiCall<SimulateResponse>('/loans/simulator/simulate', {
      method: 'POST',
      body: JSON.stringify({
        action_id: actionId,
        current_score: currentScore,
      }),
    });
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  profile: profileApi,
  creditScore: creditScoreApi,
  chi: chiApi,
  riskAlerts: riskAlertsApi,
  loans: loansApi,
  simulator: simulatorApi,
};

export default api;
