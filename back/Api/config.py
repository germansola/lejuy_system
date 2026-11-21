import secrets
import warnings

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Se lee de variables de entorno o de back/.env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./lejuy.db"
    secret_key: str = ""
    access_token_minutes: int = 60 * 8
    # Orígenes del front que pueden llamar a la API. En .env: CORS_ORIGINS=["https://..."]
    cors_origins: list[str] = ["http://localhost:3000"]
    # Carpeta donde se guardan los archivos subidos (fotos de perfil). Se sirve en /media.
    media_dir: str = "media"


settings = Settings()

if not settings.secret_key:
    # Sin SECRET_KEY fija, los tokens dejan de valer cada vez que se reinicia el servidor.
    warnings.warn("SECRET_KEY no está definida: se usa una temporal (solo para desarrollo).")
    settings.secret_key = secrets.token_urlsafe(32)
