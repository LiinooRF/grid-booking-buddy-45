#!/bin/bash

# Script para actualizar servidor en VPS
# IP del VPS: 173.212.212.147

echo "🚀 Actualizando servidor en VPS..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
VPS_IP="173.212.212.147"
VPS_USER="root"  # Cambia por tu usuario
PROJECT_PATH="/var/www/reservas"
BOT_PATH="/var/www/telegram-bot-server"

echo -e "${YELLOW}Conectando a VPS ${VPS_IP}...${NC}"

# Función para ejecutar comandos en el VPS
run_remote() {
    ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "$1"
}

# Función para copiar archivos al VPS
copy_to_vps() {
    scp -o StrictHostKeyChecking=no -r "$1" $VPS_USER@$VPS_IP:"$2"
}

echo -e "${YELLOW}1. Actualizando aplicación web...${NC}"
# Aquí puedes agregar comandos para subir tu aplicación web compilada
# copy_to_vps "./dist/*" "$PROJECT_PATH/"

echo -e "${YELLOW}2. Actualizando servidor del bot de Telegram...${NC}"
# Copiar servidor del bot
copy_to_vps "./telegram-bot-server" "/var/www/"

echo -e "${YELLOW}3. Instalando dependencias del bot...${NC}"
run_remote "cd $BOT_PATH && npm install"

# Abrir puerto 3001 en el firewall (si UFW está disponible)
echo -e "${YELLOW}3.1 Abriendo puerto 3001 en el firewall...${NC}"
run_remote "if command -v ufw > /dev/null; then ufw allow 3001/tcp || true; ufw allow OpenSSH || true; ufw reload || true; fi"

echo -e "${YELLOW}4. Reiniciando servidor del bot...${NC}"
# Detener proceso anterior si existe
run_remote "pkill -f 'node server.js' || true"

# Iniciar con PM2 si está disponible
if run_remote "command -v pm2 > /dev/null"; then
    echo -e "${GREEN}Usando PM2 para gestionar el proceso...${NC}"
    run_remote "cd $BOT_PATH && pm2 restart telegram-bot || pm2 start server.js --name telegram-bot"
else
    echo -e "${YELLOW}PM2 no encontrado, iniciando en background...${NC}"
    run_remote "cd $BOT_PATH && nohup node server.js > bot.log 2>&1 &"
fi

echo -e "${YELLOW}5. Verificando estado del servidor...${NC}"
sleep 2
if run_remote "curl -s http://localhost:3001/health | grep -q 'OK'"; then
    echo -e "${GREEN}✅ Servidor del bot funcionando correctamente${NC}"
else
    echo -e "${RED}❌ Error: El servidor del bot no responde${NC}"
    echo -e "${YELLOW}Logs del servidor:${NC}"
    run_remote "cd $BOT_PATH && tail -20 bot.log || pm2 logs telegram-bot --lines 20"
    exit 1
fi

echo -e "${YELLOW}6. Probando notificación de Telegram...${NC}"
if run_remote "curl -s -X POST http://localhost:3001/test | grep -q 'success'"; then
    echo -e "${GREEN}✅ Bot de Telegram funcionando correctamente${NC}"
else
    echo -e "${RED}❌ Error: El bot de Telegram no funciona${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Actualización completada exitosamente!${NC}"
echo -e "${GREEN}Bot de Telegram: http://${VPS_IP}:3001${NC}"
echo -e "${GREEN}Health check: http://${VPS_IP}:3001/health${NC}"

# Opcional: configurar nginx si no está configurado
echo -e "${YELLOW}¿Quieres configurar nginx como proxy? (y/n)${NC}"
read -r configure_nginx

if [[ $configure_nginx == "y" || $configure_nginx == "Y" ]]; then
    echo -e "${YELLOW}Configurando nginx...${NC}"
    
    # Crear configuración de nginx
    cat > /tmp/telegram-bot.conf << EOF
server {
    listen 80;
    server_name bot.tudominio.com;  # Cambia por tu dominio
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    copy_to_vps "/tmp/telegram-bot.conf" "/etc/nginx/sites-available/"
    run_remote "ln -sf /etc/nginx/sites-available/telegram-bot.conf /etc/nginx/sites-enabled/"
    run_remote "nginx -t && systemctl reload nginx"
    
    echo -e "${GREEN}✅ Nginx configurado${NC}"
fi

echo -e "${GREEN}🚀 Servidor listo en http://${VPS_IP}:3001${NC}"