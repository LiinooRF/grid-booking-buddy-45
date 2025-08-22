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

echo "==> Compilando para /reservas/"
VITE_BASE_PATH="/reservas/" $PM run build
echo "==> Copiando build de reservas"
rm -rf "$APACHE_DIR/reservas" 2>/dev/null || true
cp -r "$REPO_DIR/dist" "$APACHE_DIR/reservas"

echo "==> Compilando para /eventos/"
VITE_BASE_PATH="/eventos/" $PM run build
echo "==> Copiando build de eventos"
rm -rf "$APACHE_DIR/eventos" 2>/dev/null || true
cp -r "$REPO_DIR/dist" "$APACHE_DIR/eventos"

echo "==> Configurando Apache para SPA y MIME"
# Habilitar módulos necesarios (ignorar si ya están habilitados)
a2enmod rewrite mime headers >/dev/null 2>&1 || true

cat > "$APACHE_DIR/.htaccess" << 'EOF'
RewriteEngine On

# Servir archivos reales sin reescritura
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule - [L]

# SPA routing para /reservas
RewriteCond %{REQUEST_URI} ^/reservas/(.*)$
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^reservas/(.*)$ /reservas/index.html [L]

# SPA routing para /eventos
RewriteCond %{REQUEST_URI} ^/eventos/(.*)$
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^eventos/(.*)$ /eventos/index.html [L]

# Tipos MIME correctos
AddType application/javascript .js .mjs
AddType text/css .css
AddType application/wasm .wasm

# Seguridad básica
<IfModule mod_headers.c>
Header set X-Content-Type-Options "nosniff"
</IfModule>

DirectoryIndex index.html
EOF

echo "==> Reiniciando Apache"
systemctl reload apache2 || service apache2 reload

echo "==> ✅ Listo! Tu web está disponible en:"
echo "    http://173.212.212.147/reservas/"
echo "    http://173.212.212.147/eventos/"