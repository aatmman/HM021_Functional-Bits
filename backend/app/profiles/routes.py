"""
User profile routes - CRUD operations for financial profile.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.schemas import (
    ProfileCreate, ProfileUpdate, ProfileResponse, FullProfileResponse
)
from app.db.supabase import get_supabase_client
from app.auth.jwt import get_current_user_id
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/profiles", tags=["Profiles"])
security = HTTPBearer(auto_error=False)


@router.get("/me", response_model=FullProfileResponse)
async def get_my_profile(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Get the current user's complete profile.
    Returns all financial data needed for dashboard.
    """
    # Debug: Log credentials
    if credentials:
        print(f"[DEBUG] Profile request - Token present: {credentials.credentials[:20]}...")
    else:
        print(f"[DEBUG] Profile request - No credentials provided")
    
    try:
        user_id = await get_current_user_id(credentials)
        print(f"[DEBUG] Getting profile for user_id: {user_id} (type: {type(user_id)})")
    except Exception as e:
        print(f"[DEBUG] Error getting user_id: {str(e)}")
        raise
    
    try:
        db = get_supabase_client()
        
        # Get profile - Supabase doesn't support SQL joins, so we do separate queries
        # Query profiles table with user_id from JWT token
        profile_result = db.table("profiles").select("*").eq("user_id", user_id).execute()
        
        print(f"[DEBUG] Profile query result: {len(profile_result.data) if profile_result.data else 0} profiles found")
        
        if not profile_result.data:
            # Profile doesn't exist, create a default one
            now = datetime.utcnow().isoformat()
            profile_record = {
                "user_id": user_id,
                "monthly_income": 0,
                "monthly_expenses": 0,
                "existing_emis": 0,
                "credit_utilization": 30,
                "active_loans": 0,
                "created_at": now,
                "updated_at": now
            }
            create_result = db.table("profiles").insert(profile_record).execute()
            profile = create_result.data[0] if create_result.data else profile_record
        else:
            profile = profile_result.data[0]
        
        # Get latest credit score
        score_result = db.table("credit_scores").select("score").eq("user_id", user_id).order("recorded_at", desc=True).limit(1).execute()
        credit_score = score_result.data[0]["score"] if score_result.data else 700
        
        # Get user email and created_at - proper database join
        # Query users table with the user_id from JWT token
        user_result = db.table("users").select("email, created_at").eq("id", user_id).execute()
        print(f"[DEBUG] User query result: {len(user_result.data) if user_result.data else 0} users found")
        
        if not user_result.data:
            # Try to find any users to debug
            all_users = db.table("users").select("id, email").limit(5).execute()
            print(f"[DEBUG] Sample users in DB: {all_users.data if all_users.data else 'none'}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User not found with ID: {user_id}. Database join failed. Check if user exists in database."
            )
        user_data = user_result.data[0]
        
        # Calculate derived fields
        monthly_income = float(profile.get("monthly_income", 0))
        monthly_expenses = float(profile.get("monthly_expenses", 0))
        existing_emis = float(profile.get("existing_emis", 0))
        
        emi_ratio = (existing_emis / monthly_income * 100) if monthly_income > 0 else 0
        disposable = monthly_income - monthly_expenses - existing_emis
        
        return FullProfileResponse(
            id=str(profile["id"]),
            user_id=str(profile["user_id"]),
            name=profile.get("name"),
            avatar=profile.get("avatar", ""),
            age=profile.get("age"),
            employment_type=profile.get("employment_type"),
            monthly_income=monthly_income,
            monthly_expenses=monthly_expenses,
            existing_emis=existing_emis,
            credit_utilization=profile.get("credit_utilization", 30),
            active_loans=profile.get("active_loans", 0),
            credit_score=credit_score,
            joined_at=datetime.fromisoformat(user_data["created_at"].replace("Z", "+00:00")),
            email=user_data["email"],
            emi_to_income_ratio=round(emi_ratio, 2),
            disposable_income=round(disposable, 2)
        )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(e)}"
        )


