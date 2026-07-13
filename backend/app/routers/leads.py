from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Lead, User
from app.schemas import LeadCreate, LeadResponse
from app.services.telegram import format_new_lead_message, send_telegram_message


router = APIRouter(
    prefix="/api/leads",
    tags=["Leads"]
)


@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(lead_data: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(
        name=lead_data.name,
        email=lead_data.email,
        phone=lead_data.phone,
        message=lead_data.message
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    telegram_message = format_new_lead_message(lead)
    send_telegram_message(telegram_message)

    return lead


@router.get("/", response_model=List[LeadResponse])
def get_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    return leads


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )

    return lead