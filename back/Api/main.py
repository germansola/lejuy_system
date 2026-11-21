from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from Api import auth, tarea, user
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
app.include_router(tarea.router)

# Archivos subidos (fotos de perfil). Los nombres son aleatorios, así que no se pueden adivinar.
Path(settings.media_dir).mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.media_dir), name="media")
