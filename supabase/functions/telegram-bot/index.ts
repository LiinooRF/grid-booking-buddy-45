import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuración de Supabase
const supabaseUrl = 'https://mcqgkdfuamjcpsngxzzk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jcWdrZGZ1YW1qY3Bzbmd4enprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Mjc2NzIsImV4cCI6MjA3MTMwMzY3Mn0.zNkgc_cdMmhd6RMDC9Spw0SZguw3xs1vQhjOPQPymXk';
const supabase = createClient(supabaseUrl, supabaseKey);

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, reservation, adminChatId } = await req.json();
    
    console.log('Telegram bot action:', action);
    console.log('Reservation:', reservation);
    console.log('TELEGRAM_BOT_TOKEN exists:', !!TELEGRAM_BOT_TOKEN);
    console.log('Chat ID que se usará:', adminChatId || '-4947999909');

    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN no configurado');
    }

    let message = '';
    let chatId = adminChatId || '-4947999909'; // ID del grupo de Telegram

    switch (action) {
      case 'new_reservation':
        message = `🎮 *NUEVA RESERVA*\n\n` +
                 `📱 Ticket: ${reservation.ticket_number}\n` +
                 `👤 Cliente: ${reservation.user_name}\n` +
                 `📞 Teléfono: ${reservation.user_phone}\n` +
                 `🎯 Equipo: ${reservation.equipment_name}\n` +
                 `⏰ Horario: ${new Date(reservation.start_time).toLocaleString('es-ES')}\n` +
                 `🕐 Duración: ${reservation.hours} hora(s)\n` +
                 `📅 Termina: ${new Date(reservation.end_time).toLocaleString('es-ES')}\n\n` +
                 `Estado: ⏳ PENDIENTE DE CONFIRMACIÓN`;
        break;

      case 'confirm_reservation':
        message = `✅ *RESERVA CONFIRMADA*\n\n` +
                 `📱 Ticket: ${reservation.ticket_number}\n` +
                 `👤 Cliente: ${reservation.user_name}\n` +
                 `🎯 Equipo: ${reservation.equipment_name}\n` +
                 `⏰ Confirmada para: ${new Date(reservation.start_time).toLocaleString('es-ES')}`;
        break;

      case 'cancel_reservation':
        message = `❌ *RESERVA CANCELADA*\n\n` +
                 `📱 Ticket: ${reservation.ticket_number}\n` +
                 `👤 Cliente: ${reservation.user_name}\n` +
                 `🎯 Equipo: ${reservation.equipment_name}\n` +
                 `⏰ Era para: ${new Date(reservation.start_time).toLocaleString('es-ES')}\n\n` +
                 `Motivo: ${reservation.cancellation_reason || 'No especificado'}`;
        break;

      case 'user_arrived':
        message = `🟢 *CLIENTE LLEGÓ*\n\n` +
                 `📱 Ticket: ${reservation.ticket_number}\n` +
                 `👤 Cliente: ${reservation.user_name}\n` +
                 `🎯 Equipo: ${reservation.equipment_name}\n` +
                 `⏰ Iniciando sesión ahora`;
        break;

      case 'session_completed':
        message = `🏁 *SESIÓN COMPLETADA*\n\n` +
                 `📱 Ticket: ${reservation.ticket_number}\n` +
                 `👤 Cliente: ${reservation.user_name}\n` +
                 `🎯 Equipo: ${reservation.equipment_name}\n` +
                 `⏰ Finalizada: ${new Date().toLocaleString('es-ES')}`;
        break;

      default:
        throw new Error(`Acción no reconocida: ${action}`);
    }

    // Enviar mensaje a Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    console.log('Sending to Telegram URL:', telegramUrl.replace(TELEGRAM_BOT_TOKEN, 'HIDDEN_TOKEN'));
    console.log('Payload:', { chat_id: chatId, text: message.substring(0, 100) + '...' });
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const telegramData = await telegramResponse.json();
    console.log('Telegram response status:', telegramResponse.status);
    console.log('Telegram response:', telegramData);

    if (!telegramData.ok) {
      // Intento de fallback para supergrupos: prefijar -100 si da "chat not found"
      if (
        typeof chatId === 'string' &&
        !chatId.startsWith('-100') &&
        (telegramData.description || '').toLowerCase().includes('chat not found')
      ) {
        const fallbackChatId = `-100${chatId.replace('-', '')}`;
        console.warn('Reintentando con fallbackChatId:', fallbackChatId);
        const retryResponse = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: fallbackChatId,
              text: message,
            }),
        });
        const retryData = await retryResponse.json();
        console.log('Retry status:', retryResponse.status, 'Retry response:', retryData);
        if (retryData?.ok) {
          return new Response(
            JSON.stringify({ success: true, message: 'Notificación enviada con fallback', telegram_response: retryData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      console.error('Telegram API Error Details:', {
        error_code: telegramData.error_code,
        description: telegramData.description,
        chatId: chatId,
        tokenValid: TELEGRAM_BOT_TOKEN?.length > 0
      });
      throw new Error(`Error de Telegram: ${telegramData.description}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notificación enviada correctamente',
        telegram_response: telegramData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error en telegram-bot:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});