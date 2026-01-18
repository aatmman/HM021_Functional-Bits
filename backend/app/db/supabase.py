"""
Supabase database connection and client management.
"""
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional
from fastapi import HTTPException, status

_supabase_client: Optional[Client] = None


def _validate_supabase_config():
    """Validate that Supabase credentials are configured."""
    if (settings.supabase_url == "your_supabase_project_url" or 
        settings.supabase_key == "your_supabase_anon_key" or
        settings.supabase_service_role_key == "your_service_role_key"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase credentials not configured. Please set SUPABASE_URL, SUPABASE_KEY, and SUPABASE_SERVICE_ROLE_KEY in your .env file."
        )


def get_supabase_client() -> Client:
    """
    Get or create Supabase client singleton.
    Returns the Supabase client for database operations.
    """
    global _supabase_client
    
    _validate_supabase_config()
    
    if _supabase_client is None:
        try:
            _supabase_client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to connect to Supabase: {str(e)}. Please check your SUPABASE_URL and SUPABASE_KEY."
            )
    
    return _supabase_client


def get_supabase_admin_client() -> Client:
    """
    Get Supabase client with service role key for admin operations.
    Use this for operations that bypass RLS.
    """
    _validate_supabase_config()
    
    try:
        return create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to connect to Supabase with admin key: {str(e)}. Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        )


# Dependency for FastAPI routes
async def get_db() -> Client:
    """FastAPI dependency to get database client."""
    return get_supabase_client()
