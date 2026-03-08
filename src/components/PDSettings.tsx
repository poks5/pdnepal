
import React, { useState } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Clock, Droplets, Bell, Save, Plus, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDSettings as PDSettingsType, DialysateStrength } from '@/types/patient';

const PDSettings: React.FC = () => {
  const { pdSettings, updatePDSettings, patientProfile } = usePatient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<PDSettingsType>>(
    pdSettings || {
      mode: 'CAPD',
      fluidBrand: '',
      exchangesPerDay: 4,
      scheduledTimes: ['06:00', '12:00', '18:00', '22:00'],
      pushReminders: true,
      defaultDialysateStrengths: ['1.5%'],
      defaultDwellTime: 4,
      treatmentPlanVersion: 1
    }
  );

  const handleInputChange = (field: keyof PDSettingsType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeChange = (index: number, time: string) => {
    const newTimes = [...(formData.scheduledTimes || [])];
    newTimes[index] = time;
    handleInputChange('scheduledTimes', newTimes);
  };

  const addScheduledTime = () => {
    const currentTimes = formData.scheduledTimes || [];
    if (currentTimes.length < 4) {
      handleInputChange('scheduledTimes', [...currentTimes, '12:00']);
    }
  };

  const removeScheduledTime = (index: number) => {
    const newTimes = (formData.scheduledTimes || []).filter((_, i) => i !== index);
    handleInputChange('scheduledTimes', newTimes);
    handleInputChange('exchangesPerDay', newTimes.length as 1 | 2 | 3 | 4);
  };

  const handleStrengthToggle = (strength: DialysateStrength) => {
    const currentStrengths = formData.defaultDialysateStrengths || [];
    const isSelected = currentStrengths.includes(strength);
    
    if (isSelected) {
      handleInputChange('defaultDialysateStrengths', 
        currentStrengths.filter(s => s !== strength)
      );
    } else {
      handleInputChange('defaultDialysateStrengths', 
        [...currentStrengths, strength]
      );
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsData: PDSettingsType = {
        id: pdSettings?.id || '',
        patientId: patientProfile?.id || '',
        mode: formData.mode || 'CAPD',
        fluidBrand: formData.fluidBrand || '',
        exchangesPerDay: (formData.scheduledTimes?.length || 4) as 1 | 2 | 3 | 4,
        scheduledTimes: formData.scheduledTimes || [],
        pushReminders: formData.pushReminders || false,
        defaultDialysateStrengths: formData.defaultDialysateStrengths || [],
        defaultDwellTime: formData.defaultDwellTime || 4,
        treatmentPlanVersion: (pdSettings?.treatmentPlanVersion || 0) + 1
      };
      await updatePDSettings(settingsData);
      toast({ title: 'Settings Saved ✅', description: 'Your PD settings have been saved to the database.' });
    } catch (err: any) {
      toast({ title: 'Error saving settings', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const dwellTimeOptions = [];
  for (let i = 0.5; i <= 15; i += 0.5) {
    dwellTimeOptions.push(i);
  }

  const dialysateStrengths: DialysateStrength[] = ['1.5%', '2.5%', '4.25%'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PD Master Settings</h2>
          <p className="text-gray-600">Configure your peritoneal dialysis treatment parameters</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment Mode & Brand */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Treatment Configuration</span>
            </CardTitle>
            <CardDescription>Basic treatment mode and fluid preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mode">PD Mode</Label>
              <Select
                value={formData.mode}
                onValueChange={(value) => handleInputChange('mode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAPD">CAPD (Continuous Ambulatory)</SelectItem>
                  <SelectItem value="APD">APD (Automated Peritoneal)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fluidBrand">Fluid Brand</Label>
              <Input
                id="fluidBrand"
                value={formData.fluidBrand || ''}
                onChange={(e) => handleInputChange('fluidBrand', e.target.value)}
                placeholder="e.g., Baxter, Fresenius"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dwellTime">Default Dwell Time (hours)</Label>
              <Select
                value={formData.defaultDwellTime?.toString()}
                onValueChange={(value) => handleInputChange('defaultDwellTime', parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dwellTimeOptions.map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time} hours
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="pushReminders"
                checked={formData.pushReminders || false}
                onCheckedChange={(checked) => handleInputChange('pushReminders', checked)}
              />
              <Label htmlFor="pushReminders">Enable push notifications</Label>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Exchange Schedule</span>
            </CardTitle>
            <CardDescription>Set your daily exchange times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Scheduled Times</Label>
              {(formData.scheduledTimes?.length || 0) < 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addScheduledTime}
                  className="flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Time</span>
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {(formData.scheduledTimes || []).map((time, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {(formData.scheduledTimes?.length || 0) > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeScheduledTime(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              Total exchanges per day: {formData.scheduledTimes?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialysate Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="w-5 h-5" />
            <span>Default Dialysate Strengths</span>
          </CardTitle>
          <CardDescription>Select the dialysate concentrations you typically use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {dialysateStrengths.map((strength) => (
              <Badge
                key={strength}
                variant={
                  (formData.defaultDialysateStrengths || []).includes(strength)
                    ? "default"
                    : "outline"
                }
                className={`cursor-pointer p-2 ${
                  (formData.defaultDialysateStrengths || []).includes(strength)
                    ? "bg-blue-100 text-blue-800"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleStrengthToggle(strength)}
              >
                {strength} Dextrose
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Click to toggle. Selected strengths will appear as quick options during exchange logging.
          </p>
        </CardContent>
      </Card>

      {/* Treatment Plan Version */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Treatment Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Version: {formData.treatmentPlanVersion || 1}</p>
              <p className="text-sm text-gray-600">
                Last updated: {pdSettings ? new Date().toLocaleDateString() : 'Never'}
              </p>
            </div>
            <Badge variant="outline">
              {formData.mode} Mode
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDSettings;
