
import React, { useState } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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
    setFormData(prev => ({ ...prev, [field]: value }));
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
    handleInputChange('defaultDialysateStrengths',
      isSelected ? currentStrengths.filter(s => s !== strength) : [...currentStrengths, strength]
    );
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
      toast({ title: t('settingsSaved'), description: t('settingsSavedDesc') });
    } catch (err: any) {
      toast({ title: t('errorSavingSettings'), description: err.message, variant: 'destructive' });
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
          <h2 className="text-2xl font-bold">{t('pdMasterSettings')}</h2>
          <p className="text-muted-foreground">{t('configurePDParams')}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? t('saving') : t('saveSettings')}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>{t('treatmentConfiguration')}</span>
            </CardTitle>
            <CardDescription>{t('basicTreatmentPrefs')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mode">{t('pdMode')}</Label>
              <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAPD">{t('capdFull')}</SelectItem>
                  <SelectItem value="APD">{t('apdFull')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fluidBrand">{t('fluidBrand')}</Label>
              <Input
                id="fluidBrand"
                value={formData.fluidBrand || ''}
                onChange={(e) => handleInputChange('fluidBrand', e.target.value)}
                placeholder="e.g., Baxter, Fresenius"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dwellTime">{t('defaultDwellTime')}</Label>
              <Select
                value={formData.defaultDwellTime?.toString()}
                onValueChange={(value) => handleInputChange('defaultDwellTime', parseFloat(value))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {dwellTimeOptions.map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time} {t('hours')}
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
              <Label htmlFor="pushReminders">{t('enablePushNotifications')}</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>{t('exchangeSchedule')}</span>
            </CardTitle>
            <CardDescription>{t('setDailyExchangeTimes')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('scheduledTimes')}</Label>
              {(formData.scheduledTimes?.length || 0) < 4 && (
                <Button variant="outline" size="sm" onClick={addScheduledTime} className="flex items-center space-x-1">
                  <Plus className="w-3 h-3" />
                  <span>{t('addTime')}</span>
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {(formData.scheduledTimes || []).map((time, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} className="flex-1" />
                  {(formData.scheduledTimes?.length || 0) > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeScheduledTime(index)}>
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              {t('totalExchangesPerDay')}: {formData.scheduledTimes?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="w-5 h-5" />
            <span>{t('defaultDialysateStrengths')}</span>
          </CardTitle>
          <CardDescription>{t('selectDialysateConcentrations')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {dialysateStrengths.map((strength) => (
              <Badge
                key={strength}
                variant={(formData.defaultDialysateStrengths || []).includes(strength) ? "default" : "outline"}
                className={`cursor-pointer p-2 ${
                  (formData.defaultDialysateStrengths || []).includes(strength)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleStrengthToggle(strength)}
              >
                {strength} {t('dextrose')}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{t('clickToToggle')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>{t('treatmentPlan')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('currentVersion')}: {formData.treatmentPlanVersion || 1}</p>
              <p className="text-sm text-muted-foreground">
                {t('lastUpdated')}: {pdSettings ? new Date().toLocaleDateString() : t('never')}
              </p>
            </div>
            <Badge variant="outline">
              {formData.mode} {t('mode')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDSettings;
