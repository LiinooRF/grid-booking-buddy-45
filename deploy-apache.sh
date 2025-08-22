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

echo "==> Compilando (build)"
$PM run build

echo "==> Copiando archivos compilados a Apache"
rm -rf "$APACHE_DIR/reservas" "$APACHE_DIR/eventos" 2>/dev/null || true
cp -r "$REPO_DIR/dist" "$APACHE_DIR/reservas"
cp -r "$REPO_DIR/dist" "$APACHE_DIR/eventos"

echo "==> Configurando Apache para SPA"
cat > "$APACHE_DIR/.htaccess" << 'EOF'
RewriteEngine On

# Handle /reservas route
RewriteCond %{REQUEST_URI} ^/reservas/(.*)$
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^reservas/(.*)$ /reservas/index.html [L]

# Handle /eventos route  
RewriteCond %{REQUEST_URI} ^/eventos/(.*)$
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^eventos/(.*)$ /eventos/index.html [L]

# Set correct MIME types
AddType application/javascript .js
AddType application/javascript .mjs
AddType text/css .css
EOF

echo "==> Reiniciando Apache"
systemctl reload apache2 || service apache2 reload

echo "==> ✅ Listo! Tu web está disponible en:"
echo "    http://173.212.212.147/reservas/"
echo "    http://173.212.212.147/eventos/"