@router.post("/onboarding", response_model=FullProfileResponse)
async def complete_onboarding(
    profile_data: ProfileCreate,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Complete user onboarding by saving financial profile data.
    Called after signup when user fills in their details.
    """
    user_id = await get_current_user_id(credentials)
    
    print(f"[DEBUG] Onboarding for user_id: {user_id}")
    
    try:
        db = get_supabase_client()
        now = datetime.utcnow().isoformat()
        
        # Check if profile exists, if not create it
        profile_check = db.table("profiles").select("id").eq("user_id", user_id).execute()
        
        profile_update = {
            "age": profile_data.age,
            "employment_type": profile_data.employment_type,
            "monthly_income": profile_data.monthly_income,
            "monthly_expenses": profile_data.monthly_expenses,
            "existing_emis": profile_data.existing_emis if profile_data.existing_emis is not None else 0,
            "credit_utilization": profile_data.credit_utilization if profile_data.credit_utilization is not None else 30,
            "active_loans": profile_data.active_loans if profile_data.active_loans is not None else 0,
            "name": profile_data.name,
            "updated_at": now
        }
        
        if profile_check.data:
            # Update existing profile
            result = db.table("profiles").update(profile_update).eq("user_id", user_id).execute()
        else:
            # Create new profile
            profile_update["user_id"] = user_id
            profile_update["created_at"] = now
            result = db.table("profiles").insert(profile_update).execute()
        
        # Mark user as onboarded
        db.table("users").update({"is_onboarded": True, "updated_at": now}).eq("id", user_id).execute()
        
        # Create initial credit score record
        # Estimate credit score based on utilization (simple heuristic)
        credit_util = profile_data.credit_utilization or 30
        estimated_score = 700 + (30 - credit_util) * 2
        estimated_score = max(300, min(900, estimated_score))
        
        # Check if score already exists for this month/year
        current_month = datetime.utcnow().strftime("%b")
        current_year = datetime.utcnow().year
        score_check = db.table("credit_scores").select("id").eq("user_id", user_id).eq("month", current_month).eq("year", current_year).execute()
        
        if not score_check.data:
            score_record = {
                "user_id": user_id,
                "score": estimated_score,
                "month": current_month,
                "year": current_year,
                "recorded_at": now
            }
            db.table("credit_scores").insert(score_record).execute()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete onboarding: {str(e)}"
        )
    
    # Return updated profile
    return await get_my_profile(credentials)


@router.put("/me", response_model=FullProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Update current user's profile.
    Only provided fields will be updated.
    """
    user_id = await get_current_user_id(credentials)
    
    try:
        db = get_supabase_client()
        now = datetime.utcnow().isoformat()
        
        # Build update dict with only provided fields
        update_data = {"updated_at": now}
        
        for field in ["name", "avatar", "age", "employment_type", 
                      "monthly_income", "monthly_expenses", "existing_emis",
                      "credit_utilization", "active_loans"]:
            value = getattr(profile_data, field, None)
            if value is not None:
                update_data[field] = value
        
        # Check if profile exists
        profile_check = db.table("profiles").select("id").eq("user_id", user_id).execute()
        
        if profile_check.data:
            db.table("profiles").update(update_data).eq("user_id", user_id).execute()
        else:
            # Create profile if it doesn't exist
            update_data["user_id"] = user_id
            update_data["created_at"] = now
            # Set defaults for required fields
            if "monthly_income" not in update_data:
                update_data["monthly_income"] = 0
            if "monthly_expenses" not in update_data:
                update_data["monthly_expenses"] = 0
            if "existing_emis" not in update_data:
                update_data["existing_emis"] = 0
            if "credit_utilization" not in update_data:
                update_data["credit_utilization"] = 30
            if "active_loans" not in update_data:
                update_data["active_loans"] = 0
            db.table("profiles").insert(update_data).execute()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )
    
    return await get_my_profile(credentials)
