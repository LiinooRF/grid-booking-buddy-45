#!/bin/bash

# SCRIPT DE EMERGENCIA - Arreglar MIME types JavaScript
# Para VPS: 173.212.212.147 - Gaming Grid

echo "🚨 ARREGLANDO MIME TYPES JAVASCRIPT URGENTE"

# Detectar servidor web
if systemctl is-active --quiet nginx; then
    echo "📋 NGINX detectado - Configurando MIME types..."
    
    # Verificar si /etc/nginx/mime.types tiene JavaScript
    if ! grep -q "application/javascript.*js" /etc/nginx/mime.types; then
        echo "❌ mime.types no tiene JavaScript configurado"
        
        # Backup del archivo original
        cp /etc/nginx/mime.types /etc/nginx/mime.types.backup
        
        # Agregar tipos MIME faltantes
        sed -i '/text\/css.*css;/a\
    application/javascript                js mjs;' /etc/nginx/mime.types
        
        echo "✅ Agregado application/javascript a mime.types"
    fi
    
    # Crear configuración específica para Gaming Grid
    cat > /etc/nginx/sites-available/gaming-grid << 'EOF'
server {
    listen 80;
    server_name 173.212.212.147;
    root /var/www/reservas;
    index index.html;

    # MIME types EXPLÍCITOS para JavaScript
    location ~* \.js$ {
        add_header Content-Type "application/javascript; charset=utf-8";
        try_files $uri =404;
    }
    
    location ~* \.mjs$ {
        add_header Content-Type "application/javascript; charset=utf-8";
        try_files $uri =404;
    }
    
    location ~* \.css$ {
        add_header Content-Type "text/css; charset=utf-8";
        try_files $uri =404;
    }

    # SPA - React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
}
EOF

    # Deshabilitar sitio por defecto y habilitar Gaming Grid
    rm -f /etc/nginx/sites-enabled/default
    ln -sf /etc/nginx/sites-available/gaming-grid /etc/nginx/sites-enabled/
    
    # Verificar y recargar
    if nginx -t; then
        systemctl reload nginx
        echo "✅ NGINX reconfigurado con MIME types correctos"
    else
        echo "❌ Error en configuración nginx"
        nginx -t
        exit 1
    fi

elif systemctl is-active --quiet apache2; then
    echo "📋 APACHE detectado - Configurando MIME types..."
    
    # Habilitar mod_mime
    a2enmod mime
    
    # Crear .htaccess con MIME types explícitos
    cat > /var/www/reservas/.htaccess << 'EOF'
# MIME types EXPLÍCITOS para módulos JavaScript
<IfModule mod_mime.c>
    # Forzar tipos MIME correctos
    AddType application/javascript .js
    AddType application/javascript .mjs
    AddType text/css .css
    
    # Headers explícitos para JavaScript
    <FilesMatch "\.(js|mjs)$">
        Header set Content-Type "application/javascript; charset=utf-8"
    </FilesMatch>
    
    <FilesMatch "\.css$">
        Header set Content-Type "text/css; charset=utf-8"
    </FilesMatch>
</IfModule>

# SPA React Router
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]

# Favicon no encontrado
<Files "favicon.ico">
    ErrorDocument 404 "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
</Files>
EOF

    # Habilitar headers module
    a2enmod headers
    
    # Configurar VirtualHost si no existe
    if [ ! -f /etc/apache2/sites-available/gaming-grid.conf ]; then
        cat > /etc/apache2/sites-available/gaming-grid.conf << 'EOF'
<VirtualHost *:80>
    ServerName 173.212.212.147
    DocumentRoot /var/www/reservas
    
    <Directory "/var/www/reservas">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOF
        a2ensite gaming-grid.conf
        a2dissite 000-default
    fi
    
    # Verificar y recargar
    if apache2ctl configtest; then
        systemctl reload apache2
        echo "✅ APACHE reconfigurado con MIME types correctos"
    else
        echo "❌ Error en configuración apache"
        apache2ctl configtest
        exit 1
    fi

else
    echo "❌ No se detectó nginx ni apache activo"
    exit 1
fi

# Verificar permisos
chown -R www-data:www-data /var/www/reservas 2>/dev/null || chown -R apache:apache /var/www/reservas 2>/dev/null
chmod -R 755 /var/www/reservas

echo ""
echo "🎉 MIME TYPES JAVASCRIPT ARREGLADOS"
echo "🔄 Recarga la página: http://173.212.212.147"
echo "✅ Los archivos .js ahora deberían cargar como application/javascript"
echo "✅ Las rutas /eventos y /reservas deberían funcionar"