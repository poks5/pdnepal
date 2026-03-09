import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { History, Lock, Unlock, Search, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RecordVersion {
  id: string;
  table_name: string;
  record_id: string;
  version_number: number;
  old_data: any;
  new_data: any;
  changed_by: string;
  changed_at: string;
  change_reason: string | null;
}

interface RecordLock {
  id: string;
  table_name: string;
  record_id: string;
  locked_by: string;
  locked_at: string;
  lock_reason: string | null;
}

const RecordVersionHistory: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [versions, setVersions] = useState<RecordVersion[]>([]);
  const [locks, setLocks] = useState<RecordLock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTable, setSearchTable] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'versions' | 'locks'>('versions');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [versionsRes, locksRes] = await Promise.all([
      supabase.from('record_versions').select('*').order('changed_at', { ascending: false }).limit(100),
      supabase.from('record_locks').select('*').order('locked_at', { ascending: false }),
    ]);
    if (versionsRes.data) setVersions(versionsRes.data);
    if (locksRes.data) setLocks(locksRes.data);
    setLoading(false);
  };

  const handleLock = async (tableName: string, recordId: string, reason: string) => {
    if (!user) return;
    const { error } = await supabase.from('record_locks').insert({
      table_name: tableName,
      record_id: recordId,
      locked_by: user.id,
      lock_reason: reason || 'Finalized for research',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'en' ? 'Record locked' : 'रेकर्ड लक भयो' });
      fetchData();
    }
  };

  const handleUnlock = async (lockId: string) => {
    const { error } = await supabase.from('record_locks').delete().eq('id', lockId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: language === 'en' ? 'Record unlocked' : 'रेकर्ड अनलक भयो' });
      fetchData();
    }
  };

  const filteredVersions = searchTable
    ? versions.filter(v => v.table_name.toLowerCase().includes(searchTable.toLowerCase()))
    : versions;

  const getChangedFields = (old_data: any, new_data: any) => {
    if (!old_data || !new_data) return [];
    const changes: { field: string; from: string; to: string }[] = [];
    for (const key of Object.keys(new_data)) {
      if (key === 'updated_at') continue;
      const oldVal = JSON.stringify(old_data[key]);
      const newVal = JSON.stringify(new_data[key]);
      if (oldVal !== newVal) {
        changes.push({ field: key, from: old_data[key]?.toString() || '—', to: new_data[key]?.toString() || '—' });
      }
    }
    return changes;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Tab toggle */}
      <div className="flex gap-2">
        <Button variant={tab === 'versions' ? 'default' : 'outline'} size="sm" onClick={() => setTab('versions')} className="rounded-xl gap-1">
          <History className="w-3.5 h-3.5" /> {language === 'en' ? 'Version History' : 'संस्करण इतिहास'}
          <Badge variant="secondary" className="ml-1 text-[10px] h-4">{versions.length}</Badge>
        </Button>
        <Button variant={tab === 'locks' ? 'default' : 'outline'} size="sm" onClick={() => setTab('locks')} className="rounded-xl gap-1">
          <Lock className="w-3.5 h-3.5" /> {language === 'en' ? 'Locked Records' : 'लक रेकर्ड'}
          <Badge variant="secondary" className="ml-1 text-[10px] h-4">{locks.length}</Badge>
        </Button>
      </div>

      {tab === 'versions' ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === 'en' ? 'Filter by table name...' : 'तालिका नामले फिल्टर गर्नुहोस्...'}
              value={searchTable}
              onChange={e => setSearchTable(e.target.value)}
              className="pl-9 h-9 rounded-xl"
            />
          </div>

          {filteredVersions.length === 0 ? (
            <Card className="border-border/40 rounded-2xl">
              <CardContent className="p-8 text-center">
                <History className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'No version history yet. Changes to clinical records will appear here.' : 'अहिलेसम्म कुनै संस्करण इतिहास छैन।'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredVersions.map(v => {
              const changes = getChangedFields(v.old_data, v.new_data);
              const isExpanded = expandedId === v.id;
              const isLocked = locks.some(l => l.table_name === v.table_name && l.record_id === v.record_id);

              return (
                <Card key={v.id} className="border-border/40 rounded-2xl overflow-hidden">
                  <CardContent className="p-3 space-y-2">
                    <button onClick={() => setExpandedId(isExpanded ? null : v.id)} className="w-full flex items-center gap-3 text-left">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] rounded-full">{v.table_name}</Badge>
                          <span className="text-[10px] text-muted-foreground">v{v.version_number}</span>
                          {isLocked && <Lock className="w-3 h-3 text-destructive" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {changes.length} {language === 'en' ? 'field(s) changed' : 'फिल्ड परिवर्तन'} · {new Date(v.changed_at).toLocaleString()}
                        </p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="space-y-2 pt-2 border-t border-border/30">
                        {changes.map((c, i) => (
                          <div key={i} className="bg-muted/30 rounded-xl p-2.5 text-xs">
                            <p className="font-semibold text-foreground">{c.field}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-destructive/70 line-through">{c.from}</span>
                              <span className="text-accent">→ {c.to}</span>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-1">
                          <p className="text-[10px] text-muted-foreground">
                            {language === 'en' ? 'Record' : 'रेकर्ड'}: {v.record_id.slice(0, 8)}...
                          </p>
                          {!isLocked && (
                            <Button size="sm" variant="outline" className="text-[10px] h-7 rounded-lg gap-1"
                              onClick={() => handleLock(v.table_name, v.record_id, 'Finalized')}>
                              <Lock className="w-3 h-3" /> {language === 'en' ? 'Lock Record' : 'रेकर्ड लक'}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {locks.length === 0 ? (
            <Card className="border-border/40 rounded-2xl">
              <CardContent className="p-8 text-center">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'No locked records.' : 'कुनै लक रेकर्ड छैन।'}
                </p>
              </CardContent>
            </Card>
          ) : (
            locks.map(lock => (
              <Card key={lock.id} className="border-destructive/20 bg-destructive/5 rounded-2xl">
                <CardContent className="p-3 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] rounded-full">{lock.table_name}</Badge>
                      <span className="text-[10px] text-muted-foreground">{lock.record_id.slice(0, 8)}...</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {lock.lock_reason || 'No reason'} · {new Date(lock.locked_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1" onClick={() => handleUnlock(lock.id)}>
                    <Unlock className="w-3 h-3" /> {language === 'en' ? 'Unlock' : 'अनलक'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RecordVersionHistory;
