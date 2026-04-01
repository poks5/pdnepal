import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePrescription } from './usePrescription';
import { useToast } from './use-toast';

export interface ReminderSetting {
  id: string;
  patient_id: string;
  title: string;
  reminder_time: string;
  reminder_type: string;
  enabled: boolean;
  days_of_week: string[];
  sound_enabled: boolean;
  is_auto_generated: boolean;
}

const EXCHANGE_TIMES: Record<number, { time: string; title: string }[]> = {
  1: [{ time: '08:00', title: 'Daily Exchange' }],
  2: [
    { time: '07:00', title: 'Morning Exchange' },
    { time: '19:00', title: 'Evening Exchange' },
  ],
  3: [
    { time: '06:00', title: 'Morning Exchange' },
    { time: '14:00', title: 'Afternoon Exchange' },
    { time: '22:00', title: 'Night Exchange' },
  ],
  4: [
    { time: '06:00', title: 'Morning Exchange' },
    { time: '11:00', title: 'Late Morning Exchange' },
    { time: '16:00', title: 'Afternoon Exchange' },
    { time: '21:00', title: 'Night Exchange' },
  ],
};

export function useSmartReminders() {
  const { user } = useAuth();
  const { dailyExchanges, hasPrescription } = usePrescription(user?.id);
  const [reminders, setReminders] = useState<ReminderSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const patientId = user?.id;

  const fetchReminders = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('reminder_settings' as any)
      .select('*')
      .eq('patient_id', patientId)
      .order('reminder_time', { ascending: true });

    if (!error && data) {
      setReminders(data as unknown as ReminderSetting[]);
    }
    setLoading(false);
  }, [patientId]);

  // Auto-generate reminders from prescription
  const syncWithPrescription = useCallback(async () => {
    if (!patientId || !hasPrescription) return;

    const times = EXCHANGE_TIMES[dailyExchanges] || EXCHANGE_TIMES[4];

    for (const { time, title } of times) {
      await supabase
        .from('reminder_settings' as any)
        .upsert(
          {
            patient_id: patientId,
            title,
            reminder_time: time + ':00',
            reminder_type: 'exchange',
            enabled: true,
            days_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            sound_enabled: true,
            is_auto_generated: true,
          } as any,
          { onConflict: 'patient_id,reminder_time', ignoreDuplicates: true }
        );
    }

    await fetchReminders();
  }, [patientId, hasPrescription, dailyExchanges, fetchReminders]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  useEffect(() => {
    if (hasPrescription) {
      syncWithPrescription();
    }
  }, [hasPrescription, syncWithPrescription]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check reminders every minute
  useEffect(() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const check = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = daysOfWeek[now.getDay()];

      reminders.forEach((r) => {
        const rTime = r.reminder_time.slice(0, 5); // "HH:MM"
        if (r.enabled && rTime === currentTime && r.days_of_week.includes(currentDay)) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`PD Reminder: ${r.title}`, {
              body: `Time for your ${r.title.toLowerCase()}`,
              icon: '/favicon.ico',
              tag: r.id,
            });
          }
          toast({ title: `⏰ ${r.title}`, description: `Time for your ${r.title.toLowerCase()}` });
        }
      });
    };

    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [reminders, toast]);

  const addReminder = async (data: Omit<ReminderSetting, 'id' | 'patient_id' | 'is_auto_generated'>) => {
    if (!patientId) return;
    const { error } = await supabase
      .from('reminder_settings' as any)
      .insert({
        ...data,
        patient_id: patientId,
        reminder_time: data.reminder_time.length === 5 ? data.reminder_time + ':00' : data.reminder_time,
        is_auto_generated: false,
      } as any);

    if (!error) {
      toast({ title: 'Reminder Added', description: `${data.title} at ${data.reminder_time.slice(0, 5)}` });
      await fetchReminders();
    }
  };

  const toggleReminder = async (id: string, enabled: boolean) => {
    await supabase
      .from('reminder_settings' as any)
      .update({ enabled } as any)
      .eq('id', id);
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
  };

  const deleteReminder = async (id: string) => {
    await supabase.from('reminder_settings' as any).delete().eq('id', id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast({ title: 'Reminder Deleted' });
  };

  return { reminders, loading, addReminder, toggleReminder, deleteReminder, syncWithPrescription };
}
