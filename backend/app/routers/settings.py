from html import escape

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import SeoGlobalSettings, SeoPage, User
from app.schemas import (
    LegacySeoResponse,
    SeoCheckResponse,
    SeoGlobalSettingsResponse,
    SeoGlobalSettingsUpdate,
    SeoPageCreate,
    SeoPageResponse,
    SeoPageUpdate,
    SeoPublicResponse
)


api_router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"]
)

public_router = APIRouter(
    tags=["SEO Public"]
)


def normalize_path(path: str) -> str:
    if not path:
        return "/"

    path = path.strip()

    if not path.startswith("/"):
        path = f"/{path}"

    if len(path) > 1 and path.endswith("/"):
        path = path[:-1]

    return path


def get_or_create_global_settings(db: Session):
    settings = db.query(SeoGlobalSettings).first()

    if settings:
        return settings

    settings = SeoGlobalSettings(
        site_url="https://chondo.kz",
        default_site_name="Chondo Group",
        default_og_image="",
        robots_txt="User-agent: *\nAllow: /\n\nSitemap: https://chondo.kz/sitemap.xml",
        organization_name="Chondo Group",
        organization_logo="",
        organization_phone="",
        organization_email="admin@chondo.kz",
        organization_address="",
        organization_city="",
        organization_country="Kazakhstan",
        social_links=""
    )

    db.add(settings)
    db.commit()
    db.refresh(settings)

    return settings


def seed_default_pages(db: Session):
    existing_count = db.query(SeoPage).count()

    if existing_count > 0:
        return

    default_pages = [
        {
            "page_name": "Главная",
            "path": "/",
            "h1": "Chondo Group",
            "title": "Chondo Group — строительная компания",
            "description": "Строительная компания Chondo Group. Реализуем проекты, ремонт и строительные работы под ключ.",
            "focus_keyword": "строительная компания",
            "keywords": "строительство, ремонт, chondo, chondo group",
            "canonical_url": "https://chondo.kz",
            "robots": "index, follow",
            "og_title": "Chondo Group",
            "og_description": "Строительная компания Chondo Group.",
            "og_image": "",
            "sitemap_priority": 1.0,
            "sitemap_changefreq": "weekly"
        },
        {
            "page_name": "О компании",
            "path": "/about",
            "h1": "О компании",
            "title": "О компании — Chondo Group",
            "description": "Информация о компании Chondo Group, опыте, подходе и реализованных проектах.",
            "focus_keyword": "о компании Chondo Group",
            "keywords": "о компании, chondo group",
            "canonical_url": "https://chondo.kz/about",
            "robots": "index, follow",
            "sitemap_priority": 0.8,
            "sitemap_changefreq": "monthly"
        },
        {
            "page_name": "Услуги",
            "path": "/services",
            "h1": "Услуги",
            "title": "Услуги — Chondo Group",
            "description": "Услуги компании Chondo Group: строительство, ремонт, проектные и подрядные работы.",
            "focus_keyword": "строительные услуги",
            "keywords": "строительные услуги, ремонт, подрядные работы",
            "canonical_url": "https://chondo.kz/services",
            "robots": "index, follow",
            "sitemap_priority": 0.9,
            "sitemap_changefreq": "monthly"
        },
        {
            "page_name": "Кейсы",
            "path": "/cases",
            "h1": "Кейсы",
            "title": "Кейсы — Chondo Group",
            "description": "Примеры выполненных проектов и кейсов компании Chondo Group.",
            "focus_keyword": "кейсы строительства",
            "keywords": "кейсы, проекты, строительство",
            "canonical_url": "https://chondo.kz/cases",
            "robots": "index, follow",
            "sitemap_priority": 0.7,
            "sitemap_changefreq": "monthly"
        },
        {
            "page_name": "Контакты",
            "path": "/contacts",
            "h1": "Контакты",
            "title": "Контакты — Chondo Group",
            "description": "Свяжитесь с Chondo Group для консультации по строительным и ремонтным работам.",
            "focus_keyword": "контакты Chondo Group",
            "keywords": "контакты, chondo group",
            "canonical_url": "https://chondo.kz/contacts",
            "robots": "index, follow",
            "sitemap_priority": 0.7,
            "sitemap_changefreq": "monthly"
        }
    ]

    for page_data in default_pages:
        page = SeoPage(**page_data)
        db.add(page)

    db.commit()


def get_page_by_path(db: Session, path: str):
    normalized_path = normalize_path(path)

    return db.query(SeoPage).filter(
        SeoPage.path == normalized_path
    ).first()


