from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from Api.schemas import Token, UsuarioLeer
from Api.security import DB, UsuarioActual, crear_token, verificar_contrasena
from Database.models import Usuario

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DB):
    # El estándar OAuth2 llama "username" al campo; acá el front manda el email.
    email = form.username.strip().lower()
    usuario = db.scalar(select(Usuario).where(Usuario.email == email))
    if usuario is None or not usuario.activo or not verificar_contrasena(form.password, usuario.contrasena_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email o contraseña incorrectos")
    return Token(access_token=crear_token(usuario))


@router.get("/me", response_model=UsuarioLeer)
def quien_soy(usuario: UsuarioActual):
    return usuario
