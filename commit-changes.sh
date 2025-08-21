#!/bin/bash

# Script para hacer commit automático
# Uso: bash commit-changes.sh "mensaje del commit"

cd /var/www/reservas

echo "🔍 Verificando estado del repositorio..."
git status

echo "📝 Agregando cambios..."
git add .

# Usar el mensaje proporcionado o uno por defecto
COMMIT_MSG="${1:-Actualización automática - $(date +'%Y-%m-%d %H:%M:%S')}"

echo "💾 Haciendo commit..."
git commit -m "$COMMIT_MSG"

echo "⬆️ Subiendo cambios..."
git push origin main

echo "✅ Commit completado: $COMMIT_MSG"