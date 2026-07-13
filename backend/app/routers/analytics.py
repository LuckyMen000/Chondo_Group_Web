import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import parse_qs, urlparse

from fastapi import APIRouter, Depends, Request
from sqlalchemy import Date, cast, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import AnalyticsVisit, User
from app.schemas import AnalyticsSummaryResponse, AnalyticsTrackRequest


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


COUNTRY_NAMES = {
    "KZ": "Казахстан",
    "RU": "Россия",
    "US": "США",
    "GB": "Великобритания",
    "DE": "Германия",
    "FR": "Франция",
    "TR": "Турция",
    "CN": "Китай",
    "UZ": "Узбекистан",
    "KG": "Кыргызстан",
    "UA": "Украина",
    "BY": "Беларусь",
    "AE": "ОАЭ",
    "AZ": "Азербайджан",
    "AM": "Армения",
    "GE": "Грузия",
    "TJ": "Таджикистан",
    "TM": "Туркменистан",
    "KR": "Южная Корея",
    "JP": "Япония",
    "IN": "Индия",
    "PK": "Пакистан",
    "IR": "Иран",
    "IQ": "Ирак",
    "SA": "Саудовская Аравия",
    "QA": "Катар",
    "KW": "Кувейт",
    "IT": "Италия",
    "ES": "Испания",
    "PT": "Португалия",
    "NL": "Нидерланды",
    "BE": "Бельгия",
    "CH": "Швейцария",
    "AT": "Австрия",
    "PL": "Польша",
    "CZ": "Чехия",
    "SK": "Словакия",
    "HU": "Венгрия",
    "RO": "Румыния",
    "BG": "Болгария",
    "GR": "Греция",
    "SE": "Швеция",
    "NO": "Норвегия",
    "FI": "Финляндия",
    "DK": "Дания",
    "IE": "Ирландия",
    "CA": "Канада",
    "MX": "Мексика",
    "BR": "Бразилия",
    "AR": "Аргентина",
    "CL": "Чили",
    "CO": "Колумбия",
    "PE": "Перу",
    "AU": "Австралия",
    "NZ": "Новая Зеландия",
    "ZA": "ЮАР",
    "EG": "Египет",
    "MA": "Марокко",
    "DZ": "Алжир",
    "TN": "Тунис",
    "NG": "Нигерия",
}


def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("x-real-ip")

    if real_ip:
        return real_ip.strip()

    if request.client:
        return request.client.host

    return "unknown"


def hash_ip(ip: str) -> Optional[str]:
    if not ip:
        return None

    return hashlib.sha256(ip.encode("utf-8")).hexdigest()


def get_country_from_headers(request: Request):
    country_code = (
        request.headers.get("cf-ipcountry")
        or request.headers.get("x-vercel-ip-country")
        or request.headers.get("x-country-code")
        or ""
    )

    country_code = country_code.upper().strip()

    if not country_code or country_code == "XX":
        return {
            "country": "Неизвестно",
            "country_code": "UNKNOWN"
        }

    return {
        "country": COUNTRY_NAMES.get(country_code, country_code),
        "country_code": country_code
    }


def detect_source(referrer: str):
    if not referrer:
        return {
            "source": "Direct",
            "medium": "direct",
            "campaign": None
        }

    referrer_lower = referrer.lower()

    source_map = [
        ("instagram.", "Instagram", "social"),
        ("l.instagram.com", "Instagram", "social"),
        ("facebook.", "Facebook", "social"),
        ("fb.com", "Facebook", "social"),
        ("m.facebook.com", "Facebook", "social"),
        ("discord.", "Discord", "social"),
        ("tiktok.", "TikTok", "social"),
        ("whatsapp.", "WhatsApp", "messenger"),
        ("wa.me", "WhatsApp", "messenger"),
        ("viber.", "Viber", "messenger"),
        ("vk.com", "VK", "social"),
        ("linkedin.", "LinkedIn", "social"),
        ("google.", "Google", "organic"),
        ("yandex.", "Yandex", "organic"),
        ("ya.ru", "Yandex", "organic"),
        ("bing.", "Bing", "organic"),
        ("duckduckgo.", "DuckDuckGo", "organic"),
    ]

    for marker, source, medium in source_map:
        if marker in referrer_lower:
            return {
                "source": source,
                "medium": medium,
                "campaign": None
            }

    parsed = urlparse(referrer)
    host = parsed.netloc.replace("www.", "")

    return {
        "source": host or "Referral",
        "medium": "referral",
        "campaign": None
    }


