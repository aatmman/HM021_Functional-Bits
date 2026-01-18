"""
Credit Health Index (CHI) routes.
CHI is a composite score (0-100) that represents overall credit health.
"""
from fastapi import APIRouter, Header
from app.core.schemas import CHICalculateRequest, CHIResponse
from app.core.calculations import calculate_chi, get_chi_breakdown, get_risk_level
from app.db.supabase import get_supabase_client
from app.auth.routes import get_user_from_token
from typing import Optional

router = APIRouter(prefix="/api/chi", tags=["Credit Health Index"])


def get_current_user_id(authorization: Optional[str]) -> str:
    """Extract user ID from authorization header."""
    if not authorization:
        return "1"
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    user_id = get_user_from_token(token)
    return user_id or "1"


@router.get("/current", response_model=CHIResponse)
async def get_current_chi(authorization: Optional[str] = Header(None)):
    """
    Get the current user's Credit Health Index.
    Calculates CHI based on current profile and credit data.
    """
    user_id = get_current_user_id(authorization)
    
    # Default values (will use real data if available)
    credit_score = 742
    monthly_income = 85000
    existing_emis = 12000
    active_loans = 2
    missed_payments = 0
    
    try:
        db = get_supabase_client()
        
        # Get profile
        profile_result = db.table("profiles").select("*").eq("user_id", user_id).execute()
        if profile_result.data:
            profile = profile_result.data[0]
            monthly_income = float(profile.get("monthly_income", 85000))
            existing_emis = float(profile.get("existing_emis", 12000))
            active_loans = int(profile.get("active_loans", 2))
        
        # Get credit score
        score_result = db.table("credit_scores").select("score").eq("user_id", user_id).order("recorded_at", desc=True).limit(1).execute()
        if score_result.data:
            credit_score = score_result.data[0]["score"]
            
    except Exception:
        pass
    
    # Calculate EMI ratio
    emi_ratio = (existing_emis / monthly_income * 100) if monthly_income > 0 else 0
    
    # Calculate CHI
    chi_score = calculate_chi(credit_score, emi_ratio, active_loans, missed_payments)
    risk_level = get_risk_level(chi_score)
    breakdown = get_chi_breakdown(credit_score, emi_ratio, active_loans, missed_payments)
    
    return CHIResponse(
        chi_score=chi_score,
        risk_level=risk_level,
        breakdown=breakdown
    )


@router.post("/calculate", response_model=CHIResponse)
async def calculate_chi_score(params: CHICalculateRequest):
    """
    Calculate CHI with custom parameters.
    Useful for simulating different scenarios (e.g., in Playground).
    """
    chi_score = calculate_chi(
        params.credit_score,
        params.emi_to_income_ratio,
        params.active_loans,
        params.missed_payments
    )
    risk_level = get_risk_level(chi_score)
    breakdown = get_chi_breakdown(
        params.credit_score,
        params.emi_to_income_ratio,
        params.active_loans,
        params.missed_payments
    )
    
    return CHIResponse(
        chi_score=chi_score,
        risk_level=risk_level,
        breakdown=breakdown
    )
