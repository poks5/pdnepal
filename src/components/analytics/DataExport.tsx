import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Mail, Share2, Calendar } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';

const DataExport: React.FC = () => {
  const { exportPatientData } = usePatient();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const generateCSVData = (data: any[], headers: string[]) => {
    return [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (exportType: string, description: string) => {
    setIsExporting(exportType);
    try {
      const patientData = exportPatientData();
      const ts = new Date().toISOString().split('T')[0];
      switch (exportType) {
        case 'exchanges_csv':
          downloadFile(generateCSVData(patientData.exchangeLogs || [], ['timestamp', 'drainVolume', 'fillVolume', 'ultrafiltration', 'clarity', 'painLevel', 'exchangeType']), `exchanges_${ts}.csv`, 'text/csv');
          break;
        case 'monthly_report':
          downloadFile(JSON.stringify({ patient: patientData.patientProfile, summary: { totalExchanges: patientData.exchangeLogs?.length || 0, averageUF: patientData.exchangeLogs?.reduce((s: number, l: any) => s + l.ultrafiltration, 0) / (patientData.exchangeLogs?.length || 1), exportDate: new Date().toISOString() }, exchanges: patientData.exchangeLogs }, null, 2), `monthly_report_${ts}.json`, 'application/json');
          break;
        case 'healthcare_summary':
          downloadFile(JSON.stringify({ patientInfo: { name: patientData.patientProfile?.name, dateOfBirth: patientData.patientProfile?.dateOfBirth }, treatmentSummary: { mode: patientData.pdSettings?.mode, exchangesPerDay: patientData.pdSettings?.exchangesPerDay, lastMonth: patientData.exchangeLogs?.slice(0, 30) }, recommendations: ['Regular UF monitoring', 'Maintain aseptic technique'] }, null, 2), `healthcare_summary_${ts}.json`, 'application/json');
          break;
      }
      toast({ title: 'Export Complete ✅', description: `${description} downloaded.` });
    } catch {
      toast({ title: 'Export Failed', description: 'Could not export data.', variant: 'destructive' });
    } finally { setIsExporting(null); }
  };

  const shareViaEmail = () => {
    const d = exportPatientData();
    window.open(`mailto:?subject=${encodeURIComponent('PD Treatment Summary')}&body=${encodeURIComponent(`Patient: ${d.patientProfile?.name}\nTotal Exchanges: ${d.exchangeLogs?.length || 0}\n\nExported from PDsathi.`)}`);
  };

  const options = [
    { id: 'exchanges_csv', title: 'Exchange Logs', desc: 'Detailed CSV for analysis', emoji: '📄', badge: 'CSV', color: 'bg-primary/10 text-primary' },
    { id: 'monthly_report', title: 'Monthly Report', desc: 'Comprehensive summary', emoji: '📊', badge: 'JSON', color: 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]' },
    { id: 'healthcare_summary', title: 'Doctor Summary', desc: 'Clinical summary for consultations', emoji: '🏥', badge: 'Medical', color: 'bg-[hsl(var(--lavender))]/15 text-[hsl(var(--lavender))]' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-foreground">📤 Data Export</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Download and share treatment data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(opt => (
          <Card key={opt.id} className="rounded-2xl border-border/30 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="font-bold text-sm text-foreground">{opt.title}</p>
                    <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                  </div>
                </div>
                <Badge className={`text-[10px] px-2 py-0.5 border-0 font-semibold ${opt.color}`}>{opt.badge}</Badge>
              </div>
              <Button
                onClick={() => handleExport(opt.id, opt.title)}
                disabled={isExporting === opt.id}
                className="w-full h-10 rounded-xl text-sm font-semibold"
                size="sm"
              >
                {isExporting === opt.id ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Exporting…
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export</span>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/30 shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-bold text-foreground mb-3">Quick Share</p>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" size="sm" onClick={shareViaEmail} className="rounded-full gap-1.5 text-xs">
              <Mail className="w-3.5 h-3.5" /> Email Summary
            </Button>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => {
              navigator.share?.({ title: 'PD Treatment Data', text: 'Sharing my PD summary from PDsathi' }).catch(() => toast({ title: 'Share not supported', description: 'Use email instead.' }));
            }}>
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExport;
