#!/bin/bash

# Script de actualización automática para Gaming Grid
# Uso: bash update-server.sh

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_DIR="/var/www/reservas"
BACKUP_DIR="/var/www/reservas-backup-$(date +%Y%m%d_%H%M%S)"
SERVICE_NAME="gaming-grid" # Cambia esto por el nombre de tu servicio PM2 si usas PM2

echo -e "${BLUE}🚀 Iniciando actualización de Gaming Grid...${NC}"

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que el directorio existe
if [ ! -d "$PROJECT_DIR" ]; then
    error "El directorio $PROJECT_DIR no existe"
    exit 1
fi

# Cambiar al directorio del proyecto
cd "$PROJECT_DIR" || exit 1

log "📁 Directorio actual: $(pwd)"

# Verificar que es un repositorio git
if [ ! -d ".git" ]; then
    error "Este no es un repositorio git. Inicializa git primero."
    exit 1
fi

# Crear backup
log "💾 Creando backup en $BACKUP_DIR"
cp -r "$PROJECT_DIR" "$BACKUP_DIR"

# Verificar el estado del repositorio
log "📊 Verificando estado del repositorio..."
git status

# Guardar cambios locales si existen
if ! git diff-index --quiet HEAD --; then
    warning "Hay cambios locales. Guardándolos..."
    git stash push -m "Auto-stash antes de actualización $(date)"
fi

# Hacer pull de los cambios
log "⬇️ Obteniendo últimos cambios..."
if git pull origin main; then
    log "✅ Cambios obtenidos exitosamente"
else
    error "❌ Error al obtener cambios"
    log "🔄 Restaurando backup..."
    rm -rf "$PROJECT_DIR"
    mv "$BACKUP_DIR" "$PROJECT_DIR"
    exit 1
fi

# Verificar si package.json cambió
if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
    log "📦 package.json cambió, instalando dependencias..."
    if command -v npm &> /dev/null; then
        npm install
    elif command -v yarn &> /dev/null; then
        yarn install
    else
        warning "No se encontró npm ni yarn"
    fi
fi

# Construir el proyecto
log "🔨 Construyendo el proyecto..."
if command -v npm &> /dev/null; then
    npm run build
elif command -v yarn &> /dev/null; then
    yarn build
else
    warning "No se pudo construir el proyecto - npm/yarn no encontrado"
fi

# Reiniciar servicios (ajusta según tu configuración)
log "🔄 Reiniciando servicios..."

# Si usas PM2
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "$SERVICE_NAME"; then
        log "Reiniciando PM2..."
        pm2 restart "$SERVICE_NAME"
    fi
fi

# Si usas systemd
if systemctl is-active --quiet nginx; then
    log "Reiniciando Nginx..."
    sudo systemctl reload nginx
fi

# Limpiar backup antiguo si todo salió bien
log "🧹 Limpiando backup temporal..."
rm -rf "$BACKUP_DIR"

# Mostrar información final
log "📊 Estado final del repositorio:"
git log --oneline -5

echo -e "${GREEN}"
echo "=================================="
echo "✅ ACTUALIZACIÓN COMPLETADA"
echo "=================================="
echo -e "${NC}"
log "🌐 Tu sitio está actualizado en: http://tu-servidor.com/reservas"
log "📝 Revisa los logs si hay algún problema"

# Opcional: Mostrar el estado del sitio
echo -e "${BLUE}🔍 Verificando que el sitio esté funcionando...${NC}"
if command -v curl &> /dev/null; then
    if curl -s -o /dev/null -w "%{http_code}" http://localhost/reservas | grep -q "200"; then
        log "✅ Sitio funcionando correctamente"
    else
        warning "⚠️ El sitio podría tener problemas, revisa manualmente"
    fi
fi

echo -e "${GREEN}🎉 ¡Actualización terminada!${NC}"