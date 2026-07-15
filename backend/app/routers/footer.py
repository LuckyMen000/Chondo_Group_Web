import re
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import FooterSettings, User
from app.schemas import FooterSettingsResponse, FooterSettingsUpdate


router = APIRouter(
    prefix="/api/footer",
    tags=["Footer"]
)


def get_or_create_footer_settings(db: Session) -> FooterSettings:
    settings = db.query(FooterSettings).first()

    if settings:
        return settings

    settings = FooterSettings(
        instagram_url=None,
        telegram_url=None,
        whatsapp_url=None
    )
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def normalize_social_url(value: str | None, platform: str) -> str | None:
    if value is None:
        return None

    value = value.strip()
    if not value:
        return None

    if platform == "whatsapp":
        digits = re.sub(r"\D", "", value)
        if value.startswith("+") or re.fullmatch(r"[\d\s()+-]+", value):
            if len(digits) < 7:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Укажите корректный номер WhatsApp"
                )
            return f"https://wa.me/{digits}"

    if value.startswith("@"):
        username = value[1:].strip()
        if not username:
            return None
        if platform == "telegram":
            return f"https://t.me/{username}"
        if platform == "instagram":
            return f"https://www.instagram.com/{username}/"

    if "://" not in value:
        if platform == "telegram" and re.fullmatch(r"[A-Za-z0-9_]{5,}", value):
            return f"https://t.me/{value}"
        if platform == "instagram" and re.fullmatch(r"[A-Za-z0-9._]{1,30}", value):
            return f"https://www.instagram.com/{value}/"
        value = f"https://{value.lstrip('/')}"

    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ссылка должна начинаться с http:// или https://"
        )

    return value


@router.get("/public", response_model=FooterSettingsResponse)
def get_public_footer_settings(
    response: Response,
    db: Session = Depends(get_db)
):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    return get_or_create_footer_settings(db)


@router.get("/admin", response_model=FooterSettingsResponse)
def get_admin_footer_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_or_create_footer_settings(db)


@router.patch("/admin", response_model=FooterSettingsResponse)
def update_footer_settings(
    payload: FooterSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = get_or_create_footer_settings(db)
    data = payload.model_dump(exclude_unset=True)

    if "instagram_url" in data:
        settings.instagram_url = normalize_social_url(
            data["instagram_url"], "instagram"
        )
    if "telegram_url" in data:
        settings.telegram_url = normalize_social_url(
            data["telegram_url"], "telegram"
        )
    if "whatsapp_url" in data:
        settings.whatsapp_url = normalize_social_url(
            data["whatsapp_url"], "whatsapp"
        )

    db.commit()
    db.refresh(settings)
    return settings
