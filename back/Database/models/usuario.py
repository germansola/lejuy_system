import enum

from sqlalchemy import Boolean, Enum, Integer, String, true
from sqlalchemy.orm import Mapped, mapped_column

from Database.base import Base, TimestampMixin


class Rol(str, enum.Enum):
    # Mismos valores que `Role` en Front/app/components/Dashboard/data.ts
    ADMIN = "admin"
    # Valor sin "ñ" para usarlo cómodo en URLs (?rol=dueno); el front lo muestra como "Dueño".
    DUENO = "dueno"
    ENCARGADO = "encargado"
    SECRETARIA = "secretaria"


class Usuario(TimestampMixin, Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre_usuario: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    # Nunca se guarda la contraseña en texto plano: solo su hash (bcrypt/argon2).
    contrasena_hash: Mapped[str] = mapped_column(String(255))
    nombre_completo: Mapped[str] = mapped_column(String(120))
    rol: Mapped[Rol] = mapped_column(
        Enum(Rol, name="rol_usuario", values_callable=lambda e: [m.value for m in e])
    )
    # URL o ruta del archivo; la imagen en sí va a un storage, no a la base.
    foto_perfil: Mapped[str | None] = mapped_column(String(500))
    telefono: Mapped[str | None] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, server_default=true())
    # Viaja dentro del token. Al cambiar la contraseña se incrementa y todos los tokens
    # emitidos antes dejan de valer (se cierran las sesiones abiertas en otros dispositivos).
    version_sesion: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    def __repr__(self) -> str:
        return f"<Usuario {self.nombre_usuario} ({self.rol.value})>"