def detect_utm_source_from_url(path: str):
    if not path:
        return None

    parsed = urlparse(path)
    params = parse_qs(parsed.query)

    utm_source = params.get("utm_source", [None])[0]

    if not utm_source:
        return None

    normalized = utm_source.lower().strip()

    source_map = {
        "instagram": "Instagram",
        "ig": "Instagram",
        "facebook": "Facebook",
        "fb": "Facebook",
        "discord": "Discord",
        "tiktok": "TikTok",
        "tt": "TikTok",
        "whatsapp": "WhatsApp",
        "wa": "WhatsApp",
        "viber": "Viber",
        "vk": "VK",
        "linkedin": "LinkedIn",
        "google": "Google",
        "yandex": "Yandex",
        "ya": "Yandex",
    }

    return source_map.get(normalized, utm_source)


def detect_campaign_from_url(path: str):
    if not path:
        return None

    parsed = urlparse(path)
    params = parse_qs(parsed.query)

    return params.get("utm_campaign", [None])[0]


def detect_browser(user_agent: str):
    if not user_agent:
        return "Неизвестно"

    ua = user_agent.lower()

    if "yabrowser" in ua:
        return "Яндекс Браузер"

    if "edg/" in ua or "edge/" in ua:
        return "Microsoft Edge"

    if "opr/" in ua or "opera" in ua:
        return "Opera"

    if "firefox" in ua:
        return "Firefox"

    if "samsungbrowser" in ua:
        return "Samsung Browser"

    if "chrome" in ua and "chromium" not in ua:
        return "Google Chrome"

    if "safari" in ua and "chrome" not in ua:
        return "Safari"

    if "chromium" in ua:
        return "Chromium"

    return "Другой браузер"


def detect_os(user_agent: str):
    if not user_agent:
        return "Неизвестно"

    ua = user_agent.lower()

    if "windows" in ua:
        return "Windows"

    if "android" in ua:
        return "Android"

    if "iphone" in ua or "ipad" in ua or "ios" in ua:
        return "iOS"

    if "mac os" in ua or "macintosh" in ua:
        return "macOS"

    if "linux" in ua:
        return "Linux"

    return "Другая ОС"


def detect_device(user_agent: str):
    if not user_agent:
        return "Неизвестно"

    ua = user_agent.lower()

    if "ipad" in ua or "tablet" in ua:
        return "Tablet"

    if "mobile" in ua or "iphone" in ua or "android" in ua:
        return "Mobile"

    return "Desktop"


def resolve_period(period: str, date_from: Optional[str], date_to: Optional[str]):
    now = datetime.now(timezone.utc)

    if period == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now

    elif period == "yesterday":
        yesterday = now - timedelta(days=1)
        start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        end = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)

    elif period == "7d":
        start = now - timedelta(days=7)
        end = now

    elif period == "14d":
        start = now - timedelta(days=14)
        end = now

    elif period == "30d":
        start = now - timedelta(days=30)
        end = now

    elif period == "2m":
        start = now - timedelta(days=60)
        end = now

    elif period == "6m":
        start = now - timedelta(days=180)
        end = now

    elif period == "custom" and date_from and date_to:
        start = datetime.fromisoformat(date_from).replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
            tzinfo=timezone.utc
        )
        end = datetime.fromisoformat(date_to).replace(
            hour=23,
            minute=59,
            second=59,
            microsecond=999999,
            tzinfo=timezone.utc
        )

    else:
        start = now - timedelta(days=7)
        end = now

    return start, end


