import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Search, Loader2, ChevronDown } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  user_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
}

const AuditLogViewer: React.FC = () => {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setLogs(data);
    setLoading(false);
  };

  const tables = [...new Set(logs.map(l => l.table_name))];

  const filtered = logs.filter(l => {
    if (tableFilter !== 'all' && l.table_name !== tableFilter) return false;
    if (search && !l.action.toLowerCase().includes(search.toLowerCase()) && !l.table_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const actionColors: Record<string, string> = {
    INSERT: 'bg-accent/15 text-accent border-accent/20',
    UPDATE: 'bg-primary/15 text-primary border-primary/20',
    DELETE: 'bg-destructive/15 text-destructive border-destructive/20',
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">
          {language === 'en' ? 'Audit Logs' : 'अडिट लगहरू'}
        </h2>
        <Badge variant="secondary" className="ml-auto text-xs">{filtered.length} {language === 'en' ? 'entries' : 'प्रविष्टिहरू'}</Badge>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search actions...' : 'कार्य खोज्नुहोस्...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl"
          />
        </div>
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-40 h-9 rounded-xl text-xs">
            <SelectValue placeholder="All tables" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'en' ? 'All Tables' : 'सबै तालिका'}</SelectItem>
            {tables.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-border/40 rounded-2xl">
          <CardContent className="p-8 text-center">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'No audit logs found.' : 'कुनै अडिट लग फेला परेन।'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(log => {
            const isExpanded = expandedId === log.id;
            const color = actionColors[log.action] || actionColors.UPDATE;

            return (
              <Card key={log.id} className="border-border/30 rounded-xl overflow-hidden">
                <CardContent className="p-3">
                  <button onClick={() => setExpandedId(isExpanded ? null : log.id)} className="w-full flex items-center gap-2 text-left">
                    <Badge variant="outline" className={`${color} text-[9px] rounded-full shrink-0`}>{log.action}</Badge>
                    <span className="text-xs font-medium text-foreground truncate">{log.table_name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                      {new Date(log.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-border/30 space-y-2">
                      {log.record_id && (
                        <p className="text-[10px] text-muted-foreground">{language === 'en' ? 'Record' : 'रेकर्ड'}: {log.record_id}</p>
                      )}
                      {log.user_id && (
                        <p className="text-[10px] text-muted-foreground">{language === 'en' ? 'User' : 'प्रयोगकर्ता'}: {log.user_id.slice(0, 12)}...</p>
                      )}
                      {log.old_data && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">{language === 'en' ? 'Previous data:' : 'अघिल्लो डाटा:'}</p>
                          <pre className="text-[10px] bg-muted/30 p-2 rounded-lg overflow-x-auto font-mono">{JSON.stringify(log.old_data, null, 2)}</pre>
                        </div>
                      )}
                      {log.new_data && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">{language === 'en' ? 'New data:' : 'नयाँ डाटा:'}</p>
                          <pre className="text-[10px] bg-muted/30 p-2 rounded-lg overflow-x-auto font-mono">{JSON.stringify(log.new_data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filtered.length >= 200 && (
        <p className="text-center text-xs text-muted-foreground">
          {language === 'en' ? 'Showing latest 200 entries' : 'नवीनतम २०० प्रविष्टिहरू देखाउँदै'}
        </p>
      )}
    </div>
  );
};

export default AuditLogViewer;
