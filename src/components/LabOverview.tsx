import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Users, FileText, Loader2 } from 'lucide-react';
import { labRanges } from '@/types/labData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LabOverviewProps {
  patients: any[];
  onViewPatientLabs: (patientId: string) => void;
}

interface LabRow {
  id: string;
  patient_id: string;
  test_date: string;
  test_type: string;
  creatinine: number | null;
  potassium: number | null;
  hemoglobin: number | null;
}

const LabOverview: React.FC<LabOverviewProps> = ({ patients, onViewPatientLabs }) => {
  const { user } = useAuth();
  const [labResults, setLabResults] = useState<LabRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patients.length) { setLoading(false); return; }
    const fetchLabs = async () => {
      setLoading(true);
      try {
        const patientIds = patients.map(p => p.id);
        const { data, error } = await supabase
          .from('lab_results')
          .select('id, patient_id, test_date, test_type, creatinine, potassium, hemoglobin')
          .in('patient_id', patientIds)
          .order('test_date', { ascending: false })
          .limit(50);
        if (error) throw error;
        setLabResults(data || []);
      } catch (err) {
        console.error('Failed to load lab results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, [patients]);

  const getParameterStatus = (parameter: string, value: number) => {
    const range = labRanges.find(r => r.parameter === parameter);
    if (!range || !value) return 'normal';
    if (value < range.min) return 'low';
    if (value > range.max) return 'high';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-primary/10 text-primary';
      case 'high': return 'bg-destructive/10 text-destructive';
      default: return 'bg-emerald-500/10 text-emerald-600';
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown';
  };

  const abnormalResults = labResults.filter(lab => {
    return ['creatinine', 'potassium', 'hemoglobin'].some(param => {
      const value = lab[param as keyof LabRow] as number;
      return value && getParameterStatus(param, value) !== 'normal';
    });
  });

  const patientsWithLabs = new Set(labResults.map(l => l.patient_id)).size;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Patients</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{patients.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">With Lab Results</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{patientsWithLabs}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Abnormal Results</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{abnormalResults.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Lab Records</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{labResults.length}</div></CardContent></Card>
      </div>

      {abnormalResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" />Abnormal Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {abnormalResults.map(lab => (
                <div key={lab.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{getPatientName(lab.patient_id)}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(lab.test_date).toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onViewPatientLabs(lab.patient_id)}>View</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {(['creatinine', 'potassium', 'hemoglobin'] as const).map(param => {
                      const value = lab[param];
                      if (!value) return null;
                      const status = getParameterStatus(param, value);
                      const range = labRanges.find(r => r.parameter === param);
                      return (
                        <div key={param} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{param}:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{value} {range?.unit}</span>
                            {status !== 'normal' && <Badge className={getStatusColor(status)}>{status}</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Recent Lab Results</CardTitle></CardHeader>
        <CardContent>
          {labResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No lab results recorded yet</p>
          ) : (
            <div className="space-y-3">
              {labResults.slice(0, 10).map(lab => (
                <div key={lab.id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <h4 className="font-medium text-foreground">{getPatientName(lab.patient_id)}</h4>
                    <p className="text-sm text-muted-foreground">{new Date(lab.test_date).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onViewPatientLabs(lab.patient_id)}>View</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LabOverview;
