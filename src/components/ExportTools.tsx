import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Droplets, FlaskConical, AlertTriangle, Loader2 } from 'lucide-react';

interface ExportToolsProps {
  patientId?: string;
}

const ExportTools: React.FC<ExportToolsProps> = ({ patientId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const targetPatientId = patientId || user?.id;

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${(c ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExchangeLogs = async () => {
    if (!targetPatientId) return;
    setIsExporting('exchanges');
    try {
      const { data, error } = await supabase
        .from('exchange_logs')
        .select('*')
        .eq('patient_id', targetPatientId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const headers = ['Date', 'Type', 'Solution', 'Fill (ml)', 'Drain (ml)', 'UF (ml)', 'BP Sys', 'BP Dia', 'Temp', 'Weight (kg)', 'Pain', 'Clarity', 'Symptoms', 'Notes'];
      const rows = (data || []).map((r: any) => [
        new Date(r.created_at).toLocaleString(),
        r.exchange_type,
        r.solution_type,
        String(r.fill_volume_ml ?? ''),
        String(r.drain_volume_ml ?? ''),
        String(r.ultrafiltration_ml ?? ''),
        String(r.blood_pressure_systolic ?? ''),
        String(r.blood_pressure_diastolic ?? ''),
        String(r.temperature ?? ''),
        String(r.weight_after_kg ?? ''),
        String(r.pain_level ?? ''),
        r.drain_color ?? '',
        (r.symptoms || []).join('; '),
        r.notes ?? '',
      ]);

      downloadCSV(`exchange_logs_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
      toast({ title: 'Export complete', description: `${rows.length} exchange records exported.` });
    } catch (err: any) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsExporting(null);
    }
  };

  const exportLabResults = async () => {
    if (!targetPatientId) return;
    setIsExporting('labs');
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', targetPatientId)
        .order('test_date', { ascending: false });
      if (error) throw error;

      const headers = ['Date', 'Type', 'Hemoglobin', 'Creatinine', 'BUN', 'Potassium', 'Sodium', 'Calcium', 'Phosphorus', 'Albumin', 'Kt/V', 'Notes'];
      const rows = (data || []).map((r: any) => [
        r.test_date,
        r.test_type,
        String(r.hemoglobin ?? ''),
        String(r.creatinine ?? ''),
        String(r.bun ?? ''),
        String(r.potassium ?? ''),
        String(r.sodium ?? ''),
        String(r.calcium ?? ''),
        String(r.phosphorus ?? ''),
        String(r.albumin ?? ''),
        String(r.kt_v ?? ''),
        r.notes ?? '',
      ]);

      downloadCSV(`lab_results_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
      toast({ title: 'Export complete', description: `${rows.length} lab records exported.` });
    } catch (err: any) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsExporting(null);
    }
  };

  const exportAlerts = async () => {
    if (!targetPatientId) return;
    setIsExporting('alerts');
    try {
      const { data, error } = await supabase
        .from('clinical_alerts')
        .select('*')
        .eq('patient_id', targetPatientId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const headers = ['Date', 'Type', 'Severity', 'Title', 'Message', 'Acknowledged'];
      const rows = (data || []).map((r: any) => [
        new Date(r.created_at).toLocaleString(),
        r.alert_type,
        r.severity,
        r.title,
        r.message,
        r.acknowledged ? 'Yes' : 'No',
      ]);

      downloadCSV(`clinical_alerts_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
      toast({ title: 'Export complete', description: `${rows.length} alert records exported.` });
    } catch (err: any) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsExporting(null);
    }
  };

  const exportOptions = [
    {
      id: 'exchanges',
      title: 'Exchange Logs',
      description: 'Volumes, UF, vitals, symptoms for all recorded exchanges',
      icon: <Droplets className="w-5 h-5 text-primary" />,
      badge: 'CSV',
      action: exportExchangeLogs,
    },
    {
      id: 'labs',
      title: 'Lab Results',
      description: 'Blood chemistry, hematology, hormones, and adequacy metrics',
      icon: <FlaskConical className="w-5 h-5 text-[hsl(var(--lavender))]" />,
      badge: 'CSV',
      action: exportLabResults,
    },
    {
      id: 'alerts',
      title: 'Clinical Alerts',
      description: 'All clinical alerts with severity, status, and details',
      icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
      badge: 'CSV',
      action: exportAlerts,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">📥 Export Data</h2>
        <p className="text-xs text-muted-foreground">Download clinical data as CSV for analysis or doctor visits</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportOptions.map((option) => (
          <Card key={option.id} className="rounded-xl border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {option.icon}
                  <CardTitle className="text-sm font-bold">{option.title}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px]">{option.badge}</Badge>
              </div>
              <CardDescription className="text-xs">{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={option.action}
                disabled={isExporting === option.id}
                className="w-full rounded-xl"
                size="sm"
              >
                {isExporting === option.id ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Exporting…</>
                ) : (
                  <><Download className="w-3.5 h-3.5 mr-1.5" /> Export</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExportTools;
