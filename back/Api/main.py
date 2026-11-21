from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Api import auth, user
from Api.config import settings

# Las tablas las crea y modifica Alembic:  .venv/bin/alembic upgrade head
app = FastAPI(title="Lejuy System API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(user.router)
