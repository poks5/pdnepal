import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Settings, Hospital, Save, Loader2, Package } from 'lucide-react';

interface CatheterFormData {
  catheter_type: string;
  catheter_insertion_date: string;
  brand: string;
  catheter_model: string;
  catheter_size_fr: string;
  catheter_length_cm: string;
  catheter_tip_type: string;
  catheter_cuff_type: string;
  batch_number: string;
  placement_method: string;
  hospital: string;
  surgeon_nephrologist: string;
}

const defaultForm: CatheterFormData = {
  catheter_type: '',
  catheter_insertion_date: '',
  brand: '',
  catheter_model: '',
  catheter_size_fr: '',
  catheter_length_cm: '',
  catheter_tip_type: '',
  catheter_cuff_type: '',
  batch_number: '',
  placement_method: 'surgical',
  hospital: '',
  surgeon_nephrologist: '',
};

const CATHETER_BRANDS = [
  { value: 'covidien_argyle', label: 'Covidien (Argyle)' },
  { value: 'meditech', label: 'Meditech' },
  { value: 'baxter', label: 'Baxter' },
  { value: 'other', label: 'Other' },
];

const CATHETER_MODELS = [
  { value: 'tenckhoff_straight', label: 'Tenckhoff Straight' },
  { value: 'tenckhoff_coiled', label: 'Tenckhoff Coiled' },
  { value: 'swan_neck_straight', label: 'Swan Neck Straight' },
  { value: 'swan_neck_coiled', label: 'Swan Neck Coiled' },
  { value: 'other', label: 'Other' },
];

const CATHETER_SIZES = [
  { value: '14', label: '14 Fr (≈4.7 mm)' },
  { value: '15', label: '15 Fr (≈5.0 mm)' },
  { value: '16', label: '16 Fr (≈5.3 mm)' },
  { value: '17', label: '17 Fr (≈5.7 mm)' },
];

const CATHETER_LENGTHS = [
  { value: '38', label: '38 cm' },
  { value: '42', label: '42 cm' },
  { value: '47', label: '47 cm' },
  { value: 'other', label: 'Other' },
];

const CUFF_TYPES = [
  { value: 'single', label: 'Single cuff' },
  { value: 'double', label: 'Double cuff' },
];

const PLACEMENT_METHODS = [
  { value: 'surgical', label: 'Surgical Placement' },
  { value: 'percutaneous', label: 'Percutaneous' },
  { value: 'laparoscopic', label: 'Laparoscopic' },
];

const PRECONFIGURED_OPTIONS = [
  {
    label: 'Covidien (Argyle) — Tenckhoff Straight, Double cuff, 16 Fr',
    data: {
      brand: 'covidien_argyle',
      catheter_model: 'tenckhoff_straight',
      catheter_tip_type: 'straight',
      catheter_cuff_type: 'double',
      catheter_size_fr: '16',
    },
  },
  {
    label: 'Meditech — Straight PD, Double cuff, 15 Fr × 42 cm',
    data: {
      brand: 'meditech',
      catheter_model: 'tenckhoff_straight',
      catheter_tip_type: 'straight',
      catheter_cuff_type: 'double',
      catheter_size_fr: '15',
      catheter_length_cm: '42',
    },
  },
];

