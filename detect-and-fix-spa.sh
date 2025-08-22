#!/bin/bash

# Script automático para detectar y configurar servidor web para SPA
# Uso: sudo ./detect-and-fix-spa.sh [ruta_del_proyecto]

PROJECT_PATH=${1:-"/var/www/html"}

echo "🔍 Detectando servidor web..."

# Función para detectar qué servidor está corriendo
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

echo "Servidor detectado: $WEBSERVER"
echo "Ruta del proyecto: $PROJECT_PATH"

case $WEBSERVER in
    "nginx")
        echo "🔧 Configurando Nginx..."
        
        # Buscar archivos de configuración existentes
        NGINX_CONF=""
        if [ -f /etc/nginx/sites-available/default ]; then
            NGINX_CONF="/etc/nginx/sites-available/default"
        elif [ -f /etc/nginx/conf.d/default.conf ]; then
            NGINX_CONF="/etc/nginx/conf.d/default.conf"
        fi
        
        if [ -n "$NGINX_CONF" ]; then
            # Backup
            cp "$NGINX_CONF" "$NGINX_CONF.backup.$(date +%Y%m%d_%H%M%S)"
            
            # Verificar si ya tiene try_files configurado
            if ! grep -q "try_files.*index.html" "$NGINX_CONF"; then
                echo "Añadiendo configuración SPA a $NGINX_CONF"
                
                # Buscar la sección location / y modificarla
                sed -i '/location \/ {/,/}/ {
                    /try_files/d
                    /location \/ {/a\
                try_files $uri $uri/ /index.html;
                }' "$NGINX_CONF"
            fi
            
            nginx -t && systemctl reload nginx
            echo "✅ Nginx configurado para SPA"
        fi
        ;;
        
    "apache2"|"httpd")
        echo "🔧 Configurando Apache..."
        
        # Habilitar mod_rewrite
        if command -v a2enmod &> /dev/null; then
            a2enmod rewrite
        fi
        
        # Crear .htaccess
        cat > "$PROJECT_PATH/.htaccess" << 'EOF'
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
EOF
        
        chmod 644 "$PROJECT_PATH/.htaccess"
        
        # Verificar AllowOverride
        APACHE_CONF="/etc/apache2/sites-available/000-default.conf"
        if [ -f "$APACHE_CONF" ] && ! grep -q "AllowOverride All" "$APACHE_CONF"; then
            cp "$APACHE_CONF" "$APACHE_CONF.backup.$(date +%Y%m%d_%H%M%S)"
            sed -i "/<\/VirtualHost>/i\\
<Directory \"$PROJECT_PATH\">\\
    AllowOverride All\\
    Require all granted\\
</Directory>" "$APACHE_CONF"
        fi
        
        if command -v apache2ctl &> /dev/null; then
            apache2ctl configtest && systemctl reload apache2
        else
            httpd -t && systemctl reload httpd
        fi
        
        echo "✅ Apache configurado para SPA"
        ;;
        
    "unknown")
        echo "❌ No se pudo detectar nginx o apache corriendo"
        echo "Por favor, asegúrate de que tu servidor web esté ejecutándose"
        echo "Comandos para verificar:"
        echo "  systemctl status nginx"
        echo "  systemctl status apache2"
        exit 1
        ;;
esac

echo ""
echo "🎉 Configuración completada!"
echo "🔗 Ahora deberías poder acceder a todas las rutas de tu SPA:"
echo "   - /eventos"
echo "   - /reservas"
echo "   - Cualquier otra ruta de React"
echo ""
echo "🧪 Para probar, visita directamente: http://tu-dominio/eventos"