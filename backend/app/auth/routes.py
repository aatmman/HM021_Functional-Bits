"""
Authentication routes - signup, login, logout, session validation.
Uses custom JWT tokens for authentication (not Supabase JWT).
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from datetime import datetime
from typing import Optional

# Use centralized JWT and password hashing
from app.auth.jwt import (
    hash_password,
    verify_password,
    create_access_token,
    get_token_data,
    get_current_user_id
)
from app.db.supabase import get_supabase_client, get_supabase_admin_client

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)


# For backwards compatibility with other routes
def get_user_from_token(token: str) -> Optional[str]:
    """Extract user ID from token string."""
    return get_token_data(token)


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """Create a new user account. Returns JWT token."""
    print(f"[DEBUG] Signup request received: email={user_data.email}, password_length={len(user_data.password)}")
    try:
        try:
            db = get_supabase_admin_client()
        except HTTPException as e:
            # Re-raise HTTP exceptions (configuration errors)
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database connection failed: {str(e)}. Please check your Supabase configuration."
            )
        
        # Check if user already exists
        try:
            existing_user = db.table("users").select("id, email").eq("email", user_data.email).execute()
        except Exception as e:
            # Handle Supabase API errors
            error_msg = str(e)
            if "Invalid API key" in error_msg or "401" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Invalid Supabase API key. Please check your SUPABASE_SERVICE_ROLE_KEY in .env file."
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {error_msg}"
            )
        
        if existing_user.data:
            print(f"[DEBUG] Signup failed: Email {user_data.email} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password (with length handling for bcrypt 72-byte limit)
        password_hash = hash_password(user_data.password)
        
        # Create user in database
        now = datetime.utcnow().isoformat()
        user_record = {
            "email": user_data.email,
            "password_hash": password_hash,
            "is_active": True,
            "is_onboarded": False,
            "created_at": now,
            "updated_at": now
        }
        
        try:
            result = db.table("users").insert(user_record).execute()
        except Exception as e:
            error_msg = str(e)
            if "Invalid API key" in error_msg or "401" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Invalid Supabase API key. Please check your SUPABASE_SERVICE_ROLE_KEY in .env file."
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user: {error_msg}"
            )
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        user = result.data[0]
        user_id = str(user["id"])
        
        # Create profile entry for the user
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
        
        try:
            db.table("profiles").insert(profile_record).execute()
        except Exception as e:
            # Log error but don't fail signup if profile creation fails
            # Profile can be created later during onboarding
            print(f"Warning: Failed to create profile during signup: {str(e)}")
        
        # Create JWT token
        print(f"[DEBUG] Creating JWT token for user_id: {user_id}, email: {user_data.email}")
        print(f"[DEBUG] Using JWT secret: {settings.jwt_secret_key[:10]}... (length: {len(settings.jwt_secret_key)})")
        token_data = create_access_token(data={"sub": user_id, "email": user_data.email})
        print(f"[DEBUG] Token created successfully, length: {len(token_data)}")
        
        return TokenResponse(
            access_token=token_data,
            token_type="bearer",
            user=UserResponse(
                id=user_id,
                email=user["email"],
                is_active=user["is_active"],
                is_onboarded=user["is_onboarded"],
                created_at=datetime.fromisoformat(user["created_at"].replace("Z", "+00:00"))
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate user and return JWT token."""
    try:
        try:
            db = get_supabase_admin_client()
        except HTTPException as e:
            # Re-raise HTTP exceptions (configuration errors)
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database connection failed: {str(e)}. Please check your Supabase configuration."
            )
        
        # Find user by email
        try:
            user_result = db.table("users").select("*").eq("email", credentials.email).execute()
        except Exception as e:
            # Handle Supabase API errors
            error_msg = str(e)
            if "Invalid API key" in error_msg or "401" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Invalid Supabase API key. Please check your SUPABASE_SERVICE_ROLE_KEY in .env file."
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {error_msg}"
            )
        
        if not user_result.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user = user_result.data[0]
        
        # Verify password
        password_hash = user.get("password_hash")
        if not password_hash:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User record is missing password hash"
            )
        
        if not verify_password(credentials.password, password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Ensure user_id is a string (UUID from database)
        user_id = str(user["id"])
        
        # Create JWT token with user_id and email
        token_data = create_access_token(data={"sub": user_id, "email": user["email"]})
        
        return TokenResponse(
            access_token=token_data,
            token_type="bearer",
            user=UserResponse(
                id=user_id,
                email=user["email"],
                is_active=user["is_active"],
                is_onboarded=user.get("is_onboarded", False),
                created_at=datetime.fromisoformat(user["created_at"].replace("Z", "+00:00"))
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/logout")
async def logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Logout (client should discard token)."""
    # Since we're using stateless JWT, logout is handled client-side
    # But we can validate the token was valid before logging out
    if credentials:
        try:
            user_id = get_token_data(credentials.credentials)
            if user_id:
                # Token was valid, logout successful
                # In a stateless JWT system, we just return success
                # The client should remove the token from storage
                return {"message": "Logged out successfully"}
        except:
            pass
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Get current authenticated user."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        user_id = get_token_data(credentials.credentials)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Fetch user from database
        db = get_supabase_client()
        user_result = db.table("users").select("*").eq("id", user_id).execute()
        
        if not user_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = user_result.data[0]
        
        return UserResponse(
            id=str(user["id"]),
            email=user["email"],
            is_active=user.get("is_active", True),
            is_onboarded=user.get("is_onboarded", False),
            created_at=datetime.fromisoformat(user["created_at"].replace("Z", "+00:00"))
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


@router.post("/refresh")
async def refresh_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Refresh access token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        user_id = get_token_data(credentials.credentials)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Get user email from database
        db = get_supabase_client()
        user_result = db.table("users").select("email").eq("id", user_id).execute()
        
        if not user_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        email = user_result.data[0]["email"]
        
        # Create new token
        new_token = create_access_token(data={"sub": user_id, "email": email})
        return {"access_token": new_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
