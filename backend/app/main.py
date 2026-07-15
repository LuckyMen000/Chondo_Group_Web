from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine

from app.routers import analytics
from app.routers import auth
from app.routers import cases
from app.routers import client_logos
from app.routers import footer
from app.routers import leads
from app.routers import settings as settings_router
from app.routers import telegram
from app.routers import users


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Chondo API"
)


def get_allowed_origins() -> list[str]:
    configured_origins = [
        origin.strip().rstrip("/")
        for origin in (settings.FRONTEND_URL or "").split(",")
        if origin.strip()
    ]

    default_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://chondo.kz",
        "https://www.chondo.kz",
    ]

    return list(dict.fromkeys([*default_origins, *configured_origins]))


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(users.router)

app.include_router(settings_router.api_router)
app.include_router(settings_router.public_router)

app.include_router(analytics.router)
app.include_router(telegram.router)
app.include_router(client_logos.router)
app.include_router(footer.router)
app.include_router(cases.router)


@app.get("/")
def root():
    return {
        "message": "Chondo API is running"
    }
