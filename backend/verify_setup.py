#!/usr/bin/env python3
"""
Verification script to check if backend is properly configured.
Run this before starting the server to ensure everything is set up correctly.
"""

import sys
import os
from pathlib import Path

def check_env_file():
    """Check if .env file exists and has required variables."""
    env_path = Path(__file__).parent / ".env"
    
    if not env_path.exists():
        print("❌ .env file not found!")
        print("   Create .env file in backend/ directory with:")
        print("   - SUPABASE_URL")
        print("   - SUPABASE_KEY")
        print("   - SUPABASE_SERVICE_ROLE_KEY")
        print("   - JWT_SECRET_KEY")
        return False
    
    print("✅ .env file exists")
    
    # Try to load and check values
    try:
        from dotenv import load_dotenv
        load_dotenv(env_path)
        
        required_vars = [
            "SUPABASE_URL",
            "SUPABASE_KEY", 
            "SUPABASE_SERVICE_ROLE_KEY",
            "JWT_SECRET_KEY"
        ]
        
        missing = []
        for var in required_vars:
            value = os.getenv(var)
            if not value or value.startswith("your_") or value == "":
                missing.append(var)
        
        if missing:
            print(f"❌ Missing or placeholder values in .env: {', '.join(missing)}")
            return False
        
        print("✅ All required environment variables are set")
        return True
    except ImportError:
        print("⚠️  python-dotenv not installed, skipping .env validation")
        return True
    except Exception as e:
        print(f"⚠️  Error checking .env: {e}")
        return True

def check_imports():
    """Check if all required packages can be imported."""
    try:
        from app.core.config import settings
        print("✅ Configuration module loads")
        
        from app.auth.jwt import hash_password, verify_password, create_access_token
        print("✅ JWT module loads")
        
        from app.db.supabase import get_supabase_client
        print("✅ Database module loads")
        
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def check_jwt():
    """Test JWT token creation and validation."""
    try:
        from app.auth.jwt import create_access_token, decode_token, get_token_data
        from app.core.config import settings
        
        # Create a test token
        test_data = {"sub": "test-user-id", "email": "test@example.com"}
        token = create_access_token(data=test_data)
        
        # Decode it
        payload = decode_token(token)
        
        # Extract user ID
        user_id = get_token_data(token)
        
        if user_id == "test-user-id":
            print("✅ JWT token creation and validation works")
            return True
        else:
            print(f"❌ JWT validation failed: expected 'test-user-id', got '{user_id}'")
            return False
    except Exception as e:
        print(f"❌ JWT test failed: {e}")
        return False

def check_password_hashing():
    """Test password hashing with long password."""
    try:
        from app.auth.jwt import hash_password, verify_password
        
        # Test with long password
        long_password = "a" * 100
        hashed = hash_password(long_password)
        
        if verify_password(long_password, hashed):
            print("✅ Password hashing works (handles long passwords)")
            return True
        else:
            print("❌ Password verification failed")
            return False
    except Exception as e:
        print(f"❌ Password hashing test failed: {e}")
        return False

def main():
    """Run all checks."""
    print("=" * 60)
    print("Backend Setup Verification")
    print("=" * 60)
    print()
    
    checks = [
        ("Environment Variables", check_env_file),
        ("Python Imports", check_imports),
        ("JWT Functionality", check_jwt),
        ("Password Hashing", check_password_hashing),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\nChecking {name}...")
        result = check_func()
        results.append((name, result))
    
    print("\n" + "=" * 60)
    print("Summary:")
    print("=" * 60)
    
    all_passed = True
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
        if not result:
            all_passed = False
    
    print()
    if all_passed:
        print("✅ All checks passed! Backend is ready to run.")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

