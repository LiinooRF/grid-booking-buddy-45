#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/var/www/reservas"
APACHE_DIR="/var/www/html"
BRANCH="main"

echo "==> Actualizando repo y resolviendo conflictos"
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

# Habilitar módulos Apache necesarios
echo "==> Habilitando módulos Apache"
a2enmod rewrite mime headers >/dev/null 2>&1 || true

echo "==> Preparando directorios en Apache"
mkdir -p "$APACHE_DIR"

echo "==> Compilando para /reservas/ con base correcta"
VITE_BASE_PATH="/reservas/" $PM run build
echo "==> Copiando build de reservas"
rm -rf "$APACHE_DIR/reservas" 2>/dev/null || true
mkdir -p "$APACHE_DIR/reservas"
cp -r "$REPO_DIR/dist/." "$APACHE_DIR/reservas"

echo "==> Compilando para /eventos/ con base correcta"
VITE_BASE_PATH="/eventos/" $PM run build  
echo "==> Copiando build de eventos"
rm -rf "$APACHE_DIR/eventos" 2>/dev/null || true
mkdir -p "$APACHE_DIR/eventos"
cp -r "$REPO_DIR/dist/." "$APACHE_DIR/eventos"

echo "==> Configurando Apache (.htaccess)"
cat > "$APACHE_DIR/.htaccess" << 'EOF'
RewriteEngine On

# First, serve actual files if they exist
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# SPA routing for /reservas
RewriteCond %{REQUEST_URI} ^/reservas
RewriteRule ^reservas(/.*)?$ /reservas/index.html [L]

# SPA routing for /eventos  
RewriteCond %{REQUEST_URI} ^/eventos
RewriteRule ^eventos(/.*)?$ /eventos/index.html [L]

# MIME types
AddType application/javascript .js
AddType application/javascript .mjs
AddType text/css .css
AddType application/wasm .wasm

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>
EOF

echo "==> Estableciendo permisos correctos"
chown -R www-data:www-data "$APACHE_DIR/reservas" "$APACHE_DIR/eventos" 2>/dev/null || true
chmod -R 755 "$APACHE_DIR/reservas" "$APACHE_DIR/eventos" 2>/dev/null || true

echo "==> Reiniciando Apache"
systemctl reload apache2 || service apache2 reload

echo "==> ✅ Deploy completado! URLs disponibles:"
echo "    http://173.212.212.147/reservas/"
echo "    http://173.212.212.147/eventos/"
echo ""
echo "==> Verificando archivos compilados:"
ls -la "$APACHE_DIR/reservas/" 2>/dev/null || echo "ERROR: No se encontró el directorio reservas"
echo ""
echo "==> Si sigue sin funcionar, prueba:"
echo "    1. Ctrl+F5 para forzar recarga sin caché"
echo "    2. Verificar que Apache esté corriendo: systemctl status apache2"