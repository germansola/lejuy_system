"""Punto de entrada para Vercel.

Vercel busca una app de FastAPI llamada `app` en archivos con nombres fijos (index.py, app.py, main.py...)
en la raíz del proyecto, y no encuentra la nuestra en Api/main.py. Este archivo solo la expone.
En desarrollo se sigue levantando igual: .venv/bin/fastapi dev Api/main.py
"""

from Api.main import app  # noqa: F401
