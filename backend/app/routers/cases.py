import re
from typing import List
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import ProjectCase, User
from app.schemas import ProjectCaseResponse, ProjectCaseUpdate


router = APIRouter(
    prefix="/api/cases",
    tags=["Cases"]
)


ALLOWED_CATEGORIES = [
    "development",
    "digital",
    "experts",
    "funnels",
    "uxui",
    "podcasts"
]


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

    return value or "case"


def validate_image(file: UploadFile):
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


@router.get("/", response_model=List[ProjectCaseResponse])
def get_public_cases(response: Response, db: Session = Depends(get_db)):
    """
    Публичный endpoint для сайта.
    Возвращает только опубликованные кейсы.
    """

    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    response.headers["Pragma"] = "no-cache"

    cases = (
        db.query(ProjectCase)
        .filter(ProjectCase.is_active == True)
        .order_by(
            ProjectCase.category.asc(),
            ProjectCase.sort_order.asc(),
            ProjectCase.id.asc()
        )
        .all()
    )

    return cases


@router.get("/admin", response_model=List[ProjectCaseResponse])
def get_admin_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint для админки.
    Возвращает все кейсы: активные и скрытые.
    """

    cases = (
        db.query(ProjectCase)
        .order_by(
            ProjectCase.category.asc(),
            ProjectCase.sort_order.asc(),
            ProjectCase.id.asc()
        )
        .all()
    )

    return cases


@router.post("/", response_model=ProjectCaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    title: str = Form(...),
    subtitle: str | None = Form(None),
    description: str | None = Form(None),
    category: str = Form("development"),
    logo_text: str | None = Form(None),
    accent: str = Form("#111111"),
    sort_order: int | None = Form(None),
    is_active: bool = Form(True),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Создание нового кейса.
    Картинка, если есть, загружается в Cloudinary.
    """

    title = title.strip()

    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Название кейса обязательно"
        )

    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверная рубрика кейса"
        )

    if sort_order is None:
        max_sort_order = db.query(func.max(ProjectCase.sort_order)).scalar()
        sort_order = (max_sort_order or 0) + 10

    image_url = None
    cloud_public_id = None

    if file:
        validate_image(file)
        configure_cloudinary()

        public_id = f"{make_slug(title)}-{uuid4().hex[:8]}"

        try:
            upload_result = cloudinary.uploader.upload(
                file.file,
                folder="chondo-group/cases",
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

    project_case = ProjectCase(
        title=title,
        subtitle=subtitle,
        description=description,
        category=category,
        logo_text=logo_text,
        accent=accent,
        image_url=image_url,
        cloud_public_id=cloud_public_id,
        sort_order=sort_order,
        is_active=is_active
    )

    db.add(project_case)
    db.commit()
    db.refresh(project_case)

    return project_case


@router.patch("/{case_id}", response_model=ProjectCaseResponse)
def update_case(
    case_id: int,
    data: ProjectCaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Редактирование данных кейса без замены картинки.
    """

    project_case = db.query(ProjectCase).filter(ProjectCase.id == case_id).first()

    if not project_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Кейс не найден"
        )

    if data.title is not None:
        title = data.title.strip()

        if not title:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Название кейса не может быть пустым"
            )

        project_case.title = title

    if data.subtitle is not None:
        project_case.subtitle = data.subtitle

    if data.description is not None:
        project_case.description = data.description

    if data.category is not None:
        if data.category not in ALLOWED_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Неверная рубрика кейса"
            )

        project_case.category = data.category

    if data.logo_text is not None:
        project_case.logo_text = data.logo_text

    if data.accent is not None:
        project_case.accent = data.accent

    if data.sort_order is not None:
        project_case.sort_order = data.sort_order

    if data.is_active is not None:
        project_case.is_active = data.is_active

    db.commit()
    db.refresh(project_case)

    return project_case


@router.patch("/{case_id}/image", response_model=ProjectCaseResponse)
def replace_case_image(
    case_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Замена изображения кейса.
    Новое изображение загружается в Cloudinary.
    Старое изображение удаляется из Cloudinary.
    """

    project_case = db.query(ProjectCase).filter(ProjectCase.id == case_id).first()

    if not project_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Кейс не найден"
        )

    validate_image(file)
    configure_cloudinary()

    old_public_id = project_case.cloud_public_id
    public_id = f"{make_slug(project_case.title)}-{uuid4().hex[:8]}"

    try:
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="chondo-group/cases",
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

    project_case.image_url = image_url
    project_case.cloud_public_id = cloud_public_id

    db.commit()
    db.refresh(project_case)

    if old_public_id:
        try:
            cloudinary.uploader.destroy(
                old_public_id,
                resource_type="image"
            )
        except Exception:
            pass

    return project_case


@router.delete("/{case_id}")
def delete_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Удаление кейса.
    Если у кейса есть картинка в Cloudinary, она тоже удаляется.
    """

    project_case = db.query(ProjectCase).filter(ProjectCase.id == case_id).first()

    if not project_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Кейс не найден"
        )

    if project_case.cloud_public_id:
        try:
            configure_cloudinary()
            cloudinary.uploader.destroy(
                project_case.cloud_public_id,
                resource_type="image"
            )
        except Exception:
            pass

    db.delete(project_case)
    db.commit()

    return {
        "ok": True,
        "message": "Кейс удалён"
    }