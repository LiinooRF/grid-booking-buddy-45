#!/bin/bash

# Script para configurar Apache para Single Page Applications (React)
# Uso: sudo ./setup-apache-spa.sh [ruta_del_proyecto]

PROJECT_PATH=${1:-"/var/www/html"}  # Ruta por defecto

echo "Configurando Apache para SPA..."
echo "Ruta del proyecto: $PROJECT_PATH"

# Habilitar mod_rewrite si no está habilitado
a2enmod rewrite

# Crear archivo .htaccess en la raíz del proyecto
cat > "$PROJECT_PATH/.htaccess" << EOF
# Configuración para Single Page Applications (React)
Options -MultiViews
RewriteEngine On

# Manejar rutas de Angular/React/Vue
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]

# Optimización para archivos estáticos
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
EOF

# Configurar permisos
chmod 644 "$PROJECT_PATH/.htaccess"

# Verificar que AllowOverride esté habilitado
echo "Verificando configuración de Apache..."

# Crear configuración del sitio si no existe
SITE_CONFIG="/etc/apache2/sites-available/000-default.conf"
if [ -f "$SITE_CONFIG" ]; then
    # Verificar si AllowOverride ya está configurado
    if ! grep -q "AllowOverride All" "$SITE_CONFIG"; then
        echo "Configurando AllowOverride All..."
        
        # Backup del archivo original
        cp "$SITE_CONFIG" "$SITE_CONFIG.backup"
        
        # Añadir configuración AllowOverride
        sed -i "/<\/VirtualHost>/i\\
<Directory \"$PROJECT_PATH\">\\
    AllowOverride All\\
    Require all granted\\
</Directory>" "$SITE_CONFIG"
    fi
fi

# Verificar configuración de Apache
apache2ctl configtest

if [ $? -eq 0 ]; then
    echo "✅ Configuración de Apache válida"
    
    # Reiniciar Apache
    systemctl reload apache2
    
    echo "✅ Apache configurado correctamente para SPA"
    echo "📝 Archivo .htaccess creado en: $PROJECT_PATH/.htaccess"
    echo "🔗 Tu aplicación React ahora debería funcionar en todas las rutas"
    echo "🔗 Prueba acceder a: /eventos"
else
    echo "❌ Error en la configuración de Apache"
    echo "Por favor revisa los logs: sudo journalctl -u apache2"
fi