def build_metric_rows(rows):
    result = []

    for row in rows:
        if len(row) == 3:
            name, code, value = row

            result.append({
                "name": name or "Неизвестно",
                "code": code,
                "value": value
            })
        else:
            name, value = row

            result.append({
                "name": name or "Неизвестно",
                "value": value
            })

    return result


@router.post("/track")
def track_visit(
    payload: AnalyticsTrackRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    user_agent = request.headers.get("user-agent", "")
    ip = get_client_ip(request)

    country_data = get_country_from_headers(request)

    source_data = detect_source(payload.referrer or "")
    utm_source = detect_utm_source_from_url(payload.path or "")
    campaign = detect_campaign_from_url(payload.path or "")

    if utm_source:
        source_data["source"] = utm_source
        source_data["medium"] = "utm"

    visit = AnalyticsVisit(
        visitor_id=payload.visitor_id,
        session_id=payload.session_id,

        path=payload.path,
        referrer=payload.referrer,

        source=source_data["source"],
        medium=source_data["medium"],
        campaign=campaign or source_data["campaign"],

        country=country_data["country"],
        country_code=country_data["country_code"],

        browser=detect_browser(user_agent),
        os=detect_os(user_agent),
        device=detect_device(user_agent),

        user_agent=user_agent,
        ip_hash=hash_ip(ip),

        language=payload.language,
        screen_width=payload.screen_width,
        screen_height=payload.screen_height
    )

    db.add(visit)
    db.commit()

    return {
        "message": "Visit tracked"
    }


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    period: str = "7d",
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    start, end = resolve_period(period, date_from, date_to)

    base_query = db.query(AnalyticsVisit).filter(
        AnalyticsVisit.created_at >= start,
        AnalyticsVisit.created_at <= end
    )

    total_visits = base_query.count()

    unique_visitors = db.query(
        func.count(func.distinct(AnalyticsVisit.visitor_id))
    ).filter(
        AnalyticsVisit.created_at >= start,
        AnalyticsVisit.created_at <= end
    ).scalar() or 0

    country_rows = db.query(
        AnalyticsVisit.country,
        AnalyticsVisit.country_code,
        func.count(AnalyticsVisit.id)
    ).filter(
        AnalyticsVisit.created_at >= start,
        AnalyticsVisit.created_at <= end
    ).group_by(
        AnalyticsVisit.country,
        AnalyticsVisit.country_code
    ).order_by(
        func.count(AnalyticsVisit.id).desc()
    ).limit(50).all()

    source_rows = db.query(
        AnalyticsVisit.source,
        func.count(AnalyticsVisit.id)
    ).filter(
        AnalyticsVisit.created_at >= start,
        AnalyticsVisit.created_at <= end
    ).group_by(
        AnalyticsVisit.source
    ).order_by(
        func.count(AnalyticsVisit.id).desc()
    ).limit(50).all()

    browser_rows = db.query(
        AnalyticsVisit.browser,
        func.count(AnalyticsVisit.id)
    ).filter(
        AnalyticsVisit.created_at >= start,
        AnalyticsVisit.created_at <= end
    ).group_by(
        AnalyticsVisit.browser
    ).order_by(
        func.count(AnalyticsVisit.id).desc()
    ).limit(50).all()

    daily_rows = db.query(
        cast(AnalyticsVisit.created_at, Date).label("date"),
        func.count(AnalyticsVisit.id).label("visits"),
        func.count(func.distinct(AnalyticsVisit.visitor_id)).label("unique_visitors")
    ).filter(
        AnalyticsVisit.created_at >= start,
        AnalyticsVisit.created_at <= end
    ).group_by(
        cast(AnalyticsVisit.created_at, Date)
    ).order_by(
        cast(AnalyticsVisit.created_at, Date).asc()
    ).all()

    daily = []

    for row in daily_rows:
        daily.append({
            "date": str(row.date),
            "visits": row.visits,
            "unique_visitors": row.unique_visitors
        })

    return {
        "total_visits": total_visits,
        "unique_visitors": unique_visitors,
        "countries": build_metric_rows(country_rows),
        "sources": build_metric_rows(source_rows),
        "browsers": build_metric_rows(browser_rows),
        "daily": daily
    }