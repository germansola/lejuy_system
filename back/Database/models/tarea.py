import enum
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from Database.base import Base, TimestampMixin
from Database.models.usuario import Usuario


# Mismos valores que `Status`, `Category` y `Priority` en Front/app/components/Dashboard/data.ts


class EstadoTarea(str, enum.Enum):
    POR_HACER = "todo"
    EN_CURSO = "doing"
    FINALIZADA = "done"


class CategoriaTarea(str, enum.Enum):
    CAMPO = "Campo"
    COSECHA = "Cosecha"
    VENTAS = "Ventas"
    LOGISTICA = "Logística"
    STOCK = "Stock"
    OTRO = "Otro"


class PrioridadTarea(str, enum.Enum):
    ALTA = "Alta"
    MEDIA = "Media"
    BAJA = "Baja"


def _valores(e: type[enum.Enum]) -> list[str]:
    return [m.value for m in e]


class Tarea(TimestampMixin, Base):
    __tablename__ = "tareas"

    id: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(200))
    descripcion: Mapped[str] = mapped_column(Text, default="", server_default="")
    categoria: Mapped[CategoriaTarea] = mapped_column(
        Enum(CategoriaTarea, name="categoria_tarea", values_callable=_valores)
    )
    prioridad: Mapped[PrioridadTarea] = mapped_column(
        Enum(PrioridadTarea, name="prioridad_tarea", values_callable=_valores)
    )
    estado: Mapped[EstadoTarea] = mapped_column(
        Enum(EstadoTarea, name="estado_tarea", values_callable=_valores), index=True
    )
    fecha_inicio: Mapped[date] = mapped_column(Date)
    # None = la tarea no vence.
    fecha_vencimiento: Mapped[date | None] = mapped_column(Date)

    # Los usuarios no se borran (se desactivan), así que las tareas nunca quedan huérfanas.
    asignado_a_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), index=True)
    creado_por_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"))

    asignado_a: Mapped[Usuario] = relationship(foreign_keys=[asignado_a_id], lazy="joined")
    creado_por: Mapped[Usuario] = relationship(foreign_keys=[creado_por_id], lazy="joined")

    def __repr__(self) -> str:
        return f"<Tarea {self.id} {self.titulo!r} ({self.estado.value})>"
