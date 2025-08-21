const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());
// CORS básico para permitir llamadas desde tu web
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Configuración de Supabase
const supabaseUrl = 'https://mcqgkdfuamjcpsngxzzk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jcWdrZGZ1YW1qY3Bzbmd4enprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Mjc2NzIsImV4cCI6MjA3MTMwMzY3Mn0.zNkgc_cdMmhd6RMDC9Spw0SZguw3xs1vQhjOPQPymXk';
const supabase = createClient(supabaseUrl, supabaseKey);

// Token del bot de Telegram
const TELEGRAM_BOT_TOKEN = '8260712300:AAEVa6GiRSfb93HyDbRy24oKJrCO5KzsIlM';
const ADMIN_CHAT_ID = '-4947999909';

// Función para enviar mensajes a Telegram
async function sendTelegramMessage(chatId, message) {
  try {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    console.log('Enviando mensaje a Telegram:', { chatId, message });
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = await response.json();
    console.log('Respuesta de Telegram:', data);

    if (!data.ok) {
      // Intentar con prefijo -100 para supergrupos
      if (typeof chatId === 'string' && !chatId.startsWith('-100') && 
          (data.description || '').toLowerCase().includes('chat not found')) {
        const fallbackChatId = `-100${chatId.replace('-', '')}`;
        console.log('Reintentando con fallbackChatId:', fallbackChatId);
        
        const retryResponse = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: fallbackChatId,
            text: message,
          }),
        });
        
        const retryData = await retryResponse.json();
        console.log('Respuesta del reintento:', retryData);
        
        if (retryData.ok) {
          return { success: true, message: 'Mensaje enviado con fallback', telegram_response: retryData };
        }
      }
      
      throw new Error(`Error de Telegram: ${data.description}`);
    }

    return { success: true, message: 'Mensaje enviado correctamente', telegram_response: data };
  } catch (error) {
    console.error('Error enviando mensaje a Telegram:', error);
    throw error;
  }
}

// Función para formatear mensajes según la acción
function formatMessage(action, reservation) {
  const ticketNumber = reservation.ticket_number || reservation.id || 'N/A';
  const userName = reservation.user_name || reservation.fullName || 'Usuario';
  const equipmentName = reservation.equipment_name || reservation.equipmentCode || 'Equipo';
  const startTime = reservation.start_time || `${reservation.reservationDate} ${reservation.startTime}`;
  const endTime = reservation.end_time || `${reservation.reservationDate} ${reservation.endTime}`;

  switch (action) {
    case 'new_reservation':
      return `🎮 NUEVA RESERVA
Ticket: ${ticketNumber}
Usuario: ${userName}
Equipo: ${equipmentName}
Inicio: ${startTime}
Fin: ${endTime}
Estado: Pendiente de confirmación

¡Nueva reserva recibida!`;

    case 'confirm_reservation':
      return `✅ RESERVA CONFIRMADA
Ticket: ${ticketNumber}
Usuario: ${userName}
Equipo: ${equipmentName}
Inicio: ${startTime}
Fin: ${endTime}

La reserva ha sido confirmada.`;

    case 'cancel_reservation':
      return `❌ RESERVA CANCELADA
Ticket: ${ticketNumber}
Usuario: ${userName}
Equipo: ${equipmentName}
Inicio: ${startTime}
Fin: ${endTime}

La reserva ha sido cancelada.`;

    case 'user_arrived':
      return `👤 USUARIO LLEGÓ
Ticket: ${ticketNumber}
Usuario: ${userName}
Equipo: ${equipmentName}

El usuario ha llegado y la sesión ha comenzado.`;

    case 'session_completed':
      return `🏁 SESIÓN COMPLETADA
Ticket: ${ticketNumber}
Usuario: ${userName}
Equipo: ${equipmentName}

La sesión ha sido completada exitosamente.`;

    default:
      return `📢 NOTIFICACIÓN
Ticket: ${ticketNumber}
Usuario: ${userName}
Equipo: ${equipmentName}
Acción: ${action}`;
  }
}

// Endpoint para recibir notificaciones
app.post('/telegram-notification', async (req, res) => {
  try {
    const { action, reservation, adminChatId } = req.body;
    
    console.log('Notificación recibida:', { action, reservation, adminChatId });
    
    if (!action || !reservation) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const chatId = adminChatId || ADMIN_CHAT_ID;
    const message = formatMessage(action, reservation);
    
    const result = await sendTelegramMessage(chatId, message);
    
    res.json(result);
  } catch (error) {
    console.error('Error en notificación:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', bot_token: TELEGRAM_BOT_TOKEN ? 'configurado' : 'no configurado' });
});

// Endpoint para probar el bot
app.post('/test', async (req, res) => {
  try {
    const testMessage = `🧪 TEST DEL BOT
Fecha: ${new Date().toLocaleString()}
Estado: Funcionando correctamente`;
    
    const result = await sendTelegramMessage(ADMIN_CHAT_ID, testMessage);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor del bot de Telegram ejecutándose en puerto ${PORT}`);
  console.log(`Bot token configurado: ${TELEGRAM_BOT_TOKEN ? 'Sí' : 'No'}`);
  console.log(`Chat ID admin: ${ADMIN_CHAT_ID}`);
});