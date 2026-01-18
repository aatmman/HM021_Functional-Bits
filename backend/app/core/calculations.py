"""
Core calculation functions for Credit Decision Coach.
All calculations are deterministic and rule-based - same input always produces same output.
"""
import math
from typing import Literal, Dict, Any


def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """
    Calculate monthly EMI using the standard formula.
    
    Args:
        principal: Loan amount
        annual_rate: Annual interest rate (e.g., 10.5 for 10.5%)
        tenure_months: Loan tenure in months
    
    Returns:
        Monthly EMI amount
    """
    if principal <= 0 or tenure_months <= 0:
        return 0.0
    
    if annual_rate <= 0:
        return principal / tenure_months
    
    monthly_rate = annual_rate / 12 / 100
    emi = (principal * monthly_rate * math.pow(1 + monthly_rate, tenure_months)) / \
          (math.pow(1 + monthly_rate, tenure_months) - 1)
    
    return round(emi, 2)


def calculate_total_interest(principal: float, emi: float, tenure_months: int) -> float:
    """
    Calculate total interest payable over loan tenure.
    
    Args:
        principal: Loan amount
        emi: Monthly EMI
        tenure_months: Loan tenure in months
    
    Returns:
        Total interest amount
    """
    total_payment = emi * tenure_months
    return round(total_payment - principal, 2)


def calculate_chi(
    credit_score: int,
    emi_to_income_ratio: float,
    active_loans: int,
    missed_payments: int = 0
) -> int:
    """
    Calculate Credit Health Index (CHI) - a composite score from 0-100.
    
    Components:
        - Credit Score (40%): Higher score = better
        - EMI-to-Income Ratio (30%): Lower ratio = better
        - Active Loans (15%): Fewer loans = better
        - Payment History (15%): Fewer missed payments = better
    
    Args:
        credit_score: Credit score (300-900)
        emi_to_income_ratio: EMI as percentage of income (0-100)
        active_loans: Number of active loans
        missed_payments: Number of missed payments in last 12 months
    
    Returns:
        CHI score (0-100)
    """
    # Normalize credit score to 0-40 (40% weight)
    # 900 = 40, 300 = 0
    score_component = (credit_score / 900) * 40
    
    # EMI ratio component (30% weight)
    # 0% ratio = 30, 100% ratio = 0
    emi_component = max(0, (1 - emi_to_income_ratio / 100) * 30)
    
    # Active loans component (15% weight)
    # 0 loans = 15, 10+ loans = 0
    loan_component = max(0, (1 - active_loans / 10) * 15)
    
    # Payment history component (15% weight)
    # 0 missed = 15, 5+ missed = 0
    payment_component = max(0, (1 - missed_payments / 5) * 15)
    
    chi = score_component + emi_component + loan_component + payment_component
    return round(chi)


def get_chi_breakdown(
    credit_score: int,
    emi_to_income_ratio: float,
    active_loans: int,
    missed_payments: int = 0
) -> Dict[str, Any]:
    """
    Get detailed breakdown of CHI calculation.
    
    Returns:
        Dictionary with component scores and weights
    """
    score_component = round((credit_score / 900) * 40, 1)
    emi_component = round(max(0, (1 - emi_to_income_ratio / 100) * 30), 1)
    loan_component = round(max(0, (1 - active_loans / 10) * 15), 1)
    payment_component = round(max(0, (1 - missed_payments / 5) * 15), 1)
    
    return {
        "credit_score": {
            "value": credit_score,
            "component_score": score_component,
            "max_score": 40,
            "weight": "40%"
        },
        "emi_ratio": {
            "value": emi_to_income_ratio,
            "component_score": emi_component,
            "max_score": 30,
            "weight": "30%"
        },
        "active_loans": {
            "value": active_loans,
            "component_score": loan_component,
            "max_score": 15,
            "weight": "15%"
        },
        "missed_payments": {
            "value": missed_payments,
            "component_score": payment_component,
            "max_score": 15,
            "weight": "15%"
        }
    }


def get_risk_level(chi_score: int) -> Literal['low', 'medium', 'high']:
    """
    Determine risk level based on CHI score.
    
    Args:
        chi_score: Credit Health Index (0-100)
    
    Returns:
        Risk level: 'low', 'medium', or 'high'
    """
    if chi_score >= 70:
        return 'low'
    elif chi_score >= 40:
        return 'medium'
    else:
        return 'high'


def calculate_emi_to_income_ratio(emi: float, monthly_income: float) -> float:
    """
    Calculate EMI-to-income ratio as percentage.
    
    Args:
        emi: Total monthly EMI payments
        monthly_income: Monthly income
    
    Returns:
        Ratio as percentage (0-100+)
    """
    if monthly_income <= 0:
        return 100.0
    return round((emi / monthly_income) * 100, 2)


def get_loan_recommendation(emi_ratio: float) -> str:
    """
    Generate recommendation based on EMI-to-income ratio.
    
    Args:
        emi_ratio: EMI as percentage of income
    
    Returns:
        Recommendation text
    """
    if emi_ratio > 50:
        return "This EMI is very high relative to your income. Consider a smaller loan amount or longer tenure to reduce monthly payments."
    elif emi_ratio > 40:
        return "Consider extending tenure to reduce EMI. This loan may strain your monthly budget."
    elif emi_ratio > 30:
        return "This loan is affordable but leaves less room for savings. Consider a smaller amount if possible."
    else:
        return "This loan fits well within your budget. You have healthy financial headroom."


def format_currency_inr(amount: float) -> str:
    """
    Format amount as Indian Rupees.
    
    Args:
        amount: Amount to format
    
    Returns:
        Formatted string (e.g., "₹1,50,000")
    """
    if amount < 0:
        return f"-₹{abs(amount):,.0f}"
    return f"₹{amount:,.0f}"
