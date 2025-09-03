
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';
import { useExchangeForm, ExchangeData } from '@/hooks/useExchangeForm';
import { TimeTypeSection } from '@/components/exchange/TimeTypeSection';
import { VolumeSection } from '@/components/exchange/VolumeSection';
import { AssessmentSection } from '@/components/exchange/AssessmentSection';

interface AddExchangeProps {
  onSave: (data: ExchangeData) => void;
  onCancel: () => void;
}

const AddExchange: React.FC<AddExchangeProps> = ({ onSave, onCancel }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    formData,
    updateField,
    previousFillVolume,
    isUFAutoCalculated,
    setIsUFAutoCalculated
  } = useExchangeForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.drainVolume < 0 || formData.fillVolume <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid volumes",
        variant: "destructive"
      });
      return;
    }

    // Use current UF calculation or fallback to standard calculation
    let finalUF = formData.ultrafiltration;
    if (!finalUF && !isUFAutoCalculated) {
      finalUF = formData.drainVolume - formData.fillVolume;
    }

    const finalData = {
      ...formData,
      ultrafiltration: finalUF
    };

    onSave(finalData);
    toast({
      title: "Exchange Logged",
      description: "Your dialysis exchange has been recorded successfully"
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('addExchange')}</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
        <CardDescription>Record your peritoneal dialysis exchange details</CardDescription>
        {previousFillVolume && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              Previous fill volume: <strong>{previousFillVolume}ml</strong> 
              {isUFAutoCalculated && " (used for UF calculation)"}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TimeTypeSection formData={formData} updateField={updateField} />
          
          <VolumeSection 
            formData={formData} 
            updateField={updateField}
            previousFillVolume={previousFillVolume}
            isUFAutoCalculated={isUFAutoCalculated}
            setIsUFAutoCalculated={setIsUFAutoCalculated}
          />

          <AssessmentSection formData={formData} updateField={updateField} />

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any concerns, symptoms, or observations..."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {t('save')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddExchange;
