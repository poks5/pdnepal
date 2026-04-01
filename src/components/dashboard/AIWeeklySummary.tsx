import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DailyExchangeLog } from '@/types/patient';
import { usePrescription } from '@/hooks/usePrescription';

interface AIWeeklySummaryProps {
  allExchangeLogs: DailyExchangeLog[];
}

const AIWeeklySummary: React.FC<AIWeeklySummaryProps> = ({ allExchangeLogs }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { dailyExchanges } = usePrescription(user?.id);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      // Compute last 7 days stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const thisWeek = allExchangeLogs.filter(
        (e) => new Date(e.timestamp) >= weekAgo
      );
      const lastWeek = allExchangeLogs.filter(
        (e) => new Date(e.timestamp) >= twoWeeksAgo && new Date(e.timestamp) < weekAgo
      );

      const thisWeekUF = thisWeek.length > 0
        ? Math.round(thisWeek.reduce((s, e) => s + e.ultrafiltration, 0) / thisWeek.length)
        : 0;
      const lastWeekUF = lastWeek.length > 0
        ? Math.round(lastWeek.reduce((s, e) => s + e.ultrafiltration, 0) / lastWeek.length)
        : 0;

      const thisWeekDays = new Set(thisWeek.map((e) => new Date(e.timestamp).toDateString())).size;
      const adherence = Math.round((thisWeek.length / (dailyExchanges * 7)) * 100);

      const prompt = `You are a friendly PD (Peritoneal Dialysis) health assistant. Generate a brief, encouraging weekly summary for a patient.

Data for this week:
- Exchanges completed: ${thisWeek.length}
- Prescribed daily exchanges: ${dailyExchanges}
- Active days: ${thisWeekDays}/7
- Adherence rate: ${adherence}%
- Average ultrafiltration: ${thisWeekUF}ml
- Last week average UF: ${lastWeekUF}ml
- Pain reports this week: ${thisWeek.filter((e) => e.painLevel > 3).length}

${language === 'ne' ? 'Respond in Nepali language.' : 'Respond in English.'}

Keep it to 3-4 sentences. Be warm, encouraging, and include one actionable tip. Use simple language. Include relevant emoji.`;

      const { data, error: fnError } = await supabase.functions.invoke('ai-weekly-summary', {
        body: { prompt },
      });

      if (fnError) throw fnError;
      setSummary(data?.summary || 'Unable to generate summary at this time.');
    } catch (err: any) {
      console.error('AI Summary error:', err);
      setError('Could not generate summary. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, allExchangeLogs, dailyExchanges, language]);

  // Auto-generate on first render if enough data
  React.useEffect(() => {
    if (!summary && !loading && allExchangeLogs.length >= 3) {
      generateSummary();
    }
  }, [allExchangeLogs.length]); // eslint-disable-line

  if (allExchangeLogs.length < 3) return null;

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--lavender))]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[hsl(var(--lavender))]" />
            </div>
            <span>Weekly Insight</span>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Sparkles className="w-3 h-3" /> AI
          </Badge>
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center gap-3 p-4">
              <div className="animate-spin">
                <RefreshCw className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Analyzing your week...</p>
            </div>
          ) : error ? (
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs" onClick={generateSummary}>
                <RefreshCw className="w-3 h-3 mr-1" /> Retry
              </Button>
            </div>
          ) : summary ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(var(--lavender))]/5 to-primary/5 border border-[hsl(var(--lavender))]/10">
                <p className="text-sm leading-relaxed text-foreground">{summary}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={generateSummary}
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
            </div>
          ) : null}
        </CardContent>
      )}
    </Card>
  );
};

export default AIWeeklySummary;
