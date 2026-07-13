from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.routers import analytics
from app.routers import auth
from app.routers import cases
from app.routers import client_logos
from app.routers import leads
from app.routers import settings
from app.routers import telegram
from app.routers import users


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Chondo API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(users.router)

app.include_router(settings.api_router)
app.include_router(settings.public_router)

app.include_router(analytics.router)
app.include_router(telegram.router)
app.include_router(client_logos.router)
app.include_router(cases.router)


@app.get("/")
def root():
    return {
        "message": "Chondo API is running"
    }