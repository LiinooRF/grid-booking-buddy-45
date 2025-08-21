#!/bin/bash

# Script local para ejecutar directo en el VPS
# Ejecutar desde: /var/www/reservas

echo "🚀 Instalando bot de Telegram en VPS local..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BOT_PATH="/var/www/telegram-bot-server"

echo -e "${YELLOW}1. Creando directorio del bot...${NC}"
mkdir -p "$BOT_PATH"

echo -e "${YELLOW}2. Copiando archivos del bot...${NC}"
cp -r ./telegram-bot-server/* "$BOT_PATH/"

echo -e "${YELLOW}3. Instalando dependencias...${NC}"
cd "$BOT_PATH"
npm install

echo -e "${YELLOW}4. Abriendo puerto 3001 en firewall...${NC}"
if command -v ufw > /dev/null; then
    ufw allow 3001/tcp || true
    ufw allow OpenSSH || true
    ufw reload || true
    echo -e "${GREEN}✅ Puerto 3001 abierto${NC}"
else
    echo -e "${YELLOW}UFW no encontrado, puerto podría estar bloqueado${NC}"
fi

echo -e "${YELLOW}5. Deteniendo procesos anteriores...${NC}"
pkill -f 'node server.js' || true

echo -e "${YELLOW}6. Iniciando servidor del bot...${NC}"
if command -v pm2 > /dev/null; then
    echo -e "${GREEN}Usando PM2...${NC}"
    pm2 stop telegram-bot || true
    pm2 start server.js --name telegram-bot
    pm2 save
else
    echo -e "${YELLOW}PM2 no encontrado, iniciando en background...${NC}"
    nohup node server.js > bot.log 2>&1 &
fi

echo -e "${YELLOW}7. Esperando que inicie...${NC}"
sleep 3

echo -e "${YELLOW}8. Verificando estado...${NC}"
if curl -s http://localhost:3001/health | grep -q 'OK'; then
    echo -e "${GREEN}✅ Servidor funcionando${NC}"
else
    echo -e "${RED}❌ Error: Servidor no responde${NC}"
    echo -e "${YELLOW}Logs:${NC}"
    if command -v pm2 > /dev/null; then
        pm2 logs telegram-bot --lines 10
    else
        tail -20 bot.log
    fi
    exit 1
fi

echo -e "${YELLOW}9. Probando bot de Telegram...${NC}"
if curl -s -X POST http://localhost:3001/test | grep -q 'success'; then
    echo -e "${GREEN}✅ Bot de Telegram funcionando${NC}"
else
    echo -e "${RED}❌ Error: Bot no funciona${NC}"
    echo -e "${YELLOW}Respuesta del test:${NC}"
    curl -s -X POST http://localhost:3001/test
    exit 1
fi

echo -e "${GREEN}🎉 ¡Bot instalado exitosamente!${NC}"
echo -e "${GREEN}URL: http://173.212.212.147:3001${NC}"
echo -e "${GREEN}Health: http://173.212.212.147:3001/health${NC}"
echo -e "${GREEN}Test: curl -X POST http://173.212.212.147:3001/test${NC}"

# Mostrar status
echo -e "${YELLOW}Status actual:${NC}"
if command -v pm2 > /dev/null; then
    pm2 status | grep telegram-bot
else
    ps aux | grep "node server.js" | grep -v grep || echo "Proceso no encontrado"
fi