def get_home_page(db: Session):
    seed_default_pages(db)

    page = get_page_by_path(db, "/")

    if page:
        return page

    page = SeoPage(
        page_name="Главная",
        path="/",
        h1="Chondo Group",
        title="Chondo Group — строительная компания",
        description="Строительная компания Chondo Group.",
        canonical_url="https://chondo.kz",
        robots="index, follow",
        sitemap_priority=1.0
    )

    db.add(page)
    db.commit()
    db.refresh(page)

    return page


def build_legacy_seo_response(db: Session):
    global_settings = get_or_create_global_settings(db)
    page = get_home_page(db)

    return {
        "id": page.id,
        "site_name": global_settings.default_site_name,
        "title": page.title,
        "description": page.description,
        "keywords": page.keywords,
        "og_title": page.og_title,
        "og_description": page.og_description,
        "og_image": page.og_image or global_settings.default_og_image,
        "canonical_url": page.canonical_url,
        "robots": page.robots
    }


def build_seo_check(page: SeoPage):
    score = 100
    items = []

    title = page.title or ""
    description = page.description or ""
    focus_keyword = page.focus_keyword or ""

    title_len = len(title)
    description_len = len(description)

    if not title:
        score -= 15
        items.append({"type": "error", "text": "SEO Title не заполнен"})
    elif title_len < 30:
        score -= 7
        items.append({"type": "warning", "text": "SEO Title слишком короткий"})
    elif title_len > 70:
        score -= 7
        items.append({"type": "warning", "text": "SEO Title слишком длинный"})
    else:
        items.append({"type": "success", "text": "SEO Title нормальной длины"})

    if not description:
        score -= 15
        items.append({"type": "error", "text": "SEO Description не заполнен"})
    elif description_len < 70:
        score -= 7
        items.append({"type": "warning", "text": "SEO Description короткий"})
    elif description_len > 180:
        score -= 7
        items.append({"type": "warning", "text": "SEO Description длинный"})
    else:
        items.append({"type": "success", "text": "SEO Description нормальной длины"})

    if not page.h1:
        score -= 10
        items.append({"type": "warning", "text": "H1 не заполнен"})
    else:
        items.append({"type": "success", "text": "H1 заполнен"})

    if not page.canonical_url:
        score -= 8
        items.append({"type": "warning", "text": "Canonical URL не заполнен"})
    else:
        items.append({"type": "success", "text": "Canonical URL заполнен"})

    if not page.og_image:
        score -= 8
        items.append({"type": "warning", "text": "Open Graph Image не указан"})
    else:
        items.append({"type": "success", "text": "Open Graph Image указан"})

    if not focus_keyword:
        score -= 8
        items.append({"type": "warning", "text": "Фокусный запрос не заполнен"})
    else:
        if focus_keyword.lower() in title.lower():
            items.append({"type": "success", "text": "Фокусный запрос есть в Title"})
        else:
            score -= 5
            items.append({"type": "warning", "text": "Фокусного запроса нет в Title"})

        if focus_keyword.lower() in description.lower():
            items.append({"type": "success", "text": "Фокусный запрос есть в Description"})
        else:
            score -= 5
            items.append({"type": "warning", "text": "Фокусного запроса нет в Description"})

    if page.robots != "index, follow":
        score -= 10
        items.append({"type": "warning", "text": f"Robots сейчас: {page.robots}"})
    else:
        items.append({"type": "success", "text": "Robots разрешает индексацию"})

    if not page.sitemap_enabled:
        score -= 5
        items.append({"type": "warning", "text": "Страница выключена из sitemap.xml"})
    else:
        items.append({"type": "success", "text": "Страница включена в sitemap.xml"})

    if not page.schema_enabled:
        score -= 5
        items.append({"type": "warning", "text": "Schema JSON-LD выключена"})
    else:
        items.append({"type": "success", "text": "Schema JSON-LD включена"})

    score = max(0, min(100, score))

    return {
        "score": score,
        "items": items
    }


@api_router.get("/seo", response_model=LegacySeoResponse)
def get_legacy_seo_settings(db: Session = Depends(get_db)):
    return build_legacy_seo_response(db)


