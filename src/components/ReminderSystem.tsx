
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Plus, Trash2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  title: string;
  time: string;
  enabled: boolean;
  type: 'exchange' | 'medication' | 'weight' | 'custom';
  days: string[];
  sound: boolean;
}

const ReminderSystem: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Morning Exchange',
      time: '06:00',
      enabled: true,
      type: 'exchange',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      sound: true
    },
    {
      id: '2',
      title: 'Evening Exchange',
      time: '18:00',
      enabled: true,
      type: 'exchange',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      sound: true
    }
  ]);
  
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    title: '',
    time: '',
    type: 'custom',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    sound: true,
    enabled: true
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check for reminders every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const checkReminders = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = daysOfWeek[now.getDay() === 0 ? 6 : now.getDay() - 1]; // Adjust for Sunday

    reminders.forEach(reminder => {
      if (
        reminder.enabled &&
        reminder.time === currentTime &&
        reminder.days.includes(currentDay)
      ) {
        showNotification(reminder);
      }
    });
  };

  const showNotification = (reminder: Reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`PD Reminder: ${reminder.title}`, {
        body: `Time for your ${reminder.title.toLowerCase()}`,
        icon: '/favicon.ico',
        tag: reminder.id
      });
    }

    toast({
      title: `Reminder: ${reminder.title}`,
      description: `Time for your ${reminder.title.toLowerCase()}`,
    });
  };

  const addReminder = () => {
    if (newReminder.title && newReminder.time) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: newReminder.title,
        time: newReminder.time,
        enabled: newReminder.enabled ?? true,
        type: newReminder.type ?? 'custom',
        days: newReminder.days ?? daysOfWeek,
        sound: newReminder.sound ?? true
      };

      setReminders(prev => [...prev, reminder]);
      setNewReminder({
        title: '',
        time: '',
        type: 'custom',
        days: daysOfWeek,
        sound: true,
        enabled: true
      });
      setShowAddForm(false);

      toast({
        title: "Reminder Added",
        description: `${reminder.title} at ${reminder.time}`,
      });
    }
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Reminder Deleted",
      description: "Reminder has been removed",
    });
  };

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  const toggleDay = (day: string) => {
    setNewReminder(prev => ({
      ...prev,
      days: prev.days?.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...(prev.days || []), day]
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Reminders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.map(reminder => (
              <div key={reminder.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={() => toggleReminder(reminder.id)}
                    />
                    <div>
                      <p className="font-medium">{reminder.title}</p>
                      <p className="text-sm text-gray-600">
                        {reminder.time} • {reminder.days.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => deleteReminder(reminder.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {!showAddForm ? (
              <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            ) : (
              <div className="space-y-4 p-4 border rounded">
                <div className="space-y-2">
                  <Label htmlFor="reminder-title">Title</Label>
                  <Input
                    id="reminder-title"
                    value={newReminder.title || ''}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Afternoon Exchange"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={newReminder.time || ''}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newReminder.type}
                    onValueChange={(value) => setNewReminder(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exchange">Exchange</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="weight">Weight Check</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <Button
                        key={day}
                        variant={newReminder.days?.includes(day) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={addReminder} className="flex-1">
                    Add Reminder
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderSystem;
