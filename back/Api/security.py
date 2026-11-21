from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from Api.config import settings
from Database.models import Rol, Usuario
from Database.session import get_db

ALGORITHM = "HS256"

password_hash = PasswordHash.recommended()  # Argon2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hashear_contrasena(contrasena: str) -> str:
    return password_hash.hash(contrasena)


def verificar_contrasena(contrasena: str, hash_guardado: str) -> bool:
    return password_hash.verify(contrasena, hash_guardado)


def crear_token(usuario: Usuario) -> str:
    expira = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    # `sub` es el id (no el nombre de usuario) para que el token siga valiendo si lo cambia.
    payload = {"sub": str(usuario.id), "exp": expira}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def get_usuario_actual(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> Usuario:
    no_autorizado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        usuario_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise no_autorizado

    usuario = db.get(Usuario, usuario_id)
    if usuario is None or not usuario.activo:
        raise no_autorizado
    return usuario


def requiere_admin_o_dueno(usuario: Annotated[Usuario, Depends(get_usuario_actual)]) -> Usuario:
    if usuario.rol not in (Rol.ADMIN, Rol.DUENO):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Solo un administrador o el dueño pueden hacer esto")
    return usuario


def requiere_admin(usuario: Annotated[Usuario, Depends(get_usuario_actual)]) -> Usuario:
    if usuario.rol != Rol.ADMIN:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Solo un administrador puede hacer esto")
    return usuario


UsuarioActual = Annotated[Usuario, Depends(get_usuario_actual)]
Admin = Annotated[Usuario, Depends(requiere_admin)]
AdminODueno = Annotated[Usuario, Depends(requiere_admin_o_dueno)]
DB = Annotated[Session, Depends(get_db)]