@api_router.patch("/seo", response_model=LegacySeoResponse)
def update_legacy_seo_settings(
    payload: SeoPageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    page = get_home_page(db)

    data = payload.model_dump(exclude_unset=True)

    allowed_fields = [
        "title",
        "description",
        "keywords",
        "canonical_url",
        "robots",
        "og_title",
        "og_description",
        "og_image"
    ]

    for key, value in data.items():
        if key in allowed_fields:
            setattr(page, key, value)

    db.commit()
    db.refresh(page)

    return build_legacy_seo_response(db)


@api_router.get("/seo/global", response_model=SeoGlobalSettingsResponse)
def get_global_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_or_create_global_settings(db)


@api_router.patch("/seo/global", response_model=SeoGlobalSettingsResponse)
def update_global_settings(
    payload: SeoGlobalSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = get_or_create_global_settings(db)

    data = payload.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return settings


@api_router.get("/seo/pages", response_model=list[SeoPageResponse])
def get_seo_pages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_default_pages(db)

    return db.query(SeoPage).order_by(SeoPage.id.asc()).all()


@api_router.post(
    "/seo/pages",
    response_model=SeoPageResponse,
    status_code=status.HTTP_201_CREATED
)
def create_seo_page(
    payload: SeoPageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    path = normalize_path(payload.path)

    existing_page = db.query(SeoPage).filter(
        SeoPage.path == path
    ).first()

    if existing_page:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SEO-страница с таким URL уже существует"
        )

    data = payload.model_dump()
    data["path"] = path

    page = SeoPage(**data)

    db.add(page)
    db.commit()
    db.refresh(page)

    return page


@api_router.get("/seo/pages/{page_id}", response_model=SeoPageResponse)
def get_seo_page(
    page_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    page = db.query(SeoPage).filter(
        SeoPage.id == page_id
    ).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SEO-страница не найдена"
        )

    return page


@api_router.patch("/seo/pages/{page_id}", response_model=SeoPageResponse)
def update_seo_page(
    page_id: int,
    payload: SeoPageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    page = db.query(SeoPage).filter(
        SeoPage.id == page_id
    ).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SEO-страница не найдена"
        )

    data = payload.model_dump(exclude_unset=True)

    if "path" in data and data["path"]:
        data["path"] = normalize_path(data["path"])

        existing_page = db.query(SeoPage).filter(
            SeoPage.path == data["path"],
            SeoPage.id != page_id
        ).first()

        if existing_page:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SEO-страница с таким URL уже существует"
            )

    for key, value in data.items():
        setattr(page, key, value)

    db.commit()
    db.refresh(page)

    return page


@api_router.delete("/seo/pages/{page_id}")
def delete_seo_page(
    page_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    page = db.query(SeoPage).filter(
        SeoPage.id == page_id
    ).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SEO-страница не найдена"
        )

    db.delete(page)
    db.commit()

    return {
        "message": "SEO-страница удалена"
    }


@api_router.get("/seo/check/{page_id}", response_model=SeoCheckResponse)
def check_seo_page(
    page_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    page = db.query(SeoPage).filter(
        SeoPage.id == page_id
    ).first()

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SEO-страница не найдена"
        )

    return build_seo_check(page)


@api_router.get("/seo/by-path", response_model=SeoPublicResponse)
def get_seo_by_path(
    path: str = "/",
    db: Session = Depends(get_db)
):
    global_settings = get_or_create_global_settings(db)
    seed_default_pages(db)

    page = get_page_by_path(db, path)

    return {
        "page": page,
        "global_settings": global_settings
    }


@public_router.get("/robots.txt")
def get_robots_txt(db: Session = Depends(get_db)):
    settings = get_or_create_global_settings(db)

    robots_txt = settings.robots_txt or "User-agent: *\nAllow: /"

    return Response(
        content=robots_txt,
        media_type="text/plain; charset=utf-8"
    )


@public_router.get("/sitemap.xml")
def get_sitemap_xml(db: Session = Depends(get_db)):
    settings = get_or_create_global_settings(db)
    seed_default_pages(db)

    site_url = (settings.site_url or "https://chondo.kz").rstrip("/")

    pages = db.query(SeoPage).filter(
        SeoPage.sitemap_enabled == True
    ).order_by(SeoPage.id.asc()).all()

    urls = []

    for page in pages:
        page_path = page.path or "/"
        loc = site_url if page_path == "/" else f"{site_url}{page_path}"

        urls.append(
            f"""
    <url>
        <loc>{escape(loc)}</loc>
        <changefreq>{escape(page.sitemap_changefreq or "weekly")}</changefreq>
        <priority>{page.sitemap_priority or 0.8}</priority>
    </url>"""
        )

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{''.join(urls)}
</urlset>
"""

    return Response(
        content=xml,
        media_type="application/xml; charset=utf-8"
    )