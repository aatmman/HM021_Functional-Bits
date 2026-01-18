"""
Pydantic schemas for request/response validation.
These match the frontend data contracts.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime
from uuid import UUID


# ============ User & Auth Schemas ============

class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(UserBase):
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    is_active: bool
    is_onboarded: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============ Profile Schemas ============

class ProfileBase(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = ""
    age: Optional[int] = Field(None, ge=18, le=100)
    employment_type: Optional[Literal['Salaried', 'Self-Employed', 'Business Owner', 'Freelancer', 'Student']] = None
    monthly_income: Optional[float] = Field(0, ge=0)
    monthly_expenses: Optional[float] = Field(0, ge=0)
    existing_emis: Optional[float] = Field(0, ge=0)
    credit_utilization: Optional[int] = Field(30, ge=0, le=100)
    active_loans: Optional[int] = Field(0, ge=0)


class ProfileCreate(ProfileBase):
    """Schema for onboarding - completing profile setup."""
    age: int = Field(..., ge=18, le=100)
    employment_type: Literal['Salaried', 'Self-Employed', 'Business Owner', 'Freelancer', 'Student']
    monthly_income: float = Field(..., ge=0)
    monthly_expenses: float = Field(..., ge=0)
    # Optional fields with defaults
    existing_emis: Optional[float] = Field(None, ge=0)
    credit_utilization: Optional[int] = Field(None, ge=0, le=100)
    active_loans: Optional[int] = Field(None, ge=0)


class ProfileUpdate(ProfileBase):
    """Schema for updating profile."""
    pass


class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    credit_score: int = 700  # Will be fetched from credit_scores table
    joined_at: datetime

    class Config:
        from_attributes = True


class FullProfileResponse(ProfileResponse):
    """Full profile with calculated fields for frontend."""
    email: str
    emi_to_income_ratio: float
    disposable_income: float


# ============ Credit Score Schemas ============

class CreditScoreBase(BaseModel):
    score: int = Field(..., ge=300, le=900)
    month: str
    year: int


class CreditScoreCreate(CreditScoreBase):
    pass


class CreditScoreResponse(CreditScoreBase):
    id: str
    recorded_at: datetime

    class Config:
        from_attributes = True


class CreditScoreTrendItem(BaseModel):
    """Single item in credit score trend chart."""
    month: str
    score: int


class CreditScoreTrendResponse(BaseModel):
    """Response for credit score history endpoint."""
    trend: List[CreditScoreTrendItem]
    current_score: int


# ============ CHI (Credit Health Index) Schemas ============

class CHICalculateRequest(BaseModel):
    """Request to calculate CHI with custom parameters."""
    credit_score: int = Field(..., ge=300, le=900)
    emi_to_income_ratio: float = Field(..., ge=0, le=100)
    active_loans: int = Field(..., ge=0)
    missed_payments: int = Field(0, ge=0)


class CHIResponse(BaseModel):
    """CHI calculation response."""
    chi_score: int = Field(..., ge=0, le=100)
    risk_level: Literal['low', 'medium', 'high']
    breakdown: dict


# ============ Risk Alert Schemas ============

class RiskAlertBase(BaseModel):
    title: str
    description: str
    severity: Literal['low', 'medium', 'high']
    rule: str


class RiskAlertResponse(RiskAlertBase):
    id: str
    created_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True


class RiskAlertsListResponse(BaseModel):
    alerts: List[RiskAlertResponse]
    counts: dict  # {'high': 1, 'medium': 2, 'low': 1}


# ============ Loan Playground Schemas ============

class LoanCalculateRequest(BaseModel):
    """Request for loan EMI calculation."""
    loan_amount: float = Field(..., ge=10000)
    interest_rate: float = Field(..., ge=1, le=30)
    tenure_months: int = Field(..., ge=6, le=360)
    # Optional current situation
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    existing_emis: Optional[float] = None
    credit_score: Optional[int] = None
    active_loans: Optional[int] = None


class LoanCalculateResponse(BaseModel):
    """Response for loan calculation."""
    emi: float
    total_interest: float
    total_payment: float
    new_total_emi: float
    new_emi_ratio: float
    current_chi: int
    new_chi: int
    chi_change: int
    risk_level: Literal['low', 'medium', 'high']
    recommendation: str


class LoanComparisonItem(BaseModel):
    """Single loan option for comparison."""
    tenure_months: int
    emi: float
    total_interest: float
    total_payment: float
    emi_ratio: float


class LoanComparisonResponse(BaseModel):
    """Multiple loan scenarios for comparison."""
    loan_amount: float
    interest_rate: float
    options: List[LoanComparisonItem]


# ============ Simulator Schemas ============

class SimulationAction(BaseModel):
    """Available simulation action."""
    id: str
    title: str
    description: str
    impact: int
    direction: Literal['up', 'down']
    explanation: str
    alternative: str


class SimulateRequest(BaseModel):
    """Request to simulate an action."""
    action_id: str
    current_score: Optional[int] = None


class SimulateResponse(BaseModel):
    """Response from simulation."""
    current_score: int
    projected_score: int
    impact: int
    direction: Literal['up', 'down']
    explanation: str
    alternative: str


# ============ Loan CRUD Schemas ============

class LoanBase(BaseModel):
    loan_type: str
    principal_amount: float = Field(..., ge=0)
    interest_rate: float = Field(..., ge=0, le=50)
    tenure_months: int = Field(..., ge=1)


class LoanCreate(LoanBase):
    start_date: Optional[datetime] = None


class LoanUpdate(BaseModel):
    status: Optional[Literal['active', 'closed', 'defaulted']] = None


class LoanResponse(LoanBase):
    id: str
    user_id: str
    emi_amount: float
    start_date: Optional[datetime]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
