import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Plus, Trash2, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSmartReminders, ReminderSetting } from '@/hooks/useSmartReminders';

const SmartReminders: React.FC = () => {
  const { reminders, loading, addReminder, toggleReminder, deleteReminder } = useSmartReminders();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    reminder_time: '',
    reminder_type: 'custom' as string,
    enabled: true,
    days_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    sound_enabled: true,
  });

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setNewReminder((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    }));
  };

  const handleAdd = async () => {
    if (newReminder.title && newReminder.reminder_time) {
      await addReminder(newReminder);
      setNewReminder({
        title: '',
        reminder_time: '',
        reminder_type: 'custom',
        enabled: true,
        days_of_week: daysOfWeek,
        sound_enabled: true,
      });
      setShowAddForm(false);
    }
  };

  const typeColors: Record<string, string> = {
    exchange: 'bg-primary/10 text-primary border-primary/20',
    medication: 'bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))] border-[hsl(var(--mint))]/20',
    weight: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20',
    custom: 'bg-[hsl(var(--lavender))]/10 text-[hsl(var(--lavender))] border-[hsl(var(--lavender))]/20',
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <span className="text-base font-semibold">Smart Reminders</span>
            </div>
            {reminders.some((r) => r.is_auto_generated) && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Zap className="w-3 h-3" /> Prescription-synced
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                reminder.enabled ? 'bg-card' : 'bg-muted/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Switch
                  checked={reminder.enabled}
                  onCheckedChange={(v) => toggleReminder(reminder.id, v)}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{reminder.title}</p>
                    {reminder.is_auto_generated && (
                      <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-muted-foreground">
                      {reminder.reminder_time.slice(0, 5)}
                    </span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColors[reminder.reminder_type] || ''}`}>
                      {reminder.reminder_type}
                    </Badge>
                  </div>
                </div>
              </div>
              {!reminder.is_auto_generated && (
                <Button
                  onClick={() => deleteReminder(reminder.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Reminder
            </Button>
          ) : (
            <div className="space-y-3 p-4 border rounded-xl bg-muted/30">
              <div className="space-y-1.5">
                <Label htmlFor="r-title" className="text-xs">Title</Label>
                <Input
                  id="r-title"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Take Medication"
                  className="h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="r-time" className="text-xs">Time</Label>
                  <Input
                    id="r-time"
                    type="time"
                    value={newReminder.reminder_time}
                    onChange={(e) => setNewReminder((p) => ({ ...p, reminder_time: e.target.value }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={newReminder.reminder_type}
                    onValueChange={(v) => setNewReminder((p) => ({ ...p, reminder_type: v }))}
                  >
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exchange">Exchange</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Days</Label>
                <div className="flex flex-wrap gap-1.5">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day}
                      variant={newReminder.days_of_week.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 px-2.5 text-xs rounded-lg"
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} className="flex-1 h-9 rounded-xl" size="sm">
                  Add Reminder
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm" className="h-9 rounded-xl">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartReminders;
