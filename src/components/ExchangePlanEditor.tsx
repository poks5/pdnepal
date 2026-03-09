import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useExchangePlan, ExchangePlan, ExchangeSchedule } from '@/contexts/ExchangePlanContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface ExchangePlanEditorProps {
  plan?: ExchangePlan;
  patientId?: string;
  patientName?: string;
  onSave: () => void;
  onCancel: () => void;
}

const ExchangePlanEditor: React.FC<ExchangePlanEditorProps> = ({ plan, patientId, patientName, onSave, onCancel }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { createPlan, updatePlan } = useExchangePlan();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    patientId: plan?.patientId || patientId || '',
    schedules: plan?.schedules || [] as ExchangeSchedule[],
    notes: plan?.notes || '',
  });

  const addSchedule = () => {
    const newSchedule: ExchangeSchedule = {
      id: `sched_${Date.now()}`,
      time: '06:00',
      type: 'morning',
      fillVolume: 2000,
      dwellTime: 360,
      solution: 'medium',
      enabled: true,
    };
    setFormData(prev => ({ ...prev, schedules: [...prev.schedules, newSchedule] }));
  };

  const updateSchedule = (scheduleId: string, updates: Partial<ExchangeSchedule>) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map(s => s.id === scheduleId ? { ...s, ...updates } : s),
    }));
  };

  const removeSchedule = (scheduleId: string) => {
    setFormData(prev => ({ ...prev, schedules: prev.schedules.filter(s => s.id !== scheduleId) }));
  };

  const calculateTotalVolume = () =>
    formData.schedules.filter(s => s.enabled).reduce((sum, s) => sum + s.fillVolume, 0);

  const handleSave = async () => {
    if (!formData.name || !formData.schedules.length) {
      toast({ title: "Validation Error", description: "Please provide a name and at least one exchange schedule", variant: "destructive" });
      return;
    }
    if (!formData.patientId) {
      toast({ title: "Validation Error", description: "No patient selected", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (plan) {
        await updatePlan(plan.id, {
          name: formData.name,
          schedules: formData.schedules,
          notes: formData.notes,
        });
        toast({ title: "Plan Updated", description: "Exchange plan has been updated successfully" });
      } else {
        await createPlan({
          patientId: formData.patientId,
          doctorId: user?.id || '',
          name: formData.name,
          schedules: formData.schedules,
          isActive: false,
          notes: formData.notes,
          totalDailyVolume: calculateTotalVolume(),
        });
        toast({ title: "Plan Created", description: "New exchange plan has been created successfully" });
      }
      onSave();
    } catch (err: any) {
      console.error('Failed to save plan:', err);
      toast({ title: "Save Failed", description: err.message || "Could not save the exchange plan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{plan ? 'Edit Exchange Plan' : 'Create New Exchange Plan'}</CardTitle>
          <CardDescription>Configure the master dialysis exchange schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Standard CAPD Plan" />
            </div>
            <div>
              <Label htmlFor="patient">Patient</Label>
              <Input id="patient" value={patientName || plan?.patientName || formData.patientId} readOnly className="bg-muted" />
            </div>
          </div>

          {/* Exchange Schedules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Exchange Schedule</h3>
              <Button onClick={addSchedule} size="sm"><Plus className="w-4 h-4 mr-2" />Add Exchange</Button>
            </div>
            <div className="space-y-4">
              {formData.schedules.map(schedule => (
                <Card key={schedule.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div>
                      <Label>Time</Label>
                      <Input type="time" value={schedule.time} onChange={e => updateSchedule(schedule.id, { time: e.target.value })} />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={schedule.type} onValueChange={v => updateSchedule(schedule.id, { type: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Volume (ml)</Label>
                      <Input type="number" value={schedule.fillVolume} onChange={e => updateSchedule(schedule.id, { fillVolume: Number(e.target.value) })} min="500" max="3000" step="100" />
                    </div>
                    <div>
                      <Label>Dwell (min)</Label>
                      <Input type="number" value={schedule.dwellTime} onChange={e => updateSchedule(schedule.id, { dwellTime: Number(e.target.value) })} min="60" max="720" step="30" />
                    </div>
                    <div>
                      <Label>Solution</Label>
                      <Select value={schedule.solution} onValueChange={v => updateSchedule(schedule.id, { solution: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (1.5%)</SelectItem>
                          <SelectItem value="medium">Medium (2.5%)</SelectItem>
                          <SelectItem value="high">High (4.25%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => updateSchedule(schedule.id, { enabled: !schedule.enabled })} className={schedule.enabled ? '' : 'opacity-50'}>
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => removeSchedule(schedule.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Daily Summary</p>
                  <p className="text-sm text-muted-foreground">{formData.schedules.filter(s => s.enabled).length} exchanges per day</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{calculateTotalVolume().toLocaleString()}ml</p>
                  <p className="text-sm text-muted-foreground">Total daily volume</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes or instructions" rows={3} />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button onClick={handleSave} className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangePlanEditor;
