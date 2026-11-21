"""Dónde se guardan los archivos subidos (fotos de perfil).

- Con BLOB_READ_WRITE_TOKEN (producción en Vercel): en Vercel Blob. El disco de Vercel no
  persiste entre ejecuciones, así que ahí no se puede guardar nada.
- Sin token (desarrollo local): en la carpeta `media_dir`, servida por la API en /media.

En la base se guarda la URL que devuelve `guardar`: absoluta en Blob ("https://...") o
relativa en disco ("/media/fotos/..."). El front ya sabe mostrar las dos.
"""

import secrets
from pathlib import Path

import httpx

from Api.config import settings

# API REST que usa el SDK oficial @vercel/blob (no hay SDK de Python).
_BLOB_API = "https://vercel.com/api/blob"
_BLOB_API_VERSION = "13"

_TIPOS = {"jpg": "image/jpeg", "png": "image/png", "webp": "image/webp"}


class ErrorAlmacenamiento(Exception):
    pass


def usa_blob() -> bool:
    return bool(settings.blob_read_write_token)


def _headers_blob() -> dict[str, str]:
    token = settings.blob_read_write_token
    # El id del store es la 4.ª parte del token: vercel_blob_rw_<storeId>_<secreto>
    partes = token.split("_")
    store_id = partes[3] if len(partes) > 3 else ""
    return {
        "authorization": f"Bearer {token}",
        "x-api-version": _BLOB_API_VERSION,
        "x-vercel-blob-store-id": store_id.removeprefix("store_"),
    }


def guardar(carpeta: str, prefijo: str, extension: str, datos: bytes) -> str:
    """Guarda el archivo con un nombre aleatorio y devuelve su URL."""
    # Nombre nuevo en cada subida: no se puede adivinar y el navegador no muestra la versión vieja desde la caché.
    nombre = f"{prefijo}-{secrets.token_urlsafe(12)}.{extension}"

    if not usa_blob():
        destino = Path(settings.media_dir) / carpeta
        try:
            destino.mkdir(parents=True, exist_ok=True)
            (destino / nombre).write_bytes(datos)
        except OSError as e:
            raise ErrorAlmacenamiento("No se pudo guardar el archivo") from e
        return f"/media/{carpeta}/{nombre}"

    try:
        r = httpx.put(
            f"{_BLOB_API}/",
            params={"pathname": f"{carpeta}/{nombre}"},
            content=datos,
            headers={
                **_headers_blob(),
                "x-vercel-blob-access": "public",
                "x-content-type": _TIPOS.get(extension, "application/octet-stream"),
                "x-add-random-suffix": "0",
                "x-cache-control-max-age": str(60 * 60 * 24 * 365),  # el nombre nunca se reutiliza
            },
            timeout=30,
        )
        r.raise_for_status()
        return r.json()["url"]
    except (httpx.HTTPError, KeyError, ValueError) as e:
        raise ErrorAlmacenamiento("No se pudo guardar el archivo") from e


def borrar(url: str | None, carpeta: str) -> None:
    """Borra un archivo guardado antes con `guardar`. Si falla, no interrumpe la operación."""
    if not url:
        return

    prefijo_local = f"/media/{carpeta}/"
    if url.startswith(prefijo_local):
        nombre = Path(url.removeprefix(prefijo_local)).name  # .name evita rutas tipo ../
        (Path(settings.media_dir) / carpeta / nombre).unlink(missing_ok=True)
        return

    # Solo se borran archivos de nuestro Blob (nunca una URL externa cualquiera).
    if usa_blob() and ".blob.vercel-storage.com/" in url:
        try:
            httpx.post(
                f"{_BLOB_API}/delete",
                json={"urls": [url]},
                headers=_headers_blob(),
                timeout=15,
            ).raise_for_status()
        except httpx.HTTPError:
            pass  # queda un archivo huérfano en Blob; no vale la pena hacer fallar el pedido
