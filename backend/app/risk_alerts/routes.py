"""
Risk alerts routes.
Rule-based alerts that warn users about credit health issues.
"""
from fastapi import APIRouter, HTTPException, status, Header
from app.core.schemas import RiskAlertResponse, RiskAlertsListResponse
from app.core.risk_rules import generate_risk_alerts, get_alert_counts
from app.db.supabase import get_supabase_client
from app.auth.routes import get_user_from_token
from datetime import datetime
from typing import Optional, List

router = APIRouter(prefix="/api/risk-alerts", tags=["Risk Alerts"])

# Mock data for development (matches frontend mockData.ts)
MOCK_ALERTS = [
    {
        "id": "1",
        "title": "High EMI Burden",
        "description": "Your EMI consumes 46% of your income. This may reduce future loan eligibility.",
        "severity": "high",
        "rule": "EMI > 40% of income",
        "created_at": "2024-12-15T00:00:00Z",
        "is_active": True
    },
    {
        "id": "2",
        "title": "Credit Utilization Rising",
        "description": "Your credit utilization is at 65%. Consider paying down balances.",
        "severity": "medium",
        "rule": "Credit utilization > 60%",
        "created_at": "2024-12-10T00:00:00Z",
        "is_active": True
    },
    {
        "id": "3",
        "title": "Score Improvement",
        "description": "Your credit score has improved by 44 points in the last 6 months.",
        "severity": "low",
        "rule": "Positive trend detected",
        "created_at": "2024-12-01T00:00:00Z",
        "is_active": True
    }
]


def get_current_user_id(authorization: Optional[str]) -> str:
    """Extract user ID from authorization header."""
    if not authorization:
        return "1"
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    user_id = get_user_from_token(token)
    return user_id or "1"


@router.get("/", response_model=RiskAlertsListResponse)
async def get_risk_alerts(authorization: Optional[str] = Header(None)):
    """
    Get all active risk alerts for the current user.
    Alerts are generated based on the user's financial profile.
    """
    user_id = get_current_user_id(authorization)
    
    try:
        db = get_supabase_client()
        
        # Get profile data
        profile_result = db.table("profiles").select("*").eq("user_id", user_id).execute()
        
        if profile_result.data:
            profile = profile_result.data[0]
            
            # Get credit score
            score_result = db.table("credit_scores").select("score").eq("user_id", user_id).order("recorded_at", desc=True).limit(1).execute()
            credit_score = score_result.data[0]["score"] if score_result.data else 700
            
            # Generate alerts based on profile
            alerts = generate_risk_alerts(
                credit_score=credit_score,
                monthly_income=float(profile.get("monthly_income", 0)),
                monthly_expenses=float(profile.get("monthly_expenses", 0)),
                existing_emis=float(profile.get("existing_emis", 0)),
                credit_utilization=int(profile.get("credit_utilization", 30)),
                active_loans=int(profile.get("active_loans", 0)),
                score_trend=44  # Mock trend for now
            )
            
            # Convert to response models
            alert_responses = [
                RiskAlertResponse(
                    id=alert["id"],
                    title=alert["title"],
                    description=alert["description"],
                    severity=alert["severity"],
                    rule=alert["rule"],
                    created_at=datetime.fromisoformat(alert["created_at"]),
                    is_active=alert["is_active"]
                )
                for alert in alerts
            ]
            
            return RiskAlertsListResponse(
                alerts=alert_responses,
                counts=get_alert_counts(alerts)
            )
            
    except Exception as e:
        pass
    
    # Return mock alerts for development
    alert_responses = [
        RiskAlertResponse(
            id=alert["id"],
            title=alert["title"],
            description=alert["description"],
            severity=alert["severity"],
            rule=alert["rule"],
            created_at=datetime.fromisoformat(alert["created_at"].replace("Z", "+00:00")),
            is_active=alert["is_active"]
        )
        for alert in MOCK_ALERTS
    ]
    
    return RiskAlertsListResponse(
        alerts=alert_responses,
        counts={"high": 1, "medium": 1, "low": 1}
    )


@router.get("/{alert_id}", response_model=RiskAlertResponse)
async def get_risk_alert(alert_id: str, authorization: Optional[str] = Header(None)):
    """
    Get a specific risk alert by ID.
    """
    # Find in mock data
    for alert in MOCK_ALERTS:
        if alert["id"] == alert_id:
            return RiskAlertResponse(
                id=alert["id"],
                title=alert["title"],
                description=alert["description"],
                severity=alert["severity"],
                rule=alert["rule"],
                created_at=datetime.fromisoformat(alert["created_at"].replace("Z", "+00:00")),
                is_active=alert["is_active"]
            )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Alert not found"
    )


@router.post("/generate", response_model=RiskAlertsListResponse)
async def regenerate_alerts(authorization: Optional[str] = Header(None)):
    """
    Force regeneration of risk alerts based on current profile.
    Call this after significant profile changes.
    """
    # Same logic as GET, but could clear and regenerate in DB
    return await get_risk_alerts(authorization)
