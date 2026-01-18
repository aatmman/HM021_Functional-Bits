"""
Request validation helpers for better error messages.
"""
from fastapi import HTTPException, status
from pydantic import ValidationError, EmailStr
from typing import Dict, Any

def validate_signup_request(data: Dict[str, Any]) -> tuple[str, str]:
    """
    Validate signup request data and return (email, password) or raise HTTPException.
    
    Args:
        data: Request body as dictionary
        
    Returns:
        Tuple of (email, password)
        
    Raises:
        HTTPException: If validation fails
    """
    # Check if data is provided
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request body is required"
        )
    
    # Check email
    email = data.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    if not isinstance(email, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email must be a string"
        )
    
    # Basic email format check
    if "@" not in email or "." not in email.split("@")[1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Check password
    password = data.get("password")
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required"
        )
    
    if not isinstance(password, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be a string"
        )
    
    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    return email, password

