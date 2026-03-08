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
import { Calendar, Settings, Hospital, Save, Loader2 } from 'lucide-react';

interface CatheterFormData {
  catheter_type: string;
  catheter_insertion_date: string;
  brand: string;
  batch_number: string;
  placement_method: string;
  hospital: string;
  surgeon_nephrologist: string;
}

const defaultForm: CatheterFormData = {
  catheter_type: 'straight',
  catheter_insertion_date: '',
  brand: '',
  batch_number: '',
  placement_method: 'surgical',
  hospital: '',
  surgeon_nephrologist: '',
};

const CatheterDetails: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CatheterFormData>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  // Load from database
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
          setFormData({
            catheter_type: (data as any).catheter_type || 'straight',
            catheter_insertion_date: (data as any).catheter_insertion_date || '',
            brand: (data as any).brand || '',
            batch_number: (data as any).batch_number || '',
            placement_method: (data as any).placement_method || 'surgical',
            hospital: (data as any).hospital || '',
            surgeon_nephrologist: (data as any).surgeon_nephrologist || '',
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

  const handleInputChange = (field: keyof CatheterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    if (!formData.catheter_insertion_date || !formData.brand) {
      toast({ title: 'Missing Fields', description: 'Please fill placement date and brand.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        patient_id: user.id,
        catheter_type: formData.catheter_type,
        catheter_insertion_date: formData.catheter_insertion_date,
        brand: formData.brand,
        batch_number: formData.batch_number,
        placement_method: formData.placement_method,
        hospital: formData.hospital,
        surgeon_nephrologist: formData.surgeon_nephrologist,
      };

      if (existingId) {
        const { error } = await supabase
          .from('pd_settings')
          .update(payload as any)
          .eq('id', existingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('pd_settings')
          .insert(payload as any)
          .select()
          .single();
        if (error) throw error;
        if (data) setExistingId(data.id);
      }

      toast({ title: 'Catheter Details Saved', description: 'Your catheter information has been saved to the database.' });
    } catch (err: any) {
      console.error('Save error:', err);
      toast({ title: 'Error Saving', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const catheterTypes = [
    { value: 'straight', label: 'Straight Tenckhoff' },
    { value: 'coiled', label: 'Coiled Tenckhoff' },
    { value: 'swan-neck', label: 'Swan-neck Catheter' },
    { value: 'double-cuff', label: 'Double Cuff' },
    { value: 'single-cuff', label: 'Single Cuff' },
  ];

  const placementMethods = [
    { value: 'surgical', label: 'Surgical Placement' },
    { value: 'percutaneous', label: 'Percutaneous' },
    { value: 'laparoscopic', label: 'Laparoscopic' },
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Catheter Details</h2>
          <p className="text-muted-foreground">Manage your peritoneal dialysis catheter information</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Details'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Catheter Information</span>
            </CardTitle>
            <CardDescription>Technical details about your catheter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="placementDate">Placement Date *</Label>
              <Input id="placementDate" type="date" value={formData.catheter_insertion_date} onChange={(e) => handleInputChange('catheter_insertion_date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Catheter Type *</Label>
              <Select value={formData.catheter_type} onValueChange={(v) => handleInputChange('catheter_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {catheterTypes.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input id="brand" value={formData.brand} onChange={(e) => handleInputChange('brand', e.target.value)} placeholder="e.g., Baxter, Fresenius" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input id="batchNumber" value={formData.batch_number} onChange={(e) => handleInputChange('batch_number', e.target.value)} placeholder="Catheter batch/lot number" />
            </div>
          </CardContent>
        </Card>

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
              <Label htmlFor="placementMethod">Placement Method *</Label>
              <Select value={formData.placement_method} onValueChange={(v) => handleInputChange('placement_method', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {placementMethods.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital/Clinic</Label>
              <Input id="hospital" value={formData.hospital} onChange={(e) => handleInputChange('hospital', e.target.value)} placeholder="Where the catheter was placed" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surgeon">Surgeon/Nephrologist</Label>
              <Input id="surgeon" value={formData.surgeon_nephrologist} onChange={(e) => handleInputChange('surgeon_nephrologist', e.target.value)} placeholder="Doctor who performed the procedure" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Current Status</span>
          </CardTitle>
          <CardDescription>Current catheter status and maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
            {formData.catheter_insertion_date && (
              <span className="text-sm text-muted-foreground">
                Placed {new Date(formData.catheter_insertion_date).toLocaleDateString()}
                {' '}({Math.floor((Date.now() - new Date(formData.catheter_insertion_date).getTime()) / (1000 * 60 * 60 * 24))} days ago)
              </span>
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
