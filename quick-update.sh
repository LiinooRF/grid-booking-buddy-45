#!/bin/bash

# Script rápido de actualización (versión simple)
# Para uso diario rápido

cd /var/www/reservas
echo "🔄 Actualizando Gaming Grid..."

# Pull cambios
git pull origin main

# Build si es necesario
if [ -f "package.json" ]; then
    npm run build 2>/dev/null || echo "Build skipped"
fi

# Restart nginx
sudo systemctl reload nginx 2>/dev/null || echo "Nginx reload skipped"

echo "✅ Actualización completada"