"""
Rule-based risk alert generation.
Deterministic rules that analyze user's financial profile and generate appropriate alerts.
"""
from typing import List, Dict, Any
from datetime import datetime


# Risk rule definitions
RISK_RULES = [
    {
        "id": "high_emi_burden",
        "title": "High EMI Burden",
        "rule": "EMI > 40% of income",
        "severity": "high",
        "check": lambda profile: profile.get("emi_ratio", 0) > 40,
        "description_template": "Your EMI consumes {ratio:.0f}% of your income. This may reduce future loan eligibility."
    },
    {
        "id": "very_high_emi",
        "title": "Critical EMI Level",
        "rule": "EMI > 60% of income",
        "severity": "high",
        "check": lambda profile: profile.get("emi_ratio", 0) > 60,
        "description_template": "Your EMI is at {ratio:.0f}% of income - critically high. Consider debt consolidation."
    },
    {
        "id": "high_credit_utilization",
        "title": "Credit Utilization Rising",
        "rule": "Credit utilization > 60%",
        "severity": "medium",
        "check": lambda profile: profile.get("credit_utilization", 0) > 60,
        "description_template": "Your credit utilization is at {utilization}%. Consider paying down balances."
    },
    {
        "id": "very_high_utilization",
        "title": "Credit Utilization Critical",
        "rule": "Credit utilization > 80%",
        "severity": "high",
        "check": lambda profile: profile.get("credit_utilization", 0) > 80,
        "description_template": "Credit utilization at {utilization}% is critically high. This severely impacts your score."
    },
    {
        "id": "low_credit_score",
        "title": "Low Credit Score",
        "rule": "Credit score < 600",
        "severity": "high",
        "check": lambda profile: profile.get("credit_score", 700) < 600,
        "description_template": "Your credit score of {score} is below average. Focus on timely payments and reducing debt."
    },
    {
        "id": "multiple_active_loans",
        "title": "Multiple Active Loans",
        "rule": "Active loans > 3",
        "severity": "medium",
        "check": lambda profile: profile.get("active_loans", 0) > 3,
        "description_template": "You have {loans} active loans. Consider consolidating to simplify management."
    },
    {
        "id": "low_disposable_income",
        "title": "Low Disposable Income",
        "rule": "Disposable income < 20% of income",
        "severity": "medium",
        "check": lambda profile: _check_disposable(profile) < 20,
        "description_template": "Your disposable income is only {disposable_pct:.0f}% of your earnings. Build an emergency fund."
    },
    {
        "id": "score_improvement",
        "title": "Score Improvement",
        "rule": "Positive trend detected",
        "severity": "low",
        "check": lambda profile: profile.get("score_trend", 0) > 30,
        "description_template": "Your credit score has improved by {trend} points in the last 6 months. Keep it up!"
    },
    {
        "id": "healthy_finances",
        "title": "Healthy Financial Status",
        "rule": "EMI < 30% and score > 750",
        "severity": "low",
        "check": lambda profile: profile.get("emi_ratio", 100) < 30 and profile.get("credit_score", 0) > 750,
        "description_template": "Your finances are in excellent shape with low EMI burden and high credit score."
    },
    {
        "id": "optimal_utilization",
        "title": "Optimal Credit Utilization",
        "rule": "Credit utilization between 10-30%",
        "severity": "low",
        "check": lambda profile: 10 <= profile.get("credit_utilization", 0) <= 30,
        "description_template": "Your credit utilization of {utilization}% is in the optimal range. Well done!"
    }
]


def _check_disposable(profile: Dict[str, Any]) -> float:
    """Calculate disposable income percentage."""
    income = profile.get("monthly_income", 0)
    expenses = profile.get("monthly_expenses", 0)
    emis = profile.get("existing_emis", 0)
    
    if income <= 0:
        return 0
    
    disposable = income - expenses - emis
    return (disposable / income) * 100


