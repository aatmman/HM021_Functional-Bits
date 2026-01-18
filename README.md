<div align="center">

# 💳 Credit Decision Coach

### *Make Smarter, Safer Credit Decisions*

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

---

**Credit Decision Coach** is an analytics-first credit intelligence platform that goes beyond simple number crunching. We coach users into making safer financial decisions through **explainable simulations**, **proactive risk detection**, and a comprehensive **Credit Health Index**.

[🚀 Get Started](#-quick-start) • [✨ Features](#-key-features) • [🏗️ Architecture](#️-architecture) • [📖 API Documentation](#-api-documentation)

</div>

---

## 🎯 Problem Statement

Most credit platforms simply calculate numbers and display scores without context. Users are left confused about:
- How their actions impact their credit score
- Whether a new loan is truly affordable
- Trade-offs between different financial decisions
- Early warning signs of financial trouble

**Credit Decision Coach** solves this by providing actionable insights, interactive simulations, and proactive alerts that empower users to make informed credit decisions.

---

## ✨ Key Features

### 📊 Credit Health Index (CHI)
A proprietary composite score (0-100) that provides a holistic view of credit health, combining:
- **Credit Score** (40% weight) – Higher score = better
- **EMI-to-Income Ratio** (30% weight) – Lower ratio = better
- **Active Loans** (15% weight) – Fewer loans = better
- **Payment History** (15% weight) – Fewer missed payments = better

### 🎮 Explainable Simulator
Test "what-if" scenarios without real-world consequences:
- Simulate paying off a loan
- See the impact of adding a new credit card
- Understand how closing old accounts affects your score
- Get clear, detailed explanations for each simulation outcome

### 🧮 Decision Playground
An interactive loan calculator with real-time financial impact analysis:
- Calculate EMI (Equated Monthly Installments)
- Compare different loan tenures (24/36/48/60 months)
- Visualize interest vs. principal breakdown
- Receive personalized affordability recommendations

### ⚠️ Proactive Risk Alerts
Intelligent, rule-based alert system that warns users before risky behaviors impact their credit:

| Alert Type | Severity | Trigger Condition |
|------------|----------|-------------------|
| High EMI Burden | 🔴 High | EMI > 40% of income |
| Critical Credit Utilization | 🔴 High | Utilization > 80% |
| Low Credit Score | 🔴 High | Score < 600 |
| Moderate Credit Utilization | 🟡 Medium | Utilization > 50% |
| Multiple Loans | 🟡 Medium | Active loans > 3 |
| Score Improvement | 🟢 Low | Score improved by 30+ points |
| Healthy Finances | 🟢 Low | EMI < 30% and Score > 750 |

### 📈 Credit Score Trends
Visual representation of 6-month credit score history with trend analysis and insights.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  React 18 • TypeScript • Vite • Tailwind CSS • shadcn/ui        │
│  Framer Motion • Recharts • React Query • React Hook Form       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                 │
│               FastAPI • Python • JWT Auth                        │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    Auth     │  │  Profiles   │  │   Credit Scores         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │     CHI     │  │ Risk Alerts │  │   Loans & Simulator     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│                    Supabase (PostgreSQL)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Library with latest features |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast build tool |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Premium component library |
| **Framer Motion** | Smooth animations |
| **Recharts** | Data visualization |
| **React Query** | Server state management |
| **React Hook Form** | Form handling with Zod validation |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python API framework |
| **Pydantic** | Data validation and serialization |
| **JWT** | Secure authentication |
| **Supabase** | PostgreSQL database + Auth |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+
- **Supabase** account (for database)

### 1. Clone the Repository

```bash
git clone https://github.com/your-team/credit-decision-coach.git
cd credit-decision-coach
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| 🔧 Backend API | http://localhost:8000 |
| 📚 API Docs (Swagger) | http://localhost:8000/docs |
| 📖 API Docs (ReDoc) | http://localhost:8000/redoc |

---

## 📖 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Create new account |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `POST` | `/api/auth/logout` | Logout and invalidate session |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Profile Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profiles/me` | Get user profile |
| `POST` | `/api/profiles/onboarding` | Complete onboarding flow |
| `PUT` | `/api/profiles/me` | Update profile |

### Credit Health Index (CHI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chi/current` | Get current CHI score |
| `POST` | `/api/chi/calculate` | Calculate CHI with custom parameters |

### Credit Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/credit-scores/current` | Get current credit score |
| `GET` | `/api/credit-scores/history` | Get 6-month score trend |
| `POST` | `/api/credit-scores` | Record a new score |

### Risk Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/risk-alerts` | Get all active alerts |
| `GET` | `/api/risk-alerts/{id}` | Get specific alert details |
| `POST` | `/api/risk-alerts/generate` | Regenerate alerts based on profile |

### Loans & Simulator
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/loans/playground/calculate` | Calculate EMI and loan impact |
| `GET` | `/api/loans/comparison` | Compare different tenure options |
| `GET` | `/api/loans/simulator/actions` | Get available simulation actions |
| `POST` | `/api/loans/simulator/simulate` | Run a credit simulation |
| `GET` | `/api/loans` | Get user's active loans |
| `POST` | `/api/loans` | Add a new loan |

---

## 📁 Project Structure

```
credit-decision-coach/
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   │   ├── 📁 dashboard/   # Dashboard-specific components
│   │   │   ├── 📁 layout/      # Layout components
│   │   │   └── 📁 ui/          # shadcn/ui components
│   │   ├── 📁 pages/           # Route pages
│   │   │   ├── Landing.tsx     # Homepage
│   │   │   ├── Dashboard.tsx   # Main dashboard
│   │   │   ├── Playground.tsx  # Loan calculator
│   │   │   ├── Simulator.tsx   # Credit simulator
│   │   │   ├── Alerts.tsx      # Risk alerts view
│   │   │   └── Profile.tsx     # User profile
│   │   └── 📁 lib/             # Utilities & helpers
│   ├── package.json
│   └── vite.config.ts
│
├── 📁 backend/
│   ├── main.py                 # FastAPI application entry
│   ├── requirements.txt        # Python dependencies
│   └── 📁 app/
│       ├── 📁 auth/            # Authentication module
│       ├── 📁 profiles/        # User profiles module
│       ├── 📁 credit_scores/   # Credit score tracking
│       ├── 📁 chi/             # Credit Health Index
│       ├── 📁 risk_alerts/     # Alert generation
│       ├── 📁 loans/           # Loans & simulator
│       ├── 📁 core/            # Shared utilities
│       │   ├── config.py       # App settings
│       │   ├── calculations.py # Business logic
│       │   ├── risk_rules.py   # Alert rules
│       │   └── schemas.py      # Pydantic models
│       └── 📁 db/              # Database layer
│           ├── supabase.py     # DB connection
│           └── schema.sql      # SQL schema
│
└── README.md
```

---

## 🧮 Core Algorithms

### Credit Health Index (CHI) Calculation

```python
CHI = (Credit_Score / 900 × 40) 
    + (1 - EMI_Ratio / 100) × 30
    + (1 - Active_Loans / 10) × 15
    + (1 - Missed_Payments / 5) × 15
```

### EMI Calculation (Standard Formula)

```python
EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)

