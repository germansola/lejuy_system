from datetime import datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field, StringConstraints

from Database.models import Rol

NombreUsuario = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$"),
]
NombreCompleto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Contrasena = Annotated[str, Field(min_length=8, max_length=128)]
# En minúscula para que el login no dependa de mayúsculas.
Email = Annotated[EmailStr, AfterValidator(str.lower)]


class UsuarioCrear(BaseModel):
    nombre_usuario: NombreUsuario
    contrasena: Contrasena
    nombre_completo: NombreCompleto
    rol: Rol
    email: Email
    telefono: Annotated[str, StringConstraints(max_length=30)] | None = None
    foto_perfil: Annotated[str, StringConstraints(max_length=500)] | None = None


class UsuarioLeer(BaseModel):
    """Lo que la API devuelve: nunca incluye la contraseña ni su hash."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre_usuario: str
    nombre_completo: str
    rol: Rol
    email: str
    telefono: str | None
    foto_perfil: str | None
    activo: bool
    creado_en: datetime


class UsuarioResumen(BaseModel):
    """Fila de la lista "Usuarios y roles" (solo admin)."""

    model_config = ConfigDict(from_attributes=True)

    id: int  # para identificar al usuario en otras acciones (activar/desactivar)
    nombre_completo: str
    email: str
    email: str  # se muestra en la tabla y el buscador filtra por nombre o email
    rol: Rol
    creado_en: datetime
    activo: bool


class CambiarContrasena(BaseModel):
    contrasena_actual: str
    contrasena_nueva: Contrasena


class CambiarNombreUsuario(BaseModel):
    nombre_usuario: NombreUsuario


class CambiarNombre(BaseModel):
    nombre_completo: NombreCompleto


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
