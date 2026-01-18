-- Credit Decision Coach Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_onboarded BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (financial data)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    avatar VARCHAR(500),
    age INTEGER CHECK (age >= 18 AND age <= 100),
    employment_type VARCHAR(50) CHECK (employment_type IN ('Salaried', 'Self-Employed', 'Business Owner', 'Freelancer', 'Student')),
    monthly_income DECIMAL(12, 2) DEFAULT 0,
    monthly_expenses DECIMAL(12, 2) DEFAULT 0,
    existing_emis DECIMAL(12, 2) DEFAULT 0,
    credit_utilization INTEGER CHECK (credit_utilization >= 0 AND credit_utilization <= 100) DEFAULT 30,
    active_loans INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit scores table (historical data)
CREATE TABLE IF NOT EXISTS credit_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 300 AND score <= 900),
    month VARCHAR(10) NOT NULL,
    year INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_type VARCHAR(50) NOT NULL,
    principal_amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    emi_amount DECIMAL(12, 2) NOT NULL,
    start_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'defaulted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHI scores table (historical)
CREATE TABLE IF NOT EXISTS chi_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    risk_level VARCHAR(10) CHECK (risk_level IN ('low', 'medium', 'high')),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk alerts table
CREATE TABLE IF NOT EXISTS risk_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    rule VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_recorded ON credit_scores(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_chi_scores_user_id ON chi_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_user_id ON risk_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_active ON risk_alerts(user_id, is_active);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
-- Drop triggers if they exist, then create them
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- NOTE: Since we're using custom JWT (not Supabase Auth), auth.uid() won't work.
-- The backend uses service_role_key which bypasses RLS.
-- If you want to use RLS with custom JWT, you'll need to create custom policies.
-- For now, RLS is enabled but policies use auth.uid() which won't match custom JWT.
-- Consider either:
-- 1. Disable RLS: ALTER TABLE <table> DISABLE ROW LEVEL SECURITY;
-- 2. Use service_role_key for all operations (current approach)
-- 3. Create custom RLS policies that work with your application logic

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chi_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
-- NOTE: These policies use auth.uid() which requires Supabase Auth.
-- Since we're using custom JWT, these won't work. The backend uses service_role_key
-- which bypasses RLS, so these policies are effectively ignored.
-- Drop policies if they exist, then create them
DROP POLICY IF EXISTS "Users can view own data" ON profiles;
CREATE POLICY "Users can view own data" ON profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own data" ON profiles;
CREATE POLICY "Users can update own data" ON profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own credit scores" ON credit_scores;
CREATE POLICY "Users can view own credit scores" ON credit_scores FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own loans" ON loans;
CREATE POLICY "Users can view own loans" ON loans FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own chi scores" ON chi_scores;
CREATE POLICY "Users can view own chi scores" ON chi_scores FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own risk alerts" ON risk_alerts;
CREATE POLICY "Users can view own risk alerts" ON risk_alerts FOR SELECT USING (auth.uid() = user_id);
