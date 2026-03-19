import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PDEvent } from '@/types/clinical';
import { Plus, Calendar, ChevronDown, Check, Loader2, Trash2, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const eventConfig: Record<string, { emoji: string; color: string; label: string }> = {
  catheter_insertion: { emoji: '🔧', color: 'border-primary bg-primary/10', label: 'Catheter Insertion' },
  pd_start: { emoji: '▶️', color: 'border-emerald-500 bg-emerald-500/10', label: 'PD Started' },
  peritonitis: { emoji: '🦠', color: 'border-destructive bg-destructive/10', label: 'Peritonitis' },
  exit_site_infection: { emoji: '⚠️', color: 'border-orange-500 bg-orange-500/10', label: 'Exit Site Infection' },
  tunnel_infection: { emoji: '🔴', color: 'border-destructive bg-destructive/10', label: 'Tunnel Infection' },
  catheter_revision: { emoji: '🔄', color: 'border-violet-500 bg-violet-500/10', label: 'Catheter Revision' },
  catheter_removal: { emoji: '❌', color: 'border-destructive bg-destructive/15', label: 'Catheter Removal' },
  transfer_to_hd: { emoji: '🏥', color: 'border-sky-500 bg-sky-500/10', label: 'Transfer to HD' },
  transplant: { emoji: '🎉', color: 'border-emerald-500 bg-emerald-500/15', label: 'Transplant' },
  pd_restart: { emoji: '🔁', color: 'border-primary bg-primary/10', label: 'PD Restart' },
  death: { emoji: '🕊️', color: 'border-muted bg-muted/30', label: 'Death' },
};

const PDTimeline: React.FC<{ patientId?: string }> = ({ patientId }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [events, setEvents] = useState<PDEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    event_type: '',
    event_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const targetPatient = patientId || user?.id;

  const loadEvents = useCallback(async () => {
    if (!targetPatient) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pd_events')
        .select('*')
        .eq('patient_id', targetPatient)
        .order('event_date', { ascending: false });
      if (error) throw error;
      setEvents((data ?? []) as unknown as PDEvent[]);
    } catch (err: any) {
      console.error('Failed to load PD events:', err);
      toast({ title: 'Error loading timeline', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [targetPatient, toast]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleAdd = async () => {
    if (!newEvent.event_type || !newEvent.event_date || !user) {
      toast({ title: 'Missing fields', description: 'Please select event type and date', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('pd_events').insert({
        patient_id: targetPatient!,
        event_type: newEvent.event_type,
        event_date: newEvent.event_date,
        notes: newEvent.notes || null,
        created_by: user.id,
      }).select().single();

      if (error) throw error;

      if (data) {
        setEvents(prev => [data as unknown as PDEvent, ...prev].sort(
          (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        ));
        setNewEvent({ event_type: '', event_date: new Date().toISOString().split('T')[0], notes: '' });
        setShowAdd(false);
        toast({ title: '✅ Event saved', description: `${eventConfig[newEvent.event_type]?.label || newEvent.event_type} added to timeline` });
      }
    } catch (err: any) {
      console.error('Failed to save PD event:', err);
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    setDeleting(eventId);
    try {
      const { error } = await supabase.from('pd_events').delete().eq('id', eventId);
      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast({ title: '🗑️ Deleted', description: 'Event removed from timeline' });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  const durationSinceFirst = events.length > 0
    ? formatDistanceToNow(new Date(events[events.length - 1].event_date))
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">🗓️ {t('pdTimeline')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {durationSinceFirst ? `PD journey: ${durationSinceFirst}` : t('pdTimelineDesc')}
          </p>
        </div>
        <Button
          size="sm"
          className="rounded-full gap-1.5"
          onClick={() => setShowAdd(!showAdd)}
          variant={showAdd ? 'outline' : 'default'}
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? t('cancel') : t('addEvent')}
        </Button>
      </div>

      {/* Summary badges */}
      {events.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(
            events.reduce<Record<string, number>>((acc, e) => {
              acc[e.event_type] = (acc[e.event_type] || 0) + 1;
              return acc;
            }, {})
          ).map(([type, count]) => (
            <Badge key={type} variant="outline" className="text-[10px] rounded-full px-2 py-0.5">
              {eventConfig[type]?.emoji} {eventConfig[type]?.label || type} {count > 1 && `×${count}`}
            </Badge>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <Card className="rounded-2xl border-primary/30 shadow-md animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">New Timeline Event</p>

            <Select value={newEvent.event_type} onValueChange={v => setNewEvent(p => ({ ...p, event_type: v }))}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select event type..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(eventConfig).map(([k, cfg]) => (
                  <SelectItem key={k} value={k}>
                    {cfg.emoji} {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input
                type="date"
                value={newEvent.event_date}
                onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
              <Textarea
                placeholder="Add details..."
                value={newEvent.notes}
                onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))}
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="rounded-full flex-1 gap-1.5"
                onClick={handleAdd}
                disabled={saving || !newEvent.event_type}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {saving ? 'Saving…' : 'Save Event'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => setShowAdd(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <Card className="rounded-2xl border-border/30">
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm text-muted-foreground">{t('noEventsYet')}</p>
            <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={() => setShowAdd(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add first event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative pl-7">
          {/* Vertical timeline line */}
          <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-border" />

          {events.map((event) => {
            const cfg = eventConfig[event.event_type] || { emoji: '📌', color: 'border-border bg-muted/30', label: event.event_type };
            const isDeleting = deleting === event.id;
            const eventDate = new Date(event.event_date);
            const ago = formatDistanceToNow(eventDate, { addSuffix: true });

            return (
              <div key={event.id} className="relative mb-4 last:mb-0 group">
                {/* Timeline dot */}
                <div className={`absolute -left-7 top-3 w-[26px] h-[26px] rounded-full border-2 ${cfg.color} flex items-center justify-center text-sm z-10 bg-background`}>
                  {cfg.emoji}
                </div>

                <Card className="rounded-xl border-border/40 shadow-sm hover:shadow-md transition-shadow ml-1">
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] font-semibold rounded-full px-2 shrink-0">
                            {cfg.label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3" />
                            {format(eventDate, 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{ago}</p>
                        {event.notes && (
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{event.notes}</p>
                        )}
                      </div>

                      {/* Delete button - only show for own events */}
                      {event.created_by === user?.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(event.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                      )}
                    </div>
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
