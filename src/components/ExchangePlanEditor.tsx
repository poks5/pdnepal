
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus, Trash2, Save, Copy } from 'lucide-react';

interface ExchangePlanEditorProps {
  plan?: ExchangePlan;
  onSave: () => void;
  onCancel: () => void;
}

const ExchangePlanEditor: React.FC<ExchangePlanEditorProps> = ({ plan, onSave, onCancel }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { createPlan, updatePlan } = useExchangePlan();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<ExchangePlan>>({
    name: plan?.name || '',
    description: plan?.description || '',
    patientId: plan?.patientId || 'pat1',
    patientName: plan?.patientName || 'Ram Bahadur Gurung',
    doctorId: plan?.doctorId || user?.id || 'doc1',
    schedules: plan?.schedules || [],
    notes: plan?.notes || '',
    modifiedBy: user?.fullName || 'Unknown User'
  });

  const addSchedule = () => {
    const newSchedule: ExchangeSchedule = {
      id: `sched_${Date.now()}`,
      time: '06:00',
      type: 'morning',
      fillVolume: 2000,
      dwellTime: 360,
      solution: 'medium',
      enabled: true
    };

    setFormData(prev => ({
      ...prev,
      schedules: [...(prev.schedules || []), newSchedule]
    }));
  };

  const updateSchedule = (scheduleId: string, updates: Partial<ExchangeSchedule>) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules?.map(schedule => 
        schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
      ) || []
    }));
  };

  const removeSchedule = (scheduleId: string) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules?.filter(schedule => schedule.id !== scheduleId) || []
    }));
  };

  const calculateTotalVolume = () => {
    return formData.schedules?.reduce((total, schedule) => 
      schedule.enabled ? total + schedule.fillVolume : total, 0
    ) || 0;
  };

  const handleSave = () => {
    if (!formData.name || !formData.schedules?.length) {
      toast({
        title: "Validation Error",
        description: "Please provide a name and at least one exchange schedule",
        variant: "destructive"
      });
      return;
    }

    const planData = {
      ...formData,
      totalDailyVolume: calculateTotalVolume(),
      isActive: plan?.isActive || false
    } as ExchangePlan;

    if (plan) {
      updatePlan(plan.id, planData);
      toast({
        title: "Plan Updated",
        description: "Exchange plan has been updated successfully"
      });
    } else {
      createPlan(planData);
      toast({
        title: "Plan Created",
        description: "New exchange plan has been created successfully"
      });
    }

    onSave();
  };

  const getSolutionColor = (solution: string) => {
    switch (solution) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {plan ? 'Edit Exchange Plan' : 'Create New Exchange Plan'}
          </CardTitle>
          <CardDescription>
            Configure the master dialysis exchange schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Standard CAPD Plan"
              />
            </div>
            <div>
              <Label htmlFor="patient">Patient</Label>
              <Input
                id="patient"
                value={formData.patientName}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the exchange plan"
              rows={2}
            />
          </div>

          {/* Exchange Schedules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Exchange Schedule</h3>
              <Button onClick={addSchedule} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Exchange
              </Button>
            </div>

            <div className="space-y-4">
              {formData.schedules?.map((schedule, index) => (
                <Card key={schedule.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => updateSchedule(schedule.id, { time: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={schedule.type} 
                        onValueChange={(value) => updateSchedule(schedule.id, { type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
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
                      <Input
                        type="number"
                        value={schedule.fillVolume}
                        onChange={(e) => updateSchedule(schedule.id, { fillVolume: Number(e.target.value) })}
                        min="500"
                        max="3000"
                        step="100"
                      />
                    </div>

                    <div>
                      <Label>Dwell (min)</Label>
                      <Input
                        type="number"
                        value={schedule.dwellTime}
                        onChange={(e) => updateSchedule(schedule.id, { dwellTime: Number(e.target.value) })}
                        min="60"
                        max="720"
                        step="30"
                      />
                    </div>

                    <div>
                      <Label>Solution</Label>
                      <Select 
                        value={schedule.solution} 
                        onValueChange={(value) => updateSchedule(schedule.id, { solution: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (1.5%)</SelectItem>
                          <SelectItem value="medium">Medium (2.5%)</SelectItem>
                          <SelectItem value="high">High (4.25%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSchedule(schedule.id, { enabled: !schedule.enabled })}
                        className={schedule.enabled ? '' : 'opacity-50'}
                      >
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSchedule(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )) || []}
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Daily Summary</p>
                  <p className="text-sm text-gray-600">
                    {formData.schedules?.filter(s => s.enabled).length || 0} exchanges per day
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {calculateTotalVolume().toLocaleString()}ml
                  </p>
                  <p className="text-sm text-gray-600">Total daily volume</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or instructions for this plan"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {plan ? 'Update Plan' : 'Create Plan'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangePlanEditor;
