from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    login: str
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    login: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    login: str
    email: EmailStr
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserMeResponse(BaseModel):
    id: int
    login: str
    email: EmailStr

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class LeadCreate(BaseModel):
    name: str
    phone: str
    message: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    name: str
    phone: str
    message: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SeoGlobalSettingsUpdate(BaseModel):
    site_url: Optional[str] = None
    default_site_name: Optional[str] = None
    default_og_image: Optional[str] = None
    robots_txt: Optional[str] = None

    organization_name: Optional[str] = None
    organization_logo: Optional[str] = None
    organization_phone: Optional[str] = None
    organization_email: Optional[str] = None
    organization_address: Optional[str] = None
    organization_city: Optional[str] = None
    organization_country: Optional[str] = None
    social_links: Optional[str] = None


class SeoGlobalSettingsResponse(SeoGlobalSettingsUpdate):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SeoPageBase(BaseModel):
    page_name: Optional[str] = None
    path: Optional[str] = None

    h1: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    focus_keyword: Optional[str] = None
    keywords: Optional[str] = None

    canonical_url: Optional[str] = None
    robots: Optional[str] = "index, follow"

    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image: Optional[str] = None
    og_type: Optional[str] = "website"

    twitter_card: Optional[str] = "summary_large_image"
    twitter_title: Optional[str] = None
    twitter_description: Optional[str] = None
    twitter_image: Optional[str] = None

    sitemap_enabled: Optional[bool] = True
    sitemap_priority: Optional[float] = 0.8
    sitemap_changefreq: Optional[str] = "weekly"

    schema_enabled: Optional[bool] = True
    schema_type: Optional[str] = "Organization"
    custom_schema_json: Optional[str] = None


class SeoPageCreate(SeoPageBase):
    page_name: str
    path: str


class SeoPageUpdate(SeoPageBase):
    pass


class SeoPageResponse(SeoPageBase):
    id: int
    page_name: str
    path: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SeoPublicResponse(BaseModel):
    page: Optional[SeoPageResponse] = None
    global_settings: SeoGlobalSettingsResponse


class SeoCheckItem(BaseModel):
    type: str
    text: str


class SeoCheckResponse(BaseModel):
    score: int
    items: List[SeoCheckItem]


class LegacySeoResponse(BaseModel):
    id: int
    site_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image: Optional[str] = None
    canonical_url: Optional[str] = None
    robots: Optional[str] = None


class AnalyticsTrackRequest(BaseModel):
    visitor_id: Optional[str] = None
    session_id: Optional[str] = None

    path: Optional[str] = None
    referrer: Optional[str] = None

    language: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None


class AnalyticsMetricItem(BaseModel):
    name: str
    value: int
    code: Optional[str] = None


class AnalyticsDailyItem(BaseModel):
    date: str
    visits: int
    unique_visitors: int


class AnalyticsSummaryResponse(BaseModel):
    total_visits: int
    unique_visitors: int
    countries: List[AnalyticsMetricItem]
    sources: List[AnalyticsMetricItem]
    browsers: List[AnalyticsMetricItem]
    daily: List[AnalyticsDailyItem]

class ClientLogoUpdate(BaseModel):
    name: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class ClientLogoResponse(BaseModel):
    id: int
    name: str
    image_url: str
    cloud_public_id: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
    
class ProjectCaseUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    logo_text: Optional[str] = None
    accent: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class ProjectCaseResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    category: str
    logo_text: Optional[str] = None
    accent: str
    image_url: Optional[str] = None
    cloud_public_id: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FooterSettingsUpdate(BaseModel):
    instagram_url: Optional[str] = None
    telegram_url: Optional[str] = None
    whatsapp_url: Optional[str] = None


class FooterSettingsResponse(FooterSettingsUpdate):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
