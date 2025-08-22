#!/bin/bash

# Script para configurar SPA en VPS Gaming Grid
# Proyecto en: /var/www/reservas
# VPS: 173.212.212.147

PROJECT_PATH="/var/www/reservas"
VPS_IP="173.212.212.147"

echo "🚀 Configurando SPA para Gaming Grid en $VPS_IP"
echo "📁 Proyecto en: $PROJECT_PATH"

# Función para detectar servidor web
detect_webserver() {
    if systemctl is-active --quiet nginx; then
        echo "nginx"
    elif systemctl is-active --quiet apache2; then
        echo "apache2"
    elif systemctl is-active --quiet httpd; then
        echo "httpd"
    else
        echo "unknown"
    fi
}

WEBSERVER=$(detect_webserver)
echo "🔍 Servidor detectado: $WEBSERVER"

case $WEBSERVER in
    "nginx")
        echo "🔧 Configurando Nginx para Gaming Grid..."
        
        # Crear configuración específica para el proyecto
        cat > /etc/nginx/sites-available/gaming-grid << 'EOF'
server {
    listen 80;
    server_name 173.212.212.147;
    root /var/www/reservas;
    index index.html;

    # MIME types para archivos JavaScript (CRÍTICO)
    location ~* \.js$ {
        add_header Content-Type application/javascript;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.mjs$ {
        add_header Content-Type application/javascript;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Configuración SPA para React
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optimización otros archivos estáticos
    location ~* \.(css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
EOF

        # Habilitar el sitio
        ln -sf /etc/nginx/sites-available/gaming-grid /etc/nginx/sites-enabled/
        
        # Deshabilitar configuración por defecto
        rm -f /etc/nginx/sites-enabled/default
        
        # Verificar configuración
        if nginx -t; then
            systemctl reload nginx
            echo "✅ Nginx configurado correctamente"
        else
            echo "❌ Error en configuración de Nginx"
            exit 1
        fi
        ;;
        
    "apache2"|"httpd")
        echo "🔧 Configurando Apache para Gaming Grid..."
        
        # Habilitar mod_rewrite
        a2enmod rewrite >/dev/null 2>&1
        
        # Crear .htaccess en el proyecto
        cat > "$PROJECT_PATH/.htaccess" << 'EOF'
# Gaming Grid SPA Configuration
Options -MultiViews
RewriteEngine On

# MIME types correctos para JavaScript (CRÍTICO para módulos ES)
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType application/javascript .mjs
    AddType text/css .css
</IfModule>

# Handle React Router routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]

# Cache static assets
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

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css application/xml application/xhtml+xml application/rss+xml application/javascript application/x-javascript
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
</IfModule></IfModule>
EOF

        chmod 644 "$PROJECT_PATH/.htaccess"
        
        # Configurar VirtualHost
        cat > /etc/apache2/sites-available/gaming-grid.conf << EOF
<VirtualHost *:80>
    ServerName $VPS_IP
    DocumentRoot $PROJECT_PATH
    
    <Directory "$PROJECT_PATH">
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/gaming-grid-error.log
    CustomLog \${APACHE_LOG_DIR}/gaming-grid-access.log combined
</VirtualHost>
EOF

        # Habilitar el sitio
        a2ensite gaming-grid.conf
        a2dissite 000-default >/dev/null 2>&1
        
        # Verificar configuración
        if apache2ctl configtest; then
            systemctl reload apache2
            echo "✅ Apache configurado correctamente"
        else
            echo "❌ Error en configuración de Apache"
            exit 1
        fi
        ;;
        
    "unknown")
        echo "❌ No se detectó servidor web activo"
        echo "🔍 Verifica que nginx o apache estén ejecutándose:"
        echo "   sudo systemctl status nginx"
        echo "   sudo systemctl status apache2"
        exit 1
        ;;
esac

# Verificar permisos del proyecto
echo "🔐 Verificando permisos..."
chown -R www-data:www-data "$PROJECT_PATH" >/dev/null 2>&1 || chown -R apache:apache "$PROJECT_PATH" >/dev/null 2>&1
chmod -R 755 "$PROJECT_PATH"

echo ""
echo "🎉 ¡Gaming Grid configurado exitosamente!"
echo "🌐 Tu aplicación está disponible en:"
echo "   http://$VPS_IP"
echo "   http://$VPS_IP/reservas"
echo "   http://$VPS_IP/eventos"
echo ""
echo "✨ Las rutas de React ahora funcionan correctamente"
echo "📱 Tanto /reservas como /eventos deberían cargar sin problema"