"""Crea el primer administrador (la API solo deja crear usuarios a un admin).

Uso, desde back/ (con la base levantada y migrada):
    ./db.sh up
    .venv/bin/alembic upgrade head
    .venv/bin/python crear_admin.py
"""

from getpass import getpass

from sqlalchemy import select

import Database.models  # noqa: F401
from Api.security import hashear_contrasena
from Database.models import Rol, Usuario
from Database.session import SessionLocal


def main() -> None:
    nombre_usuario = input("Nombre de usuario: ").strip()
    nombre_completo = input("Nombre completo: ").strip()
    email = input("Email: ").strip().lower()
    contrasena = getpass("Contraseña (mín. 8): ")
    if len(contrasena) < 8 or contrasena != getpass("Repetir contraseña: "):
        raise SystemExit("La contraseña es muy corta o no coincide.")

    with SessionLocal() as db:
        if db.scalar(select(Usuario.id).where(Usuario.nombre_usuario == nombre_usuario)):
            raise SystemExit("Ese nombre de usuario ya existe.")
        if db.scalar(select(Usuario.id).where(Usuario.email == email)):
            raise SystemExit("Ese email ya está registrado.")
        db.add(Usuario(
            nombre_usuario=nombre_usuario,
            nombre_completo=nombre_completo,
            email=email,
            rol=Rol.ADMIN,
            contrasena_hash=hashear_contrasena(contrasena),
        ))
        db.commit()
    print(f"Administrador '{nombre_usuario}' creado.")


if __name__ == "__main__":
    main()
