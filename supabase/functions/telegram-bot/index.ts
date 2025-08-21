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
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const telegramData = await telegramResponse.json();
    console.log('Telegram response:', telegramData);

    if (!telegramData.ok) {
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