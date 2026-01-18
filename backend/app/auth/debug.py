"""
JWT verification endpoint for debugging.
This endpoint shows if JWT is working and returns decoded token info.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.jwt import decode_token, get_token_data
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/debug", tags=["Debug"])
security = HTTPBearer(auto_error=False)


@router.get("/jwt-verify")
async def verify_jwt(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Verify that JWT token is valid and decode its contents.
    Useful for debugging JWT authentication.
    """
    if not credentials:
        return {
            "jwt_working": False,
            "reason": "No Authorization header provided",
            "help": "Include 'Authorization: Bearer <your_token>' header"
        }
    
    try:
        payload = decode_token(credentials.credentials)
        return {
            "jwt_working": True,
            "token_valid": True,
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "issued_at": datetime.fromtimestamp(payload.get("iat", 0)).isoformat(),
            "expires_at": datetime.fromtimestamp(payload.get("exp", 0)).isoformat(),
            "token_type": payload.get("type", "unknown")
        }
    except HTTPException as e:
        return {
            "jwt_working": True,
            "token_valid": False,
            "reason": e.detail,
            "help": "Token may be expired or malformed. Try logging in again."
        }
    except Exception as e:
        return {
            "jwt_working": False,
            "error": str(e)
        }
