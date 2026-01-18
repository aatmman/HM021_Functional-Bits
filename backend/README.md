# Credit Decision Coach - Backend API

A FastAPI backend for the Credit Decision Coach application.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run the Server

```bash
uvicorn main:app --reload --port 8000
```

### 4. Access API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login and get token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles/me` | Get user profile |
| POST | `/api/profiles/onboarding` | Complete onboarding |
| PUT | `/api/profiles/me` | Update profile |

### Credit Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/credit-scores/history` | Get 6-month trend |
| GET | `/api/credit-scores/current` | Get current score |
| POST | `/api/credit-scores` | Add score record |

### Credit Health Index (CHI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chi/current` | Get current CHI |
| POST | `/api/chi/calculate` | Calculate with params |

### Risk Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/risk-alerts` | Get all alerts |
| GET | `/api/risk-alerts/{id}` | Get specific alert |
| POST | `/api/risk-alerts/generate` | Regenerate alerts |

### Loans & Simulator
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/loans/playground/calculate` | Calculate EMI & impact |
| GET | `/api/loans/comparison` | Compare tenure options |
| GET | `/api/loans/simulator/actions` | Get simulation actions |
| POST | `/api/loans/simulator/simulate` | Run simulation |
| GET | `/api/loans` | Get user's loans |
| POST | `/api/loans` | Add new loan |

## Example Requests

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Get Profile
```bash
curl http://localhost:8000/api/profiles/me \
  -H "Authorization: Bearer <token>"
```

### Calculate Loan EMI
```bash
curl -X POST http://localhost:8000/api/loans/playground/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 500000,
    "interest_rate": 10.5,
    "tenure_months": 36
  }'
```

### Calculate CHI
```bash
curl -X POST http://localhost:8000/api/chi/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "credit_score": 742,
    "emi_to_income_ratio": 14.1,
    "active_loans": 2,
    "missed_payments": 0
  }'
```

## Database Setup

Run the SQL schema in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `app/db/schema.sql`
3. Execute to create all tables

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Dependencies
├── .env                    # Environment variables
├── .env.example           # Example env file
├── README.md              # This file
└── app/
    ├── auth/              # Authentication
    │   └── routes.py
    ├── profiles/          # User profiles
    │   └── routes.py
    ├── credit_scores/     # Credit score history
    │   └── routes.py
    ├── chi/               # Credit Health Index
    │   └── routes.py
    ├── risk_alerts/       # Risk alert generation
    │   └── routes.py
    ├── loans/             # Loans & simulator
    │   └── routes.py
    ├── users/             # User management
    │   └── routes.py
    ├── core/              # Shared utilities
    │   ├── config.py      # Settings
    │   ├── schemas.py     # Pydantic models
    │   ├── calculations.py # Business logic
    │   └── risk_rules.py  # Alert rules
    └── db/                # Database
        ├── supabase.py    # DB connection
        └── schema.sql     # SQL schema
```

## Development Notes

- **Mock Data**: Works without Supabase configured (returns mock data)
- **CORS**: Configured for localhost:5173 and localhost:3000
- **JWT**: Will be implemented as final step (currently uses session tokens)