const CatheterDetails: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CatheterFormData>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customLength, setCustomLength] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pd_settings')
          .select('*')
          .eq('patient_id', user.id)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setExistingId(data.id);
          const d = data as any;
          setFormData({
            catheter_type: d.catheter_type || '',
            catheter_insertion_date: d.catheter_insertion_date || '',
            brand: d.brand || '',
            catheter_model: d.catheter_model || '',
            catheter_size_fr: d.catheter_size_fr || '',
            catheter_length_cm: d.catheter_length_cm || '',
            catheter_tip_type: d.catheter_tip_type || '',
            catheter_cuff_type: d.catheter_cuff_type || '',
            batch_number: d.batch_number || '',
            placement_method: d.placement_method || 'surgical',
            hospital: d.hospital || '',
            surgeon_nephrologist: d.surgeon_nephrologist || '',
          });
        }
      } catch (err) {
        console.error('Failed to load catheter details:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (field: keyof CatheterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (index: number) => {
    const preset = PRECONFIGURED_OPTIONS[index].data;
    setFormData(prev => ({ ...prev, ...preset }));
    toast({ title: 'Preset Applied', description: PRECONFIGURED_OPTIONS[index].label });
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.catheter_insertion_date || !formData.brand) {
      toast({ title: 'Missing Fields', description: 'Please fill placement date and brand.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const finalBrand = formData.brand === 'other' ? customBrand : formData.brand;
      const finalModel = formData.catheter_model === 'other' ? customModel : formData.catheter_model;
      const finalLength = formData.catheter_length_cm === 'other' ? customLength : formData.catheter_length_cm;

      const payload = {
        patient_id: user.id,
        catheter_type: formData.catheter_type || formData.catheter_model,
        catheter_insertion_date: formData.catheter_insertion_date,
        brand: finalBrand,
        catheter_model: finalModel,
        catheter_size_fr: formData.catheter_size_fr,
        catheter_length_cm: finalLength,
        catheter_tip_type: formData.catheter_tip_type,
        catheter_cuff_type: formData.catheter_cuff_type,
        batch_number: formData.batch_number,
        placement_method: formData.placement_method,
        hospital: formData.hospital,
        surgeon_nephrologist: formData.surgeon_nephrologist,
      };

      if (existingId) {
        const { error } = await supabase.from('pd_settings').update(payload as any).eq('id', existingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('pd_settings').insert(payload as any).select().single();
        if (error) throw error;
        if (data) setExistingId(data.id);
      }
      toast({ title: 'Catheter Details Saved', description: 'Your catheter information has been saved.' });
    } catch (err: any) {
      console.error('Save error:', err);
      toast({ title: 'Error Saving', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading catheter details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Catheter Details</h2>
          <p className="text-muted-foreground">Manage your peritoneal dialysis catheter information</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Details'}</span>
        </Button>
      </div>

      {/* Preconfigured Catheter Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Quick Select — Common Catheters</span>
          </CardTitle>
          <CardDescription>Select a commonly used catheter to auto-fill specifications</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {PRECONFIGURED_OPTIONS.map((opt, i) => (
            <Button key={i} variant="outline" className="text-left h-auto py-3 whitespace-normal" onClick={() => applyPreset(i)}>
              {opt.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catheter Specification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Catheter Specification</span>
            </CardTitle>
            <CardDescription>Standardized catheter brand, model, and dimensions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Catheter Brand *</Label>
              <Select value={formData.brand} onValueChange={v => handleChange('brand', v)}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {CATHETER_BRANDS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {formData.brand === 'other' && (
                <Input placeholder="Enter brand name" value={customBrand} onChange={e => setCustomBrand(e.target.value)} />
              )}
            </div>

            <div className="space-y-2">
              <Label>Catheter Model / Type *</Label>
              <Select value={formData.catheter_model} onValueChange={v => handleChange('catheter_model', v)}>
                <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>
                  {CATHETER_MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {formData.catheter_model === 'other' && (
                <Input placeholder="Enter model name" value={customModel} onChange={e => setCustomModel(e.target.value)} />
              )}
            </div>

            <div className="space-y-2">
              <Label>Catheter Size</Label>
              <Select value={formData.catheter_size_fr} onValueChange={v => handleChange('catheter_size_fr', v)}>
                <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                <SelectContent>
                  {CATHETER_SIZES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Catheter Length</Label>
              <Select value={formData.catheter_length_cm} onValueChange={v => handleChange('catheter_length_cm', v)}>
                <SelectTrigger><SelectValue placeholder="Select length" /></SelectTrigger>
                <SelectContent>
                  {CATHETER_LENGTHS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {formData.catheter_length_cm === 'other' && (
                <Input placeholder="Enter length in cm" value={customLength} onChange={e => setCustomLength(e.target.value)} />
              )}
            </div>

            <div className="space-y-2">
              <Label>Cuff Type</Label>
              <Select value={formData.catheter_cuff_type} onValueChange={v => handleChange('catheter_cuff_type', v)}>
                <SelectTrigger><SelectValue placeholder="Select cuff type" /></SelectTrigger>
                <SelectContent>
                  {CUFF_TYPES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Batch / Lot Number</Label>
              <Input value={formData.batch_number} onChange={e => handleChange('batch_number', e.target.value)} placeholder="Catheter batch/lot number" />
            </div>
          </CardContent>
        </Card>

        {/* Placement Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hospital className="w-5 h-5" />
              <span>Placement Information</span>
            </CardTitle>
            <CardDescription>Details about the catheter placement procedure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Placement Date *</Label>
              <Input type="date" value={formData.catheter_insertion_date} onChange={e => handleChange('catheter_insertion_date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Placement Method *</Label>
              <Select value={formData.placement_method} onValueChange={v => handleChange('placement_method', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLACEMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hospital / Clinic</Label>
              <Input value={formData.hospital} onChange={e => handleChange('hospital', e.target.value)} placeholder="Where the catheter was placed" />
            </div>
            <div className="space-y-2">
              <Label>Surgeon / Nephrologist</Label>
              <Input value={formData.surgeon_nephrologist} onChange={e => handleChange('surgeon_nephrologist', e.target.value)} placeholder="Doctor who performed the procedure" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Current Status</span>
          </CardTitle>
          <CardDescription>Current catheter status and maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
            {formData.catheter_insertion_date && (
              <span className="text-sm text-muted-foreground">
                Placed {new Date(formData.catheter_insertion_date).toLocaleDateString()}
                {' '}({Math.floor((Date.now() - new Date(formData.catheter_insertion_date).getTime()) / (1000 * 60 * 60 * 24))} days ago)
              </span>
            )}
            {formData.brand && (
              <Badge variant="secondary">
                {CATHETER_BRANDS.find(b => b.value === formData.brand)?.label || formData.brand}
              </Badge>
            )}
            {formData.catheter_size_fr && (
              <Badge variant="outline">
                {CATHETER_SIZES.find(s => s.value === formData.catheter_size_fr)?.label || `${formData.catheter_size_fr} Fr`}
              </Badge>
            )}
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">Maintenance Reminders</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Daily exit site care and inspection</li>
              <li>• Weekly dressing change</li>
              <li>• Monitor for signs of infection</li>
              <li>• Keep exit site dry and clean</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatheterDetails;
