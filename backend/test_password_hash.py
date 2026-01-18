#!/usr/bin/env python3
"""
Quick test script to verify password hashing works with long passwords.
Run this to verify the fix is working before testing in the app.
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.auth.jwt import hash_password, verify_password

def test_password_hashing():
    """Test password hashing with various password lengths."""
    
    test_cases = [
        ("short", "Short password"),
        ("normal123", "Normal length password"),
        ("a" * 50, "50 character password"),
        ("a" * 72, "Exactly 72 bytes (ASCII)"),
        ("a" * 100, "100 character password (should truncate)"),
        ("test" * 30, "120 character password (should truncate)"),
        ("🚀" * 30, "Unicode emoji password (multi-byte)"),
    ]
    
    print("Testing password hashing with various lengths...")
    print("=" * 60)
    
    for password, description in test_cases:
        try:
            # Test hashing
            password_bytes = password.encode('utf-8')
            print(f"\n{description}:")
            print(f"  Original length: {len(password)} chars, {len(password_bytes)} bytes")
            
            hashed = hash_password(password)
            print(f"  ✅ Hash successful: {hashed[:50]}...")
            
            # Test verification
            is_valid = verify_password(password, hashed)
            if is_valid:
                print(f"  ✅ Verification successful")
            else:
                print(f"  ❌ Verification FAILED")
                return False
                
        except Exception as e:
            print(f"  ❌ ERROR: {e}")
            return False
    
    print("\n" + "=" * 60)
    print("✅ All password hashing tests passed!")
    return True

if __name__ == "__main__":
    success = test_password_hashing()
    sys.exit(0 if success else 1)

