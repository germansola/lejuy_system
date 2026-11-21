from datetime import date, datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field, StringConstraints, model_validator

from Database.models import CategoriaTarea, EstadoTarea, PrioridadTarea, Rol

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


class UsuarioAsignable(BaseModel):
    """Opción del desplegable "Asignar a" al crear una tarea (admin y dueño).

    Solo lo necesario para elegir a alguien: sin email ni otros datos personales.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre_completo: str
    rol: Rol


class UsuarioResumen(BaseModel):
    """Fila de la lista "Usuarios y roles" (solo admin)."""

    model_config = ConfigDict(from_attributes=True)

    id: int  # para identificar al usuario en otras acciones (activar/desactivar)
    nombre_completo: str
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


class CambiarEmail(BaseModel):
    # Con el email se inicia sesión: se pide la contraseña para que nadie lo cambie
    # desde una sesión que quedó abierta.
    email: Email
    contrasena_actual: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Tareas -----------------------------------------------------------------

Titulo = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
Descripcion = Annotated[str, StringConstraints(strip_whitespace=True, max_length=5000)]


class TareaCrear(BaseModel):
    titulo: Titulo
    descripcion: Descripcion = ""
    categoria: CategoriaTarea
    prioridad: PrioridadTarea = PrioridadTarea.MEDIA
    estado: EstadoTarea = EstadoTarea.POR_HACER  # columna del board donde se creó
    fecha_inicio: date
    fecha_vencimiento: date | None = None
    # Sin valor = se la asigna quien la crea. Solo admin y dueño pueden asignar a otra persona.
    asignado_a_id: int | None = None

    @model_validator(mode="after")
    def _vencimiento_no_anterior(self):
        if self.fecha_vencimiento is not None and self.fecha_vencimiento < self.fecha_inicio:
            raise ValueError("La fecha de vencimiento no puede ser anterior a la de inicio")
        return self


class TareaCambiarEstado(BaseModel):
    estado: EstadoTarea


class TareaLeer(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    descripcion: str
    categoria: CategoriaTarea
    prioridad: PrioridadTarea
    estado: EstadoTarea
    fecha_inicio: date
    fecha_vencimiento: date | None
    asignado_a: UsuarioAsignable
    creado_por: UsuarioAsignable
    creado_en: datetime
    actualizado_en: datetime
