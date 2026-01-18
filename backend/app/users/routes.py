"""
User management routes (admin operations).
"""
from fastapi import APIRouter, HTTPException, status, Header
from app.db.supabase import get_supabase_client
from app.auth.routes import get_user_from_token
from typing import Optional

router = APIRouter(prefix="/api/users", tags=["Users"])


def get_current_user_id(authorization: Optional[str]) -> str:
    """Extract user ID from authorization header."""
    if not authorization:
        return "1"
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    user_id = get_user_from_token(token)
    return user_id or "1"


@router.delete("/me")
async def delete_account(authorization: Optional[str] = Header(None)):
    """
    Delete the current user's account.
    This will cascade delete all related data.
    """
    user_id = get_current_user_id(authorization)
    
    try:
        db = get_supabase_client()
        
        # Delete user (cascade will handle related tables)
        db.table("users").delete().eq("id", user_id).execute()
        
        return {"message": "Account deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )
