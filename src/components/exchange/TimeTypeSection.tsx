
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExchangeData } from '@/hooks/useExchangeForm';

interface TimeTypeSectionProps {
  formData: ExchangeData;
  updateField: (field: keyof ExchangeData, value: any) => void;
}

export const TimeTypeSection: React.FC<TimeTypeSectionProps> = ({
  formData,
  updateField
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="time">Time</Label>
        <Input
          id="time"
          type="time"
          value={formData.time}
          onChange={(e) => updateField('time', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="type">Exchange Type</Label>
        <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">{t('morning')}</SelectItem>
            <SelectItem value="afternoon">{t('afternoon')}</SelectItem>
            <SelectItem value="evening">{t('evening')}</SelectItem>
            <SelectItem value="night">{t('night')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