where:
  P = Principal loan amount
  r = Monthly interest rate (annual rate / 12 / 100)
  n = Tenure in months
```

### Risk Level Assessment

| CHI Score | Risk Level |
|-----------|------------|
| 70 - 100 | 🟢 Low Risk |
| 40 - 69 | 🟡 Medium Risk |
| 0 - 39 | 🔴 High Risk |

---

## 🎨 Design Philosophy

Credit Decision Coach embraces a **Neon-Dark** aesthetic with:
- Deep matte charcoal backgrounds for reduced eye strain
- Vibrant neon accent colors (purple, teal, amber, coral)
- High contrast for accessibility
- Smooth micro-animations for enhanced user experience
- Responsive design optimized for all screen sizes

---

## 🔒 Security Features

- **JWT-based Authentication** – Secure token-based auth
- **Password Hashing** – bcrypt encryption for stored passwords
- **CORS Configuration** – Properly configured cross-origin policies
- **Input Validation** – Pydantic schemas validate all input data
- **Row Level Security** – Supabase RLS policies protect user data

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend verification
cd backend
python verify_setup.py
```

---

## 👥 Team Functional Bits

Built with passion by **Team Functional Bits** for better financial literacy and smarter credit decisions.

---

## 📄 License

This project was built for **HM021 Hackathon**.

---

<div align="center">

### Made with ❤️ by Team Functional Bits

*Empowering smarter financial decisions, one simulation at a time.*

</div>
