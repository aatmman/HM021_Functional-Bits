#!/usr/bin/env python3
"""
Quick test to verify JWT token creation and validation works.
Run this to check if JWT secret key is configured correctly.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.auth.jwt import create_access_token, decode_token, get_token_data
from app.core.config import settings

def test_jwt():
    """Test JWT token creation and validation."""
    print("=" * 60)
    print("JWT Token Test")
    print("=" * 60)
    print()
    
    print(f"JWT Secret Key: {settings.jwt_secret_key[:20]}... (length: {len(settings.jwt_secret_key)})")
    print(f"JWT Algorithm: {settings.jwt_algorithm}")
    print()
    
    # Test data
    test_user_id = "test-user-123"
    test_email = "test@example.com"
    
    print("1. Creating token...")
    try:
        token = create_access_token(data={"sub": test_user_id, "email": test_email})
        print(f"   ✅ Token created: {token[:50]}...")
        print(f"   Token length: {len(token)}")
    except Exception as e:
        print(f"   ❌ Failed to create token: {e}")
        return False
    
    print()
    print("2. Decoding token...")
    try:
        payload = decode_token(token)
        print(f"   ✅ Token decoded successfully")
        print(f"   Payload: {payload}")
        
        if payload.get("sub") != test_user_id:
            print(f"   ❌ User ID mismatch: expected '{test_user_id}', got '{payload.get('sub')}'")
            return False
        
        print(f"   ✅ User ID matches: {payload.get('sub')}")
    except Exception as e:
        print(f"   ❌ Failed to decode token: {e}")
        return False
    
    print()
    print("3. Extracting user ID...")
    try:
        user_id = get_token_data(token)
        if user_id == test_user_id:
            print(f"   ✅ User ID extracted: {user_id}")
        else:
            print(f"   ❌ User ID mismatch: expected '{test_user_id}', got '{user_id}'")
            return False
    except Exception as e:
        print(f"   ❌ Failed to extract user ID: {e}")
        return False
    
    print()
    print("=" * 60)
    print("✅ All JWT tests passed!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = test_jwt()
    sys.exit(0 if success else 1)

