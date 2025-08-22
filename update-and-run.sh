#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/var/www/reservas"
BRANCH="main"
PORT="${PORT:-4173}"
HOST="${HOST:-0.0.0.0}"
LOG_FILE="/var/log/reservas-preview.log"

echo "==> Actualizando repo (SE DESCARTAN cambios locales)"
cd "$REPO_DIR"

git merge --abort 2>/dev/null || true
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
git clean -fd

# Elegir gestor de paquetes
if command -v pnpm >/dev/null 2>&1; then
  PM=pnpm
elif command -v yarn >/dev/null 2>&1; then
  PM=yarn
else
  PM=npm
fi

echo "==> Instalando dependencias con $PM"
if [ "$PM" = "npm" ]; then
  npm ci || npm install
else
  $PM install
fi

echo "==> Compilando (build)"
$PM run build

echo "==> Cerrando procesos en el puerto $PORT si existen"
if command -v lsof >/dev/null 2>&1; then
  lsof -ti tcp:"$PORT" | xargs -r kill -9 || true
fi

echo "==> Iniciando Vite Preview en segundo plano: http://$(hostname -I | awk '{print $1}'):$PORT"
PREVIEW_CMD=""
if [ "$PM" = "pnpm" ]; then
  PREVIEW_CMD="pnpm exec vite preview --host \"$HOST\" --port \"$PORT\""
elif [ "$PM" = "yarn" ]; then
  PREVIEW_CMD="yarn vite preview --host \"$HOST\" --port \"$PORT\""
else
  PREVIEW_CMD="npx vite preview --host \"$HOST\" --port \"$PORT\""
fi

nohup bash -lc "$PREVIEW_CMD" > "$LOG_FILE" 2>&1 &

PID=$!
echo "==> PID: $PID"
echo "==> Logs: tail -f $LOG_FILE"
echo "==> URL: http://$HOST:$PORT"