def generate_risk_alerts(
    credit_score: int,
    monthly_income: float,
    monthly_expenses: float,
    existing_emis: float,
    credit_utilization: int,
    active_loans: int,
    score_trend: int = 0
) -> List[Dict[str, Any]]:
    """
    Generate risk alerts based on user's financial profile.
    
    Args:
        credit_score: Current credit score (300-900)
        monthly_income: Monthly income
        monthly_expenses: Monthly expenses
        existing_emis: Total monthly EMI payments
        credit_utilization: Credit utilization percentage
        active_loans: Number of active loans
        score_trend: Score change over last 6 months (can be negative)
    
    Returns:
        List of triggered risk alerts
    """
    # Build profile dict for rule evaluation
    emi_ratio = (existing_emis / monthly_income * 100) if monthly_income > 0 else 100
    disposable = monthly_income - monthly_expenses - existing_emis
    disposable_pct = (disposable / monthly_income * 100) if monthly_income > 0 else 0
    
    profile = {
        "credit_score": credit_score,
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "existing_emis": existing_emis,
        "credit_utilization": credit_utilization,
        "active_loans": active_loans,
        "emi_ratio": emi_ratio,
        "disposable_pct": disposable_pct,
        "score_trend": score_trend
    }
    
    alerts = []
    now = datetime.utcnow().isoformat()
    
    for rule in RISK_RULES:
        try:
            if rule["check"](profile):
                # Format description with profile values
                description = rule["description_template"].format(
                    ratio=emi_ratio,
                    utilization=credit_utilization,
                    score=credit_score,
                    loans=active_loans,
                    disposable_pct=disposable_pct,
                    trend=score_trend
                )
                
                alerts.append({
                    "id": rule["id"],
                    "title": rule["title"],
                    "description": description,
                    "severity": rule["severity"],
                    "rule": rule["rule"],
                    "created_at": now,
                    "is_active": True
                })
        except Exception:
            # Skip rules that fail evaluation
            continue
    
    # Sort by severity (high first, then medium, then low)
    severity_order = {"high": 0, "medium": 1, "low": 2}
    alerts.sort(key=lambda x: severity_order.get(x["severity"], 3))
    
    return alerts


def get_alert_counts(alerts: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Count alerts by severity.
    
    Args:
        alerts: List of alert dictionaries
    
    Returns:
        Dictionary with counts per severity level
    """
    counts = {"high": 0, "medium": 0, "low": 0}
    for alert in alerts:
        severity = alert.get("severity", "low")
        if severity in counts:
            counts[severity] += 1
    return counts


# Predefined simulation actions (matching frontend)
SIMULATION_ACTIONS = [
    {
        "id": "miss_emi",
        "title": "Miss 1 EMI",
        "description": "See the impact of missing a single EMI payment",
        "impact": -35,
        "direction": "down",
        "explanation": "Missing one EMI may reduce your score by ~30-40 points. Payment history accounts for 35% of your credit score.",
        "alternative": "Set up auto-debit or extend tenure by 6 months to reduce EMI if you're tight on cash."
    },
    {
        "id": "increase_util",
        "title": "Increase Utilization",
        "description": "Use more of your available credit limit",
        "impact": -25,
        "direction": "down",
        "explanation": "Increasing utilization above 70% signals credit dependency. Each 10% increase above 30% costs ~5-10 points.",
        "alternative": "Request a credit limit increase instead, or spread expenses across multiple cards."
    },
    {
        "id": "extend_tenure",
        "title": "Extend Tenure",
        "description": "Increase your loan repayment period",
        "impact": 5,
        "direction": "up",
        "explanation": "Extending tenure lowers your EMI-to-income ratio, which can slightly improve your credit health index.",
        "alternative": "Consider this option if you need immediate cash flow relief."
    },
    {
        "id": "close_loan",
        "title": "Close a Loan",
        "description": "Pay off and close an existing loan",
        "impact": 15,
        "direction": "up",
        "explanation": "Closing a loan reduces your debt burden and may improve your score by 10-20 points over 2-3 months.",
        "alternative": "Prioritize closing high-interest loans first for maximum impact."
    },
    {
        "id": "reduce_utilization",
        "title": "Reduce Utilization to 30%",
        "description": "Pay down credit card balances",
        "impact": 20,
        "direction": "up",
        "explanation": "Reducing utilization below 30% is optimal. Each 10% reduction below 50% can add 5-10 points.",
        "alternative": "If you can't pay down, request a credit limit increase to lower the ratio."
    },
    {
        "id": "new_credit_inquiry",
        "title": "Apply for New Credit",
        "description": "Submit a new loan or credit card application",
        "impact": -10,
        "direction": "down",
        "explanation": "Each hard inquiry reduces your score by 5-15 points temporarily. Multiple inquiries in short time have bigger impact.",
        "alternative": "Space out credit applications by at least 6 months when possible."
    }
]


def get_simulation_action(action_id: str) -> Dict[str, Any] | None:
    """Get a specific simulation action by ID."""
    for action in SIMULATION_ACTIONS:
        if action["id"] == action_id:
            return action
    return None


def simulate_action(action_id: str, current_score: int) -> Dict[str, Any] | None:
    """
    Simulate the impact of an action on credit score.
    
    Args:
        action_id: ID of the action to simulate
        current_score: Current credit score
    
    Returns:
        Simulation result or None if action not found
    """
    action = get_simulation_action(action_id)
    if not action:
        return None
    
    projected_score = current_score + action["impact"]
    # Clamp to valid range
    projected_score = max(300, min(900, projected_score))
    
    return {
        "current_score": current_score,
        "projected_score": projected_score,
        "impact": action["impact"],
        "direction": action["direction"],
        "explanation": action["explanation"],
        "alternative": action["alternative"]
    }
