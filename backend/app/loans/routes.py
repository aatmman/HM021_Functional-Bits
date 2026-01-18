"""
Loan routes - Playground, comparison, and CRUD operations.
"""
from fastapi import APIRouter, HTTPException, status, Header
from app.core.schemas import (
    LoanCalculateRequest, LoanCalculateResponse,
    LoanComparisonItem, LoanComparisonResponse,
    LoanCreate, LoanUpdate, LoanResponse,
    SimulationAction, SimulateRequest, SimulateResponse
)
from app.core.calculations import (
    calculate_emi, calculate_total_interest, calculate_chi,
    get_risk_level, calculate_emi_to_income_ratio, get_loan_recommendation
)
from app.core.risk_rules import SIMULATION_ACTIONS, simulate_action, get_simulation_action
from app.db.supabase import get_supabase_client
from app.auth.routes import get_user_from_token
from datetime import datetime
from typing import Optional, List
import uuid

router = APIRouter(prefix="/api/loans", tags=["Loans"])


def get_current_user_id(authorization: Optional[str]) -> str:
    """Extract user ID from authorization header."""
    if not authorization:
        return "1"
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    user_id = get_user_from_token(token)
    return user_id or "1"


# Default user values for calculations
DEFAULT_USER = {
    "monthly_income": 85000,
    "monthly_expenses": 35000,
    "existing_emis": 12000,
    "credit_score": 742,
    "active_loans": 2
}


