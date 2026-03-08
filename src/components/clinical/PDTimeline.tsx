import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PDEvent } from '@/types/clinical';
import { Plus, Calendar, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';

const eventConfig: Record<string, { emoji: string; color: string }> = {
  catheter_insertion: { emoji: '🔧', color: 'border-primary bg-primary/10' },
  pd_start: { emoji: '▶️', color: 'border-[hsl(var(--mint))] bg-[hsl(var(--mint))]/10' },
  peritonitis: { emoji: '🦠', color: 'border-destructive bg-destructive/10' },
  exit_site_infection: { emoji: '⚠️', color: 'border-[hsl(var(--coral))] bg-[hsl(var(--coral))]/10' },
  tunnel_infection: { emoji: '🔴', color: 'border-destructive bg-destructive/10' },
  catheter_revision: { emoji: '🔄', color: 'border-[hsl(var(--lavender))] bg-[hsl(var(--lavender))]/10' },
  catheter_removal: { emoji: '❌', color: 'border-destructive bg-destructive/15' },
  transfer_to_hd: { emoji: '🏥', color: 'border-[hsl(var(--sky))] bg-[hsl(var(--sky))]/10' },
  transplant: { emoji: '🎉', color: 'border-[hsl(var(--mint))] bg-[hsl(var(--mint))]/15' },
  pd_restart: { emoji: '🔁', color: 'border-primary bg-primary/10' },
  death: { emoji: '🕊️', color: 'border-muted bg-muted/30' },
};

const PDTimeline: React.FC<{ patientId?: string }> = ({ patientId }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [events, setEvents] = useState<PDEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ event_type: '', event_date: '', notes: '' });

  const targetPatient = patientId || user?.id;

  useEffect(() => {
    if (!targetPatient) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('pd_events')
        .select('*')
        .eq('patient_id', targetPatient)
        .order('event_date', { ascending: true });
      if (!error && data) setEvents(data as unknown as PDEvent[]);
      setLoading(false);
    };
    load();
  }, [targetPatient]);

  const handleAdd = async () => {
    if (!newEvent.event_type || !newEvent.event_date || !user) return;
    const { data, error } = await supabase.from('pd_events').insert({
      patient_id: targetPatient!,
      event_type: newEvent.event_type,
      event_date: newEvent.event_date,
      notes: newEvent.notes || null,
      created_by: user.id,
    }).select().single();
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else if (data) {
      setEvents(prev => [...prev, data as unknown as PDEvent].sort((a, b) => a.event_date.localeCompare(b.event_date)));
      setNewEvent({ event_type: '', event_date: '', notes: '' });
      setShowAdd(false);
      toast({ title: '✅', description: t('eventAdded') });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">🗓️ {t('pdTimeline')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('pdTimelineDesc')}</p>
        </div>
        <Button size="sm" className="rounded-full gap-1.5" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3.5 h-3.5" /> {t('addEvent')}
        </Button>
      </div>

      {showAdd && (
        <Card className="rounded-2xl border-primary/30 shadow-md">
          <CardContent className="p-4 space-y-3">
            <Select value={newEvent.event_type} onValueChange={v => setNewEvent(p => ({ ...p, event_type: v }))}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder={t('selectEventType')} /></SelectTrigger>
              <SelectContent>
                {Object.keys(eventConfig).map(k => (
                  <SelectItem key={k} value={k}>{eventConfig[k].emoji} {t(`event_${k}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={newEvent.event_date} onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))} className="rounded-xl" />
            <Input placeholder={t('notes')} value={newEvent.notes} onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))} className="rounded-xl" />
            <div className="flex gap-2">
              <Button size="sm" className="rounded-full flex-1" onClick={handleAdd}>{t('save')}</Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowAdd(false)}>{t('cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <Card className="rounded-2xl border-border/30">
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm text-muted-foreground">{t('noEventsYet')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border/50" />
          {events.map((event, i) => {
            const cfg = eventConfig[event.event_type] || { emoji: '📌', color: 'border-border bg-muted/30' };
            return (
              <div key={event.id} className="relative mb-4 last:mb-0">
                {/* Dot */}
                <div className={`absolute -left-6 top-3 w-[22px] h-[22px] rounded-full border-2 ${cfg.color} flex items-center justify-center text-xs`}>
                  {cfg.emoji}
                </div>
                <Card className="rounded-xl border-border/30 shadow-sm ml-2">
                  <CardContent className="p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px] font-semibold rounded-full px-2">
                        {t(`event_${event.event_type}`)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(event.event_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {event.notes && <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PDTimeline;
