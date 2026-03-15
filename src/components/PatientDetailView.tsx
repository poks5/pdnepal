import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, AlertTriangle, FileText, Users, Package, TrendingUp, Droplets, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LabDataManagement from '@/components/LabDataManagement';
import PDProgressIndicator from '@/components/dashboard/PDProgressIndicator';
import { usePrescription } from '@/hooks/usePrescription';

interface PatientDetailViewProps {
  patient: any;
  onBack: () => void;
}

interface ExchangeRow {
  id: string;
  created_at: string;
  drain_volume_ml: number | null;
  fill_volume_ml: number;
  ultrafiltration_ml: number | null;
  drain_color: string | null;
  exchange_type: string;
}

const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient, onBack }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showLabDialog, setShowLabDialog] = useState(false);
  const [exchanges, setExchanges] = useState<ExchangeRow[]>([]);
  const [loadingExchanges, setLoadingExchanges] = useState(true);

  useEffect(() => {
    const fetchExchanges = async () => {
      setLoadingExchanges(true);
      try {
        const { data, error } = await supabase
          .from('exchange_logs')
          .select('id, created_at, drain_volume_ml, fill_volume_ml, ultrafiltration_ml, drain_color, exchange_type')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (error) throw error;
        setExchanges(data || []);
      } catch (err) {
        console.error('Failed to load exchanges:', err);
      } finally {
        setLoadingExchanges(false);
      }
    };
    fetchExchanges();
  }, [patient.id]);

  const complications = exchanges.filter(e => e.drain_color === 'cloudy');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
            <p className="text-muted-foreground">{patient.age > 0 ? `Age ${patient.age} · ` : ''}ID: {patient.id.slice(0, 8)}</p>
          </div>
        </div>
        <Badge className={patient.status === 'good' ? 'bg-emerald-500/10 text-emerald-600' : 
                         patient.status === 'stable' ? 'bg-primary/10 text-primary' : 
                         'bg-destructive/10 text-destructive'}>
          {patient.status}
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
          <TabsList className="inline-flex w-max gap-1">
            <TabsTrigger value="overview"><TrendingUp className="w-4 h-4 mr-1" />Overview</TabsTrigger>
            <TabsTrigger value="exchanges"><Droplets className="w-4 h-4 mr-1" />Exchanges</TabsTrigger>
            <TabsTrigger value="complications"><AlertTriangle className="w-4 h-4 mr-1" />Issues</TabsTrigger>
            <TabsTrigger value="labs"><FileText className="w-4 h-4 mr-1" />Labs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Weekly UF</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{patient.weeklyUF ? `+${(patient.weeklyUF / 1000).toFixed(1)}L` : 'N/A'}</div>
                <p className="text-sm text-muted-foreground">Target: 2.0L/week</p>
                <Progress value={patient.weeklyUF ? Math.min(100, (patient.weeklyUF / 2000) * 100) : 0} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Adherence</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{patient.adherence}%</div>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
                <Progress value={patient.adherence} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Last Exchange</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{patient.lastExchange}</div>
                <p className="text-sm text-muted-foreground">{exchanges.length} total exchanges this week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exchanges">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exchanges</CardTitle>
              <CardDescription>Exchange history from the database</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExchanges ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : exchanges.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No exchange records found</p>
              ) : (
                <div className="space-y-3">
                  {exchanges.map((ex) => (
                    <div key={ex.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {new Date(ex.created_at).toLocaleDateString()} at {new Date(ex.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Drain: {ex.drain_volume_ml ?? 'N/A'}ml | Fill: {ex.fill_volume_ml}ml | UF: {ex.ultrafiltration_ml != null ? (ex.ultrafiltration_ml > 0 ? '+' : '') + ex.ultrafiltration_ml : 'N/A'}ml
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{ex.exchange_type}</Badge>
                          <Badge variant={ex.drain_color === 'clear' ? 'default' : 'destructive'}>
                            {ex.drain_color || 'unknown'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complications">
          <Card>
            <CardHeader>
              <CardTitle>Issues & Complications</CardTitle>
              <CardDescription>Exchanges with abnormal findings</CardDescription>
            </CardHeader>
            <CardContent>
              {complications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No complications found — great!</p>
              ) : (
                <div className="space-y-3">
                  {complications.map((c) => (
                    <div key={c.id} className="border rounded-lg p-4 border-destructive/30 bg-destructive/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Cloudy Effluent</p>
                          <p className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="destructive">Needs Review</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Laboratory Data</CardTitle>
                  <CardDescription>Lab results for {patient.name}</CardDescription>
                </div>
                <Button onClick={() => setShowLabDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Lab Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Access lab data management for this patient.</p>
                <Button onClick={() => setShowLabDialog(true)}>Open Lab Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showLabDialog} onOpenChange={setShowLabDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lab Data — {patient.name}</DialogTitle>
          </DialogHeader>
          <LabDataManagement patientId={patient.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDetailView;
