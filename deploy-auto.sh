#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/var/www/reservas"
APACHE_DIR="/var/www/html"
BRANCH="main"

echo "==> Detectando servidor web"
if systemctl is-active --quiet nginx 2>/dev/null; then
    WEB_SERVER="nginx"
    echo "✓ Nginx detectado"
elif systemctl is-active --quiet apache2 2>/dev/null; then
    WEB_SERVER="apache2"
    echo "✓ Apache2 detectado"
elif systemctl is-active --quiet httpd 2>/dev/null; then
    WEB_SERVER="httpd"
    echo "✓ HTTPd detectado"
elif command -v nginx >/dev/null 2>&1; then
    WEB_SERVER="nginx"
    echo "✓ Nginx instalado (pero no corriendo)"
elif command -v apache2 >/dev/null 2>&1; then
    WEB_SERVER="apache2"
    echo "✓ Apache2 instalado (pero no corriendo)"
elif command -v httpd >/dev/null 2>&1; then
    WEB_SERVER="httpd"
    echo "✓ HTTPd instalado (pero no corriendo)"
else
    echo "❌ No se encontró ningún servidor web (nginx/apache2/httpd)"
    echo "Instala uno con: apt install nginx  o  apt install apache2"
    exit 1
fi

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

echo "==> Preparando directorios"
mkdir -p "$APACHE_DIR"

echo "==> Compilando para la raíz (/) - página principal"
$PM run build
echo "==> Copiando build principal a la raíz"
rm -rf "$APACHE_DIR/index.html" "$APACHE_DIR/assets" 2>/dev/null || true
cp -r "$REPO_DIR/dist/." "$APACHE_DIR/"

echo "==> Compilando para /reservas/"
VITE_BASE_PATH="/reservas/" $PM run build
echo "==> Copiando build de reservas"
rm -rf "$APACHE_DIR/reservas" 2>/dev/null || true
mkdir -p "$APACHE_DIR/reservas"
cp -r "$REPO_DIR/dist/." "$APACHE_DIR/reservas"

echo "==> Compilando para /eventos/"
VITE_BASE_PATH="/eventos/" $PM run build
echo "==> Copiando build de eventos"
rm -rf "$APACHE_DIR/eventos" 2>/dev/null || true
mkdir -p "$APACHE_DIR/eventos"
cp -r "$REPO_DIR/dist/." "$APACHE_DIR/eventos"

if [ "$WEB_SERVER" = "nginx" ]; then
    echo "==> Configurando Nginx"
    cat > /etc/nginx/sites-available/gaming-grid << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    # Handle root route (/) - main page
    location / {
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|mjs)$ {
            add_header Content-Type application/javascript;
            expires 1y;
        }
        
        location ~* \.(css)$ {
            add_header Content-Type text/css;
            expires 1y;
        }
    }

    # Handle /reservas route
    location /reservas {
        try_files $uri $uri/ /reservas/index.html;
        
        location ~* \.(js|mjs)$ {
            add_header Content-Type application/javascript;
            expires 1y;
        }
        
        location ~* \.(css)$ {
            add_header Content-Type text/css;
            expires 1y;
        }
    }

    # Handle /eventos route
    location /eventos {
        try_files $uri $uri/ /eventos/index.html;
        
        location ~* \.(js|mjs)$ {
            add_header Content-Type application/javascript;
            expires 1y;
        }
        
        location ~* \.(css)$ {
            add_header Content-Type text/css;
            expires 1y;
        }
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "DENY";
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript image/png image/jpg image/jpeg;
}
EOF

    ln -sf /etc/nginx/sites-available/gaming-grid /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    
else
    # Apache/HTTPd configuration
    echo "==> Habilitando módulos Apache"
    if [ "$WEB_SERVER" = "apache2" ]; then
        a2enmod rewrite mime headers >/dev/null 2>&1 || true
    fi
    
    echo "==> Configurando Apache (.htaccess)"
    cat > "$APACHE_DIR/.htaccess" << 'EOF'
RewriteEngine On

# Serve actual files if they exist
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# SPA routing for root (/) - main page
RewriteCond %{REQUEST_URI} ^/$
RewriteRule ^(.*)$ /index.html [L]

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
EOF

    echo "==> Reiniciando $WEB_SERVER"
    systemctl reload "$WEB_SERVER" || service "$WEB_SERVER" reload || systemctl restart "$WEB_SERVER"
fi

echo "==> Estableciendo permisos correctos"
chown -R www-data:www-data "$APACHE_DIR" 2>/dev/null || \
chown -R apache:apache "$APACHE_DIR" 2>/dev/null || \
chown -R nginx:nginx "$APACHE_DIR" 2>/dev/null || true

chmod -R 755 "$APACHE_DIR" 2>/dev/null || true

echo "==> ✅ Deploy completado! URLs disponibles:"
echo "    http://173.212.212.147/ (página principal)"
echo "    http://173.212.212.147/reservas/"
echo "    http://173.212.212.147/eventos/"
echo ""
echo "==> Verificando archivos compilados:"
ls -la "$APACHE_DIR/" | head -5 2>/dev/null || echo "ERROR: No se encontró el directorio principal"
ls -la "$APACHE_DIR/reservas/" 2>/dev/null || echo "ERROR: No se encontró el directorio reservas"
ls -la "$APACHE_DIR/eventos/" 2>/dev/null || echo "ERROR: No se encontró el directorio eventos"
echo ""
echo "==> Estado del servidor web:"
systemctl status "$WEB_SERVER" --no-pager -l || true