hfrom fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from Api.schemas import CambiarContrasena, CambiarNombre, CambiarNombreUsuario, UsuarioCrear, UsuarioLeer, UsuarioResumen
from Api.security import DB, Admin, UsuarioActual, hashear_contrasena, verificar_contrasena
from Database.models import Rol, Usuario

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


def _nombre_usuario_en_uso(db: DB, nombre_usuario: str, excluir_id: int | None = None) -> bool:
    consulta = select(Usuario.id).where(Usuario.nombre_usuario == nombre_usuario)
    if excluir_id is not None:
        consulta = consulta.where(Usuario.id != excluir_id)
    return db.scalar(consulta) is not None


def _guardar(db: DB, usuario: Usuario) -> Usuario:
    """Commit que traduce un choque de unicidad (carrera entre dos requests) a 409."""
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "El nombre de usuario o el email ya están en uso")
    db.refresh(usuario)
    return usuario


# --- Solo admin -------------------------------------------------------------


@router.get("", response_model=list[UsuarioResumen])
def listar_usuarios(db: DB, _admin: Admin, activo: bool | None = None, rol: Rol | None = None):
    """Usuarios y roles: nombre, email, rol y fecha de creación de cada usuario.

    Filtros opcionales: ?activo=true|false y ?rol=admin|dueno|encargado|secretaria
    """
    consulta = select(Usuario).order_by(Usuario.nombre_completo)
    if activo is not None:
        consulta = consulta.where(Usuario.activo == activo)
    if rol is not None:
        consulta = consulta.where(Usuario.rol == rol)
    return db.scalars(consulta).all()


@router.post("", response_model=UsuarioLeer, status_code=status.HTTP_201_CREATED)
def crear_usuario(datos: UsuarioCrear, db: DB, _admin: Admin):
    if _nombre_usuario_en_uso(db, datos.nombre_usuario):
        raise HTTPException(status.HTTP_409_CONFLICT, "Ese nombre de usuario ya existe")
    if db.scalar(select(Usuario.id).where(Usuario.email == datos.email)) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ese email ya está registrado")

    usuario = Usuario(
        **datos.model_dump(exclude={"contrasena"}),
        contrasena_hash=hashear_contrasena(datos.contrasena),
    )
    db.add(usuario)
    return _guardar(db, usuario)


def _buscar_usuario(db: DB, usuario_id: int) -> Usuario:
    usuario = db.get(Usuario, usuario_id)
    if usuario is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
    return usuario


@router.patch("/{usuario_id}/desactivar", response_model=UsuarioLeer)
def desactivar_usuario(usuario_id: int, db: DB, admin: Admin):
    """No borra el registro: el usuario deja de poder loguearse y sus tokens dejan de valer."""
    if usuario_id == admin.id:
        # Evita que el sistema quede sin administradores por error.
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No podés desactivar tu propio usuario")
    usuario = _buscar_usuario(db, usuario_id)
    usuario.activo = False
    return _guardar(db, usuario)


@router.patch("/{usuario_id}/activar", response_model=UsuarioLeer)
def activar_usuario(usuario_id: int, db: DB, _admin: Admin):
    usuario = _buscar_usuario(db, usuario_id)
    usuario.activo = True
    return _guardar(db, usuario)


# --- El propio usuario (cualquier rol) --------------------------------------


@router.patch("/me/contrasena", status_code=status.HTTP_204_NO_CONTENT)
def cambiar_contrasena(datos: CambiarContrasena, db: DB, usuario: UsuarioActual):
    if not verificar_contrasena(datos.contrasena_actual, usuario.contrasena_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "La contraseña actual es incorrecta")
    usuario.contrasena_hash = hashear_contrasena(datos.contrasena_nueva)
    db.commit()


@router.patch("/me/nombre-usuario", response_model=UsuarioLeer)
def cambiar_nombre_usuario(datos: CambiarNombreUsuario, db: DB, usuario: UsuarioActual):
    if _nombre_usuario_en_uso(db, datos.nombre_usuario, excluir_id=usuario.id):
        raise HTTPException(status.HTTP_409_CONFLICT, "Ese nombre de usuario ya existe")
    usuario.nombre_usuario = datos.nombre_usuario
    return _guardar(db, usuario)


@router.patch("/me/nombre", response_model=UsuarioLeer)
def cambiar_nombre(datos: CambiarNombre, db: DB, usuario: UsuarioActual):
    usuario.nombre_completo = datos.nombre_completo
    return _guardar(db, usuario)
