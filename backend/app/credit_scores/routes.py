"""
Credit score history routes.
"""
from fastapi import APIRouter, HTTPException, status, Header
from app.core.schemas import (
    CreditScoreCreate, CreditScoreResponse, 
    CreditScoreTrendItem, CreditScoreTrendResponse
)
from app.db.supabase import get_supabase_client
from app.auth.routes import get_user_from_token
from datetime import datetime
from typing import Optional, List

router = APIRouter(prefix="/api/credit-scores", tags=["Credit Scores"])

# Mock credit score trend (matches frontend mockData.ts)
MOCK_CREDIT_TREND = [
    {"month": "Jul", "score": 698},
    {"month": "Aug", "score": 705},
    {"month": "Sep", "score": 712},
    {"month": "Oct", "score": 725},
    {"month": "Nov", "score": 738},
    {"month": "Dec", "score": 742},
]


def get_current_user_id(authorization: Optional[str]) -> str:
    """Extract user ID from authorization header."""
    if not authorization:
        return "1"  # Mock user
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    user_id = get_user_from_token(token)
    return user_id or "1"


@router.get("/history", response_model=CreditScoreTrendResponse)
async def get_credit_score_history(authorization: Optional[str] = Header(None)):
    """
    Get 6-month credit score trend for charts.
    Returns monthly scores for visualization.
    """
    user_id = get_current_user_id(authorization)
    
    try:
        db = get_supabase_client()
        
        # Get last 6 months of scores
        result = db.table("credit_scores").select("*").eq("user_id", user_id).order("recorded_at", desc=True).limit(6).execute()
        
        if result.data:
            # Convert to trend format
            trend = [
                CreditScoreTrendItem(month=s["month"], score=s["score"])
                for s in reversed(result.data)
            ]
            current_score = result.data[0]["score"]
            
            return CreditScoreTrendResponse(
                trend=trend,
                current_score=current_score
            )
            
    except Exception as e:
        pass
    
    # Return mock data for development
    return CreditScoreTrendResponse(
        trend=[CreditScoreTrendItem(**item) for item in MOCK_CREDIT_TREND],
        current_score=742
    )


@router.get("/current")
async def get_current_score(authorization: Optional[str] = Header(None)):
    """
    Get current (latest) credit score.
    """
    user_id = get_current_user_id(authorization)
    
    try:
        db = get_supabase_client()
        
        result = db.table("credit_scores").select("score").eq("user_id", user_id).order("recorded_at", desc=True).limit(1).execute()
        
        if result.data:
            return {"score": result.data[0]["score"]}
            
    except Exception:
        pass
    
    # Mock response
    return {"score": 742}


@router.post("/", response_model=CreditScoreResponse, status_code=status.HTTP_201_CREATED)
async def add_credit_score(
    score_data: CreditScoreCreate,
    authorization: Optional[str] = Header(None)
):
    """
    Add a new credit score record.
    Used for updating score history (e.g., monthly updates).
    """
    user_id = get_current_user_id(authorization)
    
    try:
        db = get_supabase_client()
        now = datetime.utcnow().isoformat()
        
        score_record = {
            "user_id": user_id,
            "score": score_data.score,
            "month": score_data.month,
            "year": score_data.year,
            "recorded_at": now
        }
        
        result = db.table("credit_scores").insert(score_record).execute()
        
        if result.data:
            record = result.data[0]
            return CreditScoreResponse(
                id=record["id"],
                score=record["score"],
                month=record["month"],
                year=record["year"],
                recorded_at=datetime.fromisoformat(record["recorded_at"].replace("Z", "+00:00"))
            )
            
    except Exception as e:
        pass
    
    # Mock response for development
    import uuid
    return CreditScoreResponse(
        id=str(uuid.uuid4()),
        score=score_data.score,
        month=score_data.month,
        year=score_data.year,
        recorded_at=datetime.utcnow()
    )
