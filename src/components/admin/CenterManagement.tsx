import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Plus, Edit2, Loader2 } from 'lucide-react';

interface Center {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

const CenterManagement: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editCenter, setEditCenter] = useState<Center | null>(null);
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCenters(); }, []);

  const fetchCenters = async () => {
    setLoading(true);
    const { data } = await supabase.from('centers').select('*').order('name');
    if (data) setCenters(data);
    setLoading(false);
  };

  const openCreate = () => {
    setEditCenter(null);
    setForm({ name: '', code: '', address: '', phone: '', email: '' });
    setShowDialog(true);
  };

  const openEdit = (center: Center) => {
    setEditCenter(center);
    setForm({ name: center.name, code: center.code, address: center.address || '', phone: center.phone || '', email: center.email || '' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast({ title: language === 'en' ? 'Name and code required' : 'नाम र कोड आवश्यक', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editCenter) {
        const { error } = await supabase.from('centers').update({
          name: form.name, code: form.code, address: form.address || null,
          phone: form.phone || null, email: form.email || null,
        }).eq('id', editCenter.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('centers').insert({
          name: form.name, code: form.code, address: form.address || null,
          phone: form.phone || null, email: form.email || null,
        });
        if (error) throw error;
      }
      toast({ title: language === 'en' ? 'Center saved' : 'केन्द्र सुरक्षित भयो' });
      setShowDialog(false);
      fetchCenters();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (center: Center) => {
    const { error } = await supabase.from('centers').update({ is_active: !center.is_active }).eq('id', center.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      fetchCenters();
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            {language === 'en' ? 'Dialysis Centers' : 'डायलाइसिस केन्द्रहरू'}
          </h2>
        </div>
        <Button size="sm" onClick={openCreate} className="rounded-xl gap-1">
          <Plus className="w-3.5 h-3.5" /> {language === 'en' ? 'Add Center' : 'केन्द्र थप्नुहोस्'}
        </Button>
      </div>

      {centers.length === 0 ? (
        <Card className="border-border/40 rounded-2xl">
          <CardContent className="p-8 text-center">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'No centers yet. Add your first dialysis center.' : 'अहिलेसम्म कुनै केन्द्र छैन।'}
            </p>
            <Button size="sm" onClick={openCreate} className="mt-3 rounded-xl gap-1">
              <Plus className="w-3.5 h-3.5" /> {language === 'en' ? 'Add Center' : 'केन्द्र थप्नुहोस्'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {centers.map(center => (
            <Card key={center.id} className={`border-border/40 rounded-2xl ${!center.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{center.name}</p>
                    <Badge variant="outline" className="text-[10px] rounded-full">{center.code}</Badge>
                    {!center.is_active && (
                      <Badge variant="secondary" className="text-[10px]">{language === 'en' ? 'Inactive' : 'निष्क्रिय'}</Badge>
                    )}
                  </div>
                  {center.address && <p className="text-[11px] text-muted-foreground mt-0.5">{center.address}</p>}
                  <div className="flex gap-3 mt-1">
                    {center.phone && <span className="text-[10px] text-muted-foreground">📞 {center.phone}</span>}
                    {center.email && <span className="text-[10px] text-muted-foreground">✉️ {center.email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={center.is_active} onCheckedChange={() => toggleActive(center)} />
                  <Button variant="ghost" size="sm" onClick={() => openEdit(center)} className="h-8 w-8 p-0">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editCenter
                ? (language === 'en' ? 'Edit Center' : 'केन्द्र सम्पादन')
                : (language === 'en' ? 'Add New Center' : 'नयाँ केन्द्र थप्नुहोस्')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>{language === 'en' ? 'Center Name' : 'केन्द्रको नाम'} *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl" /></div>
            <div><Label>{language === 'en' ? 'Center Code' : 'केन्द्र कोड'} *</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. KMC, PKR" className="rounded-xl" /></div>
            <div><Label>{language === 'en' ? 'Address' : 'ठेगाना'}</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{language === 'en' ? 'Phone' : 'फोन'}</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="rounded-xl" /></div>
              <div><Label>{language === 'en' ? 'Email' : 'इमेल'}</Label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-xl">{language === 'en' ? 'Cancel' : 'रद्द'}</Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-1">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {language === 'en' ? 'Save' : 'सुरक्षित गर्नुहोस्'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CenterManagement;
