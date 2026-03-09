import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Save, Plus, X, Loader2, Wrench } from 'lucide-react';

interface ConfigItem {
  id: string;
  config_key: string;
  config_value: any;
  category: string;
  description: string | null;
  updated_at: string;
}

const SystemConfigPanel: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchConfigs(); }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('system_config')
      .select('*')
      .order('category', { ascending: true });
    if (data) setConfigs(data);
    setLoading(false);
  };

  const handleEdit = (config: ConfigItem) => {
    setEditingKey(config.config_key);
    setEditValue(JSON.stringify(config.config_value, null, 2));
  };

  const handleSave = async (configKey: string) => {
    setSaving(true);
    try {
      const parsed = JSON.parse(editValue);
      const { error } = await supabase
        .from('system_config')
        .update({ config_value: parsed, updated_by: user?.id })
        .eq('config_key', configKey);
      if (error) throw error;
      toast({ title: language === 'en' ? 'Configuration saved' : 'कन्फिगरेसन सुरक्षित भयो' });
      setEditingKey(null);
      fetchConfigs();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async (configKey: string) => {
    if (!newItem.trim()) return;
    const config = configs.find(c => c.config_key === configKey);
    if (!config || !Array.isArray(config.config_value)) return;
    setSaving(true);
    try {
      const updated = [...config.config_value, newItem.trim()];
      const { error } = await supabase
        .from('system_config')
        .update({ config_value: updated, updated_by: user?.id })
        .eq('config_key', configKey);
      if (error) throw error;
      setNewItem('');
      fetchConfigs();
      toast({ title: language === 'en' ? 'Item added' : 'वस्तु थपियो' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveItem = async (configKey: string, index: number) => {
    const config = configs.find(c => c.config_key === configKey);
    if (!config || !Array.isArray(config.config_value)) return;
    const updated = config.config_value.filter((_: any, i: number) => i !== index);
    const { error } = await supabase
      .from('system_config')
      .update({ config_value: updated, updated_by: user?.id })
      .eq('config_key', configKey);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      fetchConfigs();
    }
  };

  const friendlyName = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  const grouped = configs.reduce<Record<string, ConfigItem[]>>((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">
          {language === 'en' ? 'Clinical Configuration' : 'क्लिनिकल कन्फिगरेसन'}
        </h2>
      </div>
      <p className="text-xs text-muted-foreground">
        {language === 'en' ? 'Configure system-wide clinical values. Changes take effect immediately.' : 'प्रणाली-व्यापी क्लिनिकल मानहरू कन्फिगर गर्नुहोस्।'}
      </p>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {friendlyName(category)}
          </p>
          {items.map(config => {
            const isArray = Array.isArray(config.config_value);
            const isEditing = editingKey === config.config_key;

            return (
              <Card key={config.id} className="border-border/40 rounded-2xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{friendlyName(config.config_key)}</p>
                      {config.description && (
                        <p className="text-[11px] text-muted-foreground">{config.description}</p>
                      )}
                    </div>
                    {!isEditing && !isArray && (
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(config)} className="text-xs">
                        {language === 'en' ? 'Edit JSON' : 'JSON सम्पादन'}
                      </Button>
                    )}
                  </div>

                  {isArray && !isEditing ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(config.config_value as string[]).map((item, i) => (
                          <Badge key={i} variant="secondary" className="gap-1 pr-1 rounded-full text-xs">
                            {item}
                            <button
                              onClick={() => handleRemoveItem(config.config_key, i)}
                              className="ml-0.5 hover:bg-destructive/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder={language === 'en' ? 'Add new item...' : 'नयाँ वस्तु थप्नुहोस्...'}
                          value={newItem}
                          onChange={e => setNewItem(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddItem(config.config_key)}
                          className="h-8 text-sm rounded-xl"
                        />
                        <Button size="sm" onClick={() => handleAddItem(config.config_key)} disabled={saving} className="rounded-xl h-8">
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-full h-40 p-3 text-xs font-mono bg-muted/50 border border-border rounded-xl resize-y"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setEditingKey(null)} className="rounded-xl">
                          {language === 'en' ? 'Cancel' : 'रद्द'}
                        </Button>
                        <Button size="sm" onClick={() => handleSave(config.config_key)} disabled={saving} className="rounded-xl gap-1">
                          <Save className="w-3.5 h-3.5" /> {language === 'en' ? 'Save' : 'सुरक्षित'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-xl p-3">
                      <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono">
                        {JSON.stringify(config.config_value, null, 2)}
                      </pre>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground">
                    {language === 'en' ? 'Updated' : 'अपडेट'}: {new Date(config.updated_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SystemConfigPanel;
