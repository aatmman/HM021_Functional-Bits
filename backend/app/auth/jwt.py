"""
JWT Authentication module.
Handles token generation, validation, and password hashing.
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

# HTTP Bearer scheme for token extraction
security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a password for storing using bcrypt directly."""
    if not password:
        raise ValueError("Password cannot be empty")
    
    # Bcrypt has a strict 72 byte limit - we MUST ensure password is <= 72 bytes
    # Convert to bytes first to check actual byte length
    password_bytes = password.encode('utf-8')
    
    # If password exceeds 72 bytes, truncate it safely
    if len(password_bytes) > 72:
        # Truncate to 72 bytes
        password_bytes = password_bytes[:72]
        
        # Remove any incomplete UTF-8 character sequences at the end
        # UTF-8 continuation bytes have pattern 10xxxxxx (0x80-0xBF)
        # We need to remove trailing continuation bytes that don't have a start byte
        while len(password_bytes) > 0:
            last_byte = password_bytes[-1]
            # Check if it's a continuation byte (starts with 10)
            if (last_byte & 0xC0) == 0x80:
                # It's a continuation byte, remove it
                password_bytes = password_bytes[:-1]
            else:
                # It's either a single-byte char (0x00-0x7F) or start byte (0xC0-0xFF)
                break
    
    # Use bcrypt directly to hash the password bytes
    # bcrypt.hashpw expects bytes, and we've ensured it's <= 72 bytes
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string (bcrypt returns bytes)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt directly."""
    if not plain_password or not hashed_password:
        return False
    
    try:
        # Convert to bytes
        password_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        
        # Truncate password if needed (same logic as hash_password)
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
            while len(password_bytes) > 0:
                if (password_bytes[-1] & 0xC0) == 0x80:
                    password_bytes = password_bytes[:-1]
                else:
                    break
        
        # Use bcrypt to verify
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Payload data to encode in the token
        expires_delta: Optional expiration time delta
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    now = datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    
    # JWT expects Unix timestamps (seconds since epoch)
    to_encode.update({
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.jwt_secret_key, 
        algorithm=settings.jwt_algorithm
    )
    
    return encoded_jwt


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded token payload
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        print(f"[DEBUG] decode_token: Attempting to decode token")
        print(f"[DEBUG] decode_token: Token length: {len(token)}")
        print(f"[DEBUG] decode_token: Using secret key: {settings.jwt_secret_key[:10]}... (length: {len(settings.jwt_secret_key)})")
        print(f"[DEBUG] decode_token: Algorithm: {settings.jwt_algorithm}")
        
        payload = jwt.decode(
            token, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        print(f"[DEBUG] decode_token: Success! Payload: {payload}")
        return payload
    except JWTError as e:
        print(f"[DEBUG] decode_token: JWTError: {str(e)}")
        print(f"[DEBUG] decode_token: Error type: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"[DEBUG] decode_token: Unexpected error: {str(e)}")
        print(f"[DEBUG] decode_token: Error type: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_token_data(token: str) -> Optional[str]:
    """
    Extract user ID from token.
    
    Args:
        token: JWT token string
    
    Returns:
        User ID if valid, None otherwise
    """
    try:
        if not token:
            return None
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            print(f"[DEBUG] Token payload missing 'sub': {payload}")
            return None
        # Ensure user_id is a string (UUID might be stored as string)
        return str(user_id)
    except HTTPException as e:
        print(f"[DEBUG] HTTPException in get_token_data: {e.detail}")
        return None
    except JWTError as e:
        print(f"[DEBUG] JWTError in get_token_data: {str(e)}")
        return None
    except Exception as e:
        print(f"[DEBUG] Exception in get_token_data: {str(e)}")
        return None


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> str:
    """
    FastAPI dependency to get current user ID from JWT token.
    
    Args:
        credentials: HTTP Authorization credentials
    
    Returns:
        User ID from token
    
    Raises:
        HTTPException: If not authenticated or token invalid
    """
    if credentials is None:
        print("[DEBUG] get_current_user_id: No credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[DEBUG] get_current_user_id: Token received: {credentials.credentials[:30]}...")
    user_id = get_token_data(credentials.credentials)
    
    if user_id is None:
        print("[DEBUG] get_current_user_id: Failed to extract user_id from token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[DEBUG] get_current_user_id: Successfully extracted user_id: {user_id}")
    return user_id


async def get_optional_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:
    """
    FastAPI dependency to optionally get user ID from JWT token.
    Returns None if no token provided (allows anonymous access).
    
    Args:
        credentials: HTTP Authorization credentials
    
    Returns:
        User ID if authenticated, None otherwise
    """
    if credentials is None:
        return None
    
    return get_token_data(credentials.credentials)


def create_tokens_for_user(user_id: str, email: str) -> dict:
    """
    Create access token for a user.
    
    Args:
        user_id: User's unique ID
        email: User's email
    
    Returns:
        Dictionary with access token and token type
    """
    access_token = create_access_token(
        data={"sub": user_id, "email": email}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
