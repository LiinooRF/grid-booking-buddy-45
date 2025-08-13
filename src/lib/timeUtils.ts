// Time management utilities for Gaming Grid (12PM - 12AM)
export const OPERATING_HOURS = {
  OPEN: 12, // 12PM
  CLOSE: 24, // 12AM (midnight)
  TIMEZONE: 'America/Santiago'
};

export const isOperatingHours = (date: Date = new Date()): boolean => {
  const hour = date.getHours();
  return hour >= OPERATING_HOURS.OPEN || hour < 0; // 12PM-11:59PM
};

export const getNextOpeningTime = (date: Date = new Date()): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(OPERATING_HOURS.OPEN, 0, 0, 0);
  return nextDay;
};

export const getClosingTime = (date: Date = new Date()): Date => {
  const closingToday = new Date(date);
  closingToday.setHours(23, 59, 59, 999); // 11:59:59 PM
  return closingToday;
};

export const formatOperatingHours = (): string => {
  return "12:00 PM - 12:00 AM";
};

export const getRemainingTimeToClose = (date: Date = new Date()): string => {
  if (!isOperatingHours(date)) {
    return "Cerrado";
  }
  
  const closing = getClosingTime(date);
  const diff = closing.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m para cerrar`;
  }
  return `${minutes}m para cerrar`;
};

// Telegram notification functions (mock implementation)
export const sendTelegramNotification = async (message: string): Promise<void> => {
  // Mock implementation - in real app this would call Telegram Bot API
  console.log(`📱 Telegram Notification: ${message}`);
  
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`✅ Telegram notification sent successfully`);
      resolve();
    }, 1000);
  });
};

export const formatReservationNotification = (reservation: any): string => {
  return `🎮 NUEVA RESERVA - Gaming Grid\n\n` +
         `👤 Cliente: ${reservation.fullName} (${reservation.alias})\n` +
         `📱 Teléfono: ${reservation.phone}\n` +
         `📧 Email: ${reservation.email}\n` +
         `🖥️ Equipo: ${reservation.equipmentCode}\n` +
         `⏰ Plan: ${reservation.planName}\n` +
         `💰 Total: $${reservation.planPrice.toLocaleString()} CLP\n` +
         `📄 Estado: Pendiente de revisión\n\n` +
         `🔍 Revisa el comprobante en el panel de administración.`;
};