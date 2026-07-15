from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    # Legacy field: the public form no longer collects email.
    email = Column(String(255), nullable=True, default="")
    phone = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    login = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SeoGlobalSettings(Base):
    __tablename__ = "seo_global_settings"

    id = Column(Integer, primary_key=True, index=True)

    site_url = Column(String(500), nullable=True, default="https://chondo.kz")
    default_site_name = Column(String(255), nullable=True, default="Chondo Group")
    default_og_image = Column(String(500), nullable=True)

    robots_txt = Column(
        Text,
        nullable=True,
        default="User-agent: *\nAllow: /\n\nSitemap: https://chondo.kz/sitemap.xml"
    )

    organization_name = Column(String(255), nullable=True, default="Chondo Group")
    organization_logo = Column(String(500), nullable=True)
    organization_phone = Column(String(100), nullable=True)
    organization_email = Column(String(255), nullable=True)
    organization_address = Column(String(500), nullable=True)
    organization_city = Column(String(255), nullable=True)
    organization_country = Column(String(255), nullable=True, default="Kazakhstan")
    social_links = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )


class SeoPage(Base):
    __tablename__ = "seo_pages"

    id = Column(Integer, primary_key=True, index=True)

    page_name = Column(String(255), nullable=False)
    path = Column(String(500), unique=True, nullable=False, index=True)

    h1 = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    focus_keyword = Column(String(255), nullable=True)
    keywords = Column(Text, nullable=True)

    canonical_url = Column(String(500), nullable=True)
    robots = Column(String(100), nullable=True, default="index, follow")

    og_title = Column(String(255), nullable=True)
    og_description = Column(Text, nullable=True)
    og_image = Column(String(500), nullable=True)
    og_type = Column(String(100), nullable=True, default="website")

    twitter_card = Column(String(100), nullable=True, default="summary_large_image")
    twitter_title = Column(String(255), nullable=True)
    twitter_description = Column(Text, nullable=True)
    twitter_image = Column(String(500), nullable=True)

    sitemap_enabled = Column(Boolean, nullable=False, default=True)
    sitemap_priority = Column(Float, nullable=False, default=0.8)
    sitemap_changefreq = Column(String(50), nullable=False, default="weekly")

    schema_enabled = Column(Boolean, nullable=False, default=True)
    schema_type = Column(String(100), nullable=True, default="Organization")
    custom_schema_json = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )


class AnalyticsVisit(Base):
    __tablename__ = "analytics_visits"

    id = Column(Integer, primary_key=True, index=True)

    visitor_id = Column(String(100), nullable=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)

    path = Column(String(500), nullable=True)
    referrer = Column(Text, nullable=True)

    source = Column(String(100), nullable=True, index=True)
    medium = Column(String(100), nullable=True)
    campaign = Column(String(255), nullable=True)

    country = Column(String(255), nullable=True, index=True)
    country_code = Column(String(20), nullable=True, index=True)

    browser = Column(String(100), nullable=True, index=True)
    os = Column(String(100), nullable=True)
    device = Column(String(100), nullable=True)

    user_agent = Column(Text, nullable=True)
    ip_hash = Column(String(255), nullable=True)

    language = Column(String(100), nullable=True)
    screen_width = Column(Integer, nullable=True)
    screen_height = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class ClientLogo(Base):
    __tablename__ = "client_logos"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)
    image_url = Column(String(1000), nullable=False)
    cloud_public_id = Column(String(500), nullable=True)

    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

class ProjectCase(Base):
    __tablename__ = "project_cases"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    category = Column(String(100), nullable=False, default="development")
    logo_text = Column(String(50), nullable=True)
    accent = Column(String(50), nullable=False, default="#111111")

    image_url = Column(String(1000), nullable=True)
    cloud_public_id = Column(String(500), nullable=True)

    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

class FooterSettings(Base):
    __tablename__ = "footer_settings"

    id = Column(Integer, primary_key=True, index=True)
    instagram_url = Column(String(1000), nullable=True)
    telegram_url = Column(String(1000), nullable=True)
    whatsapp_url = Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
