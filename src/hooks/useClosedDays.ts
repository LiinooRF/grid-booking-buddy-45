import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useClosedDays = () => {
  const [isClosedToday, setIsClosedToday] = useState(false);
  const [closedReason, setClosedReason] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkClosedDay = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('closed_days')
          .select('reason')
          .eq('date', today)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking closed day:', error);
          setIsClosedToday(false);
          setClosedReason('');
        } else if (data) {
          setIsClosedToday(true);
          setClosedReason(data.reason);
        } else {
          setIsClosedToday(false);
          setClosedReason('');
        }
      } catch (error) {
        console.error('Error checking closed day:', error);
        setIsClosedToday(false);
        setClosedReason('');
      } finally {
        setLoading(false);
      }
    };

    checkClosedDay();
  }, []);

  return { isClosedToday, closedReason, loading };
};