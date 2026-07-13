import re
from typing import List
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import ClientLogo, User
from app.schemas import ClientLogoResponse, ClientLogoUpdate


router = APIRouter(
    prefix="/api/client-logos",
    tags=["Client logos"]
)


def configure_cloudinary():
    if (
        not settings.CLOUDINARY_CLOUD_NAME
        or not settings.CLOUDINARY_API_KEY
        or not settings.CLOUDINARY_API_SECRET
    ):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary не настроен. Проверь CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET в .env"
        )

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )


def make_slug(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9а-яё]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "logo"


@router.get("/", response_model=List[ClientLogoResponse])
def get_public_client_logos(db: Session = Depends(get_db)):
    logos = (
        db.query(ClientLogo)
        .filter(ClientLogo.is_active == True)
        .order_by(ClientLogo.sort_order.asc(), ClientLogo.id.asc())
        .all()
    )

    return logos


@router.get("/admin", response_model=List[ClientLogoResponse])
def get_admin_client_logos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logos = (
        db.query(ClientLogo)
        .order_by(ClientLogo.sort_order.asc(), ClientLogo.id.asc())
        .all()
    )

    return logos


@router.post("/", response_model=ClientLogoResponse, status_code=status.HTTP_201_CREATED)
def upload_client_logo(
    name: str = Form(...),
    sort_order: int | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    name = name.strip()

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Название компании обязательно"
        )

    allowed_types = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/svg+xml"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Можно загружать только PNG, JPG, WEBP или SVG"
        )

    configure_cloudinary()

    if sort_order is None:
        max_sort_order = db.query(func.max(ClientLogo.sort_order)).scalar()
        sort_order = (max_sort_order or 0) + 10

    public_id = f"{make_slug(name)}-{uuid4().hex[:8]}"

    try:
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder=settings.CLOUDINARY_FOLDER,
            public_id=public_id,
            resource_type="image",
            overwrite=False
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка загрузки в Cloudinary: {exc}"
        )

    image_url = upload_result.get("secure_url")
    cloud_public_id = upload_result.get("public_id")

    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary не вернул ссылку на изображение"
        )

    logo = ClientLogo(
        name=name,
        image_url=image_url,
        cloud_public_id=cloud_public_id,
        sort_order=sort_order,
        is_active=True
    )

    db.add(logo)
    db.commit()
    db.refresh(logo)

    return logo


@router.patch("/{logo_id}", response_model=ClientLogoResponse)
def update_client_logo(
    logo_id: int,
    data: ClientLogoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logo = db.query(ClientLogo).filter(ClientLogo.id == logo_id).first()

    if not logo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Логотип не найден"
        )

    if data.name is not None:
        logo.name = data.name.strip()

    if data.sort_order is not None:
        logo.sort_order = data.sort_order

    if data.is_active is not None:
        logo.is_active = data.is_active

    db.commit()
    db.refresh(logo)

    return logo


@router.delete("/{logo_id}")
def delete_client_logo(
    logo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logo = db.query(ClientLogo).filter(ClientLogo.id == logo_id).first()

    if not logo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Логотип не найден"
        )

    if logo.cloud_public_id:
        try:
            configure_cloudinary()
            cloudinary.uploader.destroy(
                logo.cloud_public_id,
                resource_type="image"
            )
        except Exception:
            pass

    db.delete(logo)
    db.commit()

    return {
        "ok": True,
        "message": "Логотип удалён"
    }

@router.patch("/{logo_id}/image", response_model=ClientLogoResponse)
def replace_client_logo_image(
    logo_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logo = db.query(ClientLogo).filter(ClientLogo.id == logo_id).first()

    if not logo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Логотип не найден"
        )

    allowed_types = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/svg+xml"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Можно загружать только PNG, JPG, WEBP или SVG"
        )

    configure_cloudinary()

    old_public_id = logo.cloud_public_id
    public_id = f"{make_slug(logo.name)}-{uuid4().hex[:8]}"

    try:
      upload_result = cloudinary.uploader.upload(
          file.file,
          folder=settings.CLOUDINARY_FOLDER,
          public_id=public_id,
          resource_type="image",
          overwrite=False
      )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка загрузки в Cloudinary: {exc}"
        )

    image_url = upload_result.get("secure_url")
    cloud_public_id = upload_result.get("public_id")

    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary не вернул ссылку на изображение"
        )

    logo.image_url = image_url
    logo.cloud_public_id = cloud_public_id

    db.commit()
    db.refresh(logo)

    if old_public_id:
        try:
            cloudinary.uploader.destroy(
                old_public_id,
                resource_type="image"
            )
        except Exception:
            pass

    return logo