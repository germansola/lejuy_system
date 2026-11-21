import warnings
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from Api import archivos, auth, tarea, user
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

# Fotos de perfil guardadas en disco (solo en desarrollo; en Vercel van a Blob y el disco no se puede usar).
# Los nombres son aleatorios, así que no se pueden adivinar.
if not archivos.usa_blob():
    try:
        Path(settings.media_dir).mkdir(parents=True, exist_ok=True)
    except OSError:
        # Disco de solo lectura (Vercel sin Blob conectado): la API arranca igual, sin fotos.
        warnings.warn("No se puede escribir en media_dir y no hay BLOB_READ_WRITE_TOKEN: las fotos no se van a poder subir.")
    else:
        app.mount("/media", StaticFiles(directory=settings.media_dir), name="media")