@router.post("/playground/calculate", response_model=LoanCalculateResponse)
async def calculate_loan(
    request: LoanCalculateRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Calculate loan EMI and its impact on credit health.
    This powers the Loan Decision Playground in the frontend.
    """
    user_id = get_current_user_id(authorization)
    
    # Use provided values or fetch from profile
    monthly_income = request.monthly_income or DEFAULT_USER["monthly_income"]
    monthly_expenses = request.monthly_expenses or DEFAULT_USER["monthly_expenses"]
    existing_emis = request.existing_emis or DEFAULT_USER["existing_emis"]
    credit_score = request.credit_score or DEFAULT_USER["credit_score"]
    active_loans = request.active_loans or DEFAULT_USER["active_loans"]
    
    # Try to get real profile data
    try:
        db = get_supabase_client()
        profile_result = db.table("profiles").select("*").eq("user_id", user_id).execute()
        
        if profile_result.data:
            profile = profile_result.data[0]
            if request.monthly_income is None:
                monthly_income = float(profile.get("monthly_income", monthly_income))
            if request.monthly_expenses is None:
                monthly_expenses = float(profile.get("monthly_expenses", monthly_expenses))
            if request.existing_emis is None:
                existing_emis = float(profile.get("existing_emis", existing_emis))
            if request.active_loans is None:
                active_loans = int(profile.get("active_loans", active_loans))
        
        score_result = db.table("credit_scores").select("score").eq("user_id", user_id).order("recorded_at", desc=True).limit(1).execute()
        if score_result.data and request.credit_score is None:
            credit_score = score_result.data[0]["score"]
            
    except Exception:
        pass
    
    # Calculate EMI
    emi = calculate_emi(request.loan_amount, request.interest_rate, request.tenure_months)
    total_interest = calculate_total_interest(request.loan_amount, emi, request.tenure_months)
    total_payment = request.loan_amount + total_interest
    
    # Calculate new totals
    new_total_emi = existing_emis + emi
    current_emi_ratio = calculate_emi_to_income_ratio(existing_emis, monthly_income)
    new_emi_ratio = calculate_emi_to_income_ratio(new_total_emi, monthly_income)
    
    # Calculate CHI change
    current_chi = calculate_chi(credit_score, current_emi_ratio, active_loans)
    new_chi = calculate_chi(credit_score, new_emi_ratio, active_loans + 1)
    chi_change = new_chi - current_chi
    
    # Get risk level
    risk_level = get_risk_level(new_chi)
    
    # Generate recommendation
    recommendation = get_loan_recommendation(new_emi_ratio)
    
    return LoanCalculateResponse(
        emi=emi,
        total_interest=total_interest,
        total_payment=total_payment,
        new_total_emi=new_total_emi,
        new_emi_ratio=round(new_emi_ratio, 2),
        current_chi=current_chi,
        new_chi=new_chi,
        chi_change=chi_change,
        risk_level=risk_level,
        recommendation=recommendation
    )


@router.get("/comparison", response_model=LoanComparisonResponse)
async def compare_loan_options(
    loan_amount: float,
    interest_rate: float,
    monthly_income: Optional[float] = None,
    existing_emis: Optional[float] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Compare different tenure options for a loan.
    Shows EMI, total interest, and affordability for each option.
    """
    user_id = get_current_user_id(authorization)
    
    income = monthly_income or DEFAULT_USER["monthly_income"]
    emis = existing_emis or DEFAULT_USER["existing_emis"]
    
    # Try to get real values
    try:
        db = get_supabase_client()
        profile_result = db.table("profiles").select("monthly_income, existing_emis").eq("user_id", user_id).execute()
        
        if profile_result.data:
            profile = profile_result.data[0]
            if monthly_income is None:
                income = float(profile.get("monthly_income", income))
            if existing_emis is None:
                emis = float(profile.get("existing_emis", emis))
    except Exception:
        pass
    
    # Calculate for different tenures
    tenures = [12, 24, 36, 48, 60, 72, 84]
    options = []
    
    for tenure in tenures:
        emi = calculate_emi(loan_amount, interest_rate, tenure)
        total_interest = calculate_total_interest(loan_amount, emi, tenure)
        total_payment = loan_amount + total_interest
        new_emi_ratio = calculate_emi_to_income_ratio(emis + emi, income)
        
        options.append(LoanComparisonItem(
            tenure_months=tenure,
            emi=emi,
            total_interest=total_interest,
            total_payment=total_payment,
            emi_ratio=round(new_emi_ratio, 2)
        ))
    
    return LoanComparisonResponse(
        loan_amount=loan_amount,
        interest_rate=interest_rate,
        options=options
    )


# ============ Simulator Routes ============

@router.get("/simulator/actions", response_model=List[SimulationAction])
async def get_simulation_actions():
    """
    Get all available simulation actions.
    These are the "what-if" scenarios users can simulate.
    """
    return [SimulationAction(**action) for action in SIMULATION_ACTIONS]


@router.post("/simulator/simulate", response_model=SimulateResponse)
async def run_simulation(
    request: SimulateRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Simulate the impact of a specific action on credit score.
    """
    user_id = get_current_user_id(authorization)
    
    # Get current score
    current_score = request.current_score or DEFAULT_USER["credit_score"]
    
    if request.current_score is None:
        try:
            db = get_supabase_client()
            score_result = db.table("credit_scores").select("score").eq("user_id", user_id).order("recorded_at", desc=True).limit(1).execute()
            if score_result.data:
                current_score = score_result.data[0]["score"]
        except Exception:
            pass
    
    # Run simulation
    result = simulate_action(request.action_id, current_score)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Simulation action '{request.action_id}' not found"
        )
    
    return SimulateResponse(**result)


# ============ Loan CRUD Routes ============

@router.get("/", response_model=List[LoanResponse])
async def get_loans(authorization: Optional[str] = Header(None)):
    """
    Get all loans for the current user.
    """
    user_id = get_current_user_id(authorization)
    
    try:
        db = get_supabase_client()
        result = db.table("loans").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        if result.data:
            return [
                LoanResponse(
                    id=loan["id"],
                    user_id=loan["user_id"],
                    loan_type=loan["loan_type"],
                    principal_amount=float(loan["principal_amount"]),
                    interest_rate=float(loan["interest_rate"]),
                    tenure_months=loan["tenure_months"],
                    emi_amount=float(loan["emi_amount"]),
                    start_date=datetime.fromisoformat(loan["start_date"].replace("Z", "+00:00")) if loan.get("start_date") else None,
                    status=loan["status"],
                    created_at=datetime.fromisoformat(loan["created_at"].replace("Z", "+00:00"))
                )
                for loan in result.data
            ]
    except Exception:
        pass
    
    # Return empty list for development
    return []


@router.post("/", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(
    loan_data: LoanCreate,
    authorization: Optional[str] = Header(None)
):
    """
    Add a new loan record.
    """
    user_id = get_current_user_id(authorization)
    
    # Calculate EMI
    emi = calculate_emi(
        loan_data.principal_amount,
        loan_data.interest_rate,
        loan_data.tenure_months
    )
    
    loan_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    try:
        db = get_supabase_client()
        
        loan_record = {
            "id": loan_id,
            "user_id": user_id,
            "loan_type": loan_data.loan_type,
            "principal_amount": loan_data.principal_amount,
            "interest_rate": loan_data.interest_rate,
            "tenure_months": loan_data.tenure_months,
            "emi_amount": emi,
            "start_date": loan_data.start_date.isoformat() if loan_data.start_date else now.isoformat(),
            "status": "active",
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        
        result = db.table("loans").insert(loan_record).execute()
        
        if result.data:
            # Update profile active_loans count
            db.rpc("increment_active_loans", {"user_id_param": user_id}).execute()
            
            return LoanResponse(
                id=loan_id,
                user_id=user_id,
                loan_type=loan_data.loan_type,
                principal_amount=loan_data.principal_amount,
                interest_rate=loan_data.interest_rate,
                tenure_months=loan_data.tenure_months,
                emi_amount=emi,
                start_date=loan_data.start_date or now,
                status="active",
                created_at=now
            )
            
    except Exception:
        pass
    
    # Mock response for development
    return LoanResponse(
        id=loan_id,
        user_id=user_id,
        loan_type=loan_data.loan_type,
        principal_amount=loan_data.principal_amount,
        interest_rate=loan_data.interest_rate,
        tenure_months=loan_data.tenure_months,
        emi_amount=emi,
        start_date=loan_data.start_date or now,
        status="active",
        created_at=now
    )
