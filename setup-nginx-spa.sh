#!/bin/bash

# Script para configurar Nginx para Single Page Applications (React)
# Uso: sudo ./setup-nginx-spa.sh [dominio] [ruta_del_proyecto]

DOMAIN=${1:-"_"}  # Por defecto usa server_name _
PROJECT_PATH=${2:-"/var/www/html"}  # Ruta por defecto

echo "Configurando Nginx para SPA..."
echo "Dominio: $DOMAIN"
echo "Ruta del proyecto: $PROJECT_PATH"

# Crear configuración de nginx
cat > /etc/nginx/sites-available/spa-config << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $PROJECT_PATH;
    index index.html;

    # Configuración para SPA (React, Vue, Angular)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Optimización para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Habilitar el sitio
ln -sf /etc/nginx/sites-available/spa-config /etc/nginx/sites-enabled/

# Deshabilitar configuración por defecto si existe
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Verificar configuración
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración de Nginx válida"
    
    # Reiniciar nginx
    systemctl reload nginx
    
    echo "✅ Nginx configurado correctamente para SPA"
    echo "📝 Tu aplicación React ahora debería funcionar en todas las rutas"
    echo "🔗 Prueba acceder a: http://$DOMAIN/eventos"
else
    echo "❌ Error en la configuración de Nginx"
    echo "Por favor revisa los logs: sudo journalctl -u nginx"
fi