from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from Api.schemas import TareaCambiarEstado, TareaCrear, TareaLeer
from Api.security import DB, AdminODueno, UsuarioActual
from Database.models import CategoriaTarea, EstadoTarea, Rol, Tarea, Usuario

router = APIRouter(prefix="/tareas", tags=["tareas"])

# Mismo criterio que CAN_MANAGE_TASKS en el front: ven y mueven todas, asignan a otros y eliminan.
# El resto de los roles (encargado, secretaria) solo ve y mueve las tareas que tiene asignadas.
ROLES_GESTION = (Rol.ADMIN, Rol.DUENO)


def _ve_todas(usuario: Usuario) -> bool:
    return usuario.rol in ROLES_GESTION


def _buscar_tarea(db: DB, tarea_id: int, usuario: Usuario) -> Tarea:
    tarea = db.get(Tarea, tarea_id)
    # Una tarea ajena se responde igual que una inexistente, para no revelar que existe.
    if tarea is None or (not _ve_todas(usuario) and tarea.asignado_a_id != usuario.id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tarea no encontrada")
    return tarea


@router.get("", response_model=list[TareaLeer])
def listar_tareas(
    db: DB,
    usuario: UsuarioActual,
    estado: EstadoTarea | None = None,
    categoria: CategoriaTarea | None = None,
    asignado_a_id: int | None = None,
):
    """Tareas del board: admin y dueño ven todas; el resto, solo las suyas.

    Filtros opcionales: ?estado=, ?categoria=, ?asignado_a_id= (este último solo cambia algo para admin y dueño).
    """
    consulta = select(Tarea).order_by(Tarea.id)
    if not _ve_todas(usuario):
        consulta = consulta.where(Tarea.asignado_a_id == usuario.id)
    if estado is not None:
        consulta = consulta.where(Tarea.estado == estado)
    if categoria is not None:
        consulta = consulta.where(Tarea.categoria == categoria)
    if asignado_a_id is not None:
        consulta = consulta.where(Tarea.asignado_a_id == asignado_a_id)
    return db.scalars(consulta).all()


@router.get("/{tarea_id}", response_model=TareaLeer)
def ver_tarea(tarea_id: int, db: DB, usuario: UsuarioActual):
    return _buscar_tarea(db, tarea_id, usuario)


@router.post("", response_model=TareaLeer, status_code=status.HTTP_201_CREATED)
def crear_tarea(datos: TareaCrear, db: DB, usuario: UsuarioActual):
    asignado_a_id = datos.asignado_a_id or usuario.id
    if asignado_a_id != usuario.id:
        if not _ve_todas(usuario):
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "Solo un administrador o el dueño pueden asignar tareas a otra persona"
            )
        asignado = db.get(Usuario, asignado_a_id)
        if asignado is None or not asignado.activo:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "El usuario asignado no existe o está desactivado")

    tarea = Tarea(
        **datos.model_dump(exclude={"asignado_a_id"}),
        asignado_a_id=asignado_a_id,
        creado_por_id=usuario.id,
    )
    db.add(tarea)
    db.commit()
    db.refresh(tarea)
    return tarea


@router.patch("/{tarea_id}/estado", response_model=TareaLeer)
def cambiar_estado(tarea_id: int, datos: TareaCambiarEstado, db: DB, usuario: UsuarioActual):
    """Mover la tarea de columna en el board (arrastrar y soltar). Encargado y secretaria, solo las suyas."""
    tarea = _buscar_tarea(db, tarea_id, usuario)
    tarea.estado = datos.estado
    db.commit()
    db.refresh(tarea)
    return tarea


@router.delete("/{tarea_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_tarea(tarea_id: int, db: DB, usuario: AdminODueno):
    tarea = _buscar_tarea(db, tarea_id, usuario)
    db.delete(tarea)
    db.commit()
