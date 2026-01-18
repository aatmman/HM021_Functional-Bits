"""
Credit Decision Coach - FastAPI Backend

Main application entry point that configures the FastAPI app,
registers all routers, and sets up middleware.
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from app.core.config import settings

# Import routers
from app.auth.routes import router as auth_router
from app.profiles.routes import router as profiles_router
from app.credit_scores.routes import router as credit_scores_router
from app.chi.routes import router as chi_router
from app.risk_alerts.routes import router as risk_alerts_router
from app.loans.routes import router as loans_router
from app.users.routes import router as users_router

# Create FastAPI app
app = FastAPI(
    title="Credit Decision Coach API",
    description="""
    Backend API for the Credit Decision Coach application.
    
    ## Features
    - **Authentication**: User signup, login, and session management
    - **Profiles**: Financial profile management (income, expenses, EMIs)
    - **Credit Scores**: Historical credit score tracking
    - **CHI (Credit Health Index)**: Composite credit health scoring
    - **Risk Alerts**: Rule-based risk warnings
    - **Loan Playground**: EMI calculations and impact analysis
    - **Credit Simulator**: What-if scenario simulations
    
    ## Data Contracts
    All APIs return JSON responses that match the frontend data requirements.
    No UI formatting or presentation logic is included in responses.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS - Allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,  # Allow credentials for JWT tokens
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with clear messages."""
    errors = exc.errors()
    error_messages = []
    
    for error in errors:
        field = ".".join(str(loc) for loc in error.get("loc", []))
        msg = error.get("msg", "Validation error")
        error_messages.append(f"{field}: {msg}")
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": "; ".join(error_messages) if error_messages else "Validation error",
            "errors": errors
        }
    )

# Register routers
app.include_router(auth_router)
app.include_router(profiles_router)
app.include_router(credit_scores_router)
app.include_router(chi_router)
app.include_router(risk_alerts_router)
app.include_router(loans_router)
app.include_router(users_router)


@app.get("/", tags=["Health"])
async def root():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "app": "Credit Decision Coach API",
        "version": "1.0.0"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Detailed health check.
    """
    return {
        "status": "healthy",
        "database": "connected" if settings.supabase_url != "your_supabase_project_url" else "not_configured",
        "debug": settings.debug,
        "jwt_secret_configured": settings.jwt_secret_key != "dev_secret_key_not_for_production",
        "jwt_secret_length": len(settings.jwt_secret_key)
    }


# API documentation summary
@app.get("/api", tags=["API Info"])
async def api_info():
    """
    Get overview of available API endpoints.
    """
    return {
        "message": "Credit Decision Coach API",
        "endpoints": {
            "auth": {
                "POST /api/auth/signup": "Create new account",
                "POST /api/auth/login": "Login and get token",
                "POST /api/auth/logout": "Logout",
                "GET /api/auth/me": "Get current user"
            },
            "profiles": {
                "GET /api/profiles/me": "Get user profile",
                "POST /api/profiles/onboarding": "Complete onboarding",
                "PUT /api/profiles/me": "Update profile"
            },
            "credit_scores": {
                "GET /api/credit-scores/history": "Get score trend",
                "GET /api/credit-scores/current": "Get current score",
                "POST /api/credit-scores": "Add score record"
            },
            "chi": {
                "GET /api/chi/current": "Get current CHI",
                "POST /api/chi/calculate": "Calculate CHI with params"
            },
            "risk_alerts": {
                "GET /api/risk-alerts": "Get all alerts",
                "GET /api/risk-alerts/{id}": "Get specific alert",
                "POST /api/risk-alerts/generate": "Regenerate alerts"
            },
            "loans": {
                "POST /api/loans/playground/calculate": "Calculate loan EMI & impact",
                "GET /api/loans/comparison": "Compare loan options",
                "GET /api/loans/simulator/actions": "Get simulation actions",
                "POST /api/loans/simulator/simulate": "Run simulation",
                "GET /api/loans": "Get user's loans",
                "POST /api/loans": "Add new loan"
            }
        },
        "docs": "/docs"
    }
