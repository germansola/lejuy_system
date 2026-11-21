#!/usr/bin/env bash
# PostgreSQL local para desarrollo, en un contenedor de Podman.
#
#   ./db.sh up      crea (la primera vez) y arranca el contenedor
#   ./db.sh down    lo detiene (los datos se conservan en el volumen)
#   ./db.sh psql    abre una consola SQL
#   ./db.sh logs    muestra los logs
#
# Usuario, contraseña y base se leen de back/.env (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB).
set -euo pipefail
cd "$(dirname "$0")"

CONTAINER=lejuy-postgres
VOLUME=lejuy-pgdata
IMAGE=docker.io/library/postgres:17

[ -f .env ] || { echo "Falta back/.env (copiá .env.example)"; exit 1; }
# Lee solo las variables POSTGRES_* del .env.
eval "$(grep -E '^POSTGRES_(USER|PASSWORD|DB|PORT)=' .env | sed 's/^/export /')"
: "${POSTGRES_USER:?Falta POSTGRES_USER en .env}"
: "${POSTGRES_PASSWORD:?Falta POSTGRES_PASSWORD en .env}"
: "${POSTGRES_DB:?Falta POSTGRES_DB en .env}"
PORT="${POSTGRES_PORT:-5432}"

case "${1:-up}" in
  up)
    if podman container exists "$CONTAINER"; then
      podman start "$CONTAINER" >/dev/null
    else
      podman run -d --name "$CONTAINER" \
        -e POSTGRES_USER="$POSTGRES_USER" \
        -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
        -e POSTGRES_DB="$POSTGRES_DB" \
        -v "$VOLUME":/var/lib/postgresql/data \
        -p "127.0.0.1:$PORT:5432" \
        "$IMAGE" >/dev/null
    fi
    printf "Esperando a PostgreSQL"
    until podman exec "$CONTAINER" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q; do
      printf "."; sleep 1
    done
    echo " listo en 127.0.0.1:$PORT"
    ;;
  down) podman stop "$CONTAINER" >/dev/null && echo "Detenido." ;;
  psql) podman exec -it "$CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" ;;
  logs) podman logs -f "$CONTAINER" ;;
  *) echo "Uso: $0 {up|down|psql|logs}"; exit 1 ;;
esac
