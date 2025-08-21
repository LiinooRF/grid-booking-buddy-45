# Servidor Bot de Telegram

Servidor independiente para manejar notificaciones de Telegram del sistema de reservas.

## Instalación en VPS

1. Sube la carpeta `telegram-bot-server` a tu VPS
2. Instala las dependencias:
   ```bash
   cd telegram-bot-server
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   # Edita .env con tus valores si es necesario
   ```

4. Ejecuta el servidor:
   ```bash
   npm start
   ```

## Configuración del dominio web

Necesitas actualizar tu aplicación web para que apunte al nuevo servidor en lugar de la función Edge de Supabase.

Cambia las llamadas de:
```javascript
await supabase.functions.invoke('telegram-bot', { ... })
```

Por:
```javascript
await fetch('http://TU_VPS_IP:3001/telegram-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
})
```

## Endpoints disponibles

- `POST /telegram-notification` - Envía notificaciones
- `GET /health` - Verifica el estado del servidor
- `POST /test` - Envía un mensaje de prueba

## Configuración con PM2 (recomendado)

Para mantener el servidor ejecutándose:

```bash
npm install -g pm2
pm2 start server.js --name telegram-bot
pm2 startup
pm2 save
```

## Configuración con nginx (opcional)

Para usar un dominio en lugar de IP:puerto, configura nginx como proxy:

```nginx
server {
    listen 80;
    server_name bot.tudominio.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```