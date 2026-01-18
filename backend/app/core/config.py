"""
Core configuration settings for the Credit Decision Coach backend.
Loads environment variables and provides typed access to settings.
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase
    supabase_url: str = "your_supabase_project_url"
    supabase_key: str = "your_supabase_anon_key"
    supabase_service_role_key: str = "your_service_role_key"
    
    # JWT
    jwt_secret_key: str = "dev_secret_key_not_for_production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # App
    debug: bool = True
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
