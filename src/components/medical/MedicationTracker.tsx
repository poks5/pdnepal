import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Plus, Clock, CheckCircle, X } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string[];
  exchangeRelated: boolean;
  lastTaken: string;
  nextDue: string;
  adherence: number;
}

const MedicationTracker: React.FC = () => {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Calcium Carbonate', dosage: '500mg', frequency: 'With meals', timing: ['08:00', '13:00', '19:00'], exchangeRelated: true, lastTaken: new Date(Date.now() - 3 * 3600000).toISOString(), nextDue: new Date(Date.now() + 2 * 3600000).toISOString(), adherence: 85 },
    { id: '2', name: 'Sevelamer', dosage: '800mg', frequency: 'Before exchanges', timing: ['06:00', '12:00', '18:00'], exchangeRelated: true, lastTaken: new Date(Date.now() - 6 * 3600000).toISOString(), nextDue: new Date().toISOString(), adherence: 92 },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', exchangeRelated: false });

  const handleTake = (id: string) => {
    setMedications(prev => prev.map(med => {
      if (med.id !== id) return med;
      const now = new Date();
      const nextTime = med.timing.find(t => { const [h] = t.split(':').map(Number); return h > now.getHours(); }) || med.timing[0];
      const [nh, nm] = nextTime.split(':').map(Number);
      const next = new Date(); next.setHours(nh, nm, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      return { ...med, lastTaken: now.toISOString(), nextDue: next.toISOString() };
    }));
    toast({ title: '✅ Medication Logged', description: 'Intake recorded successfully.' });
  };

  const getStatus = (med: Medication) => {
    const now = Date.now();
    const due = new Date(med.nextDue).getTime();
    if (now > due) return { label: 'Overdue', emoji: '🔴', color: 'bg-destructive/10 text-destructive' };
    if (due - now < 1800000) return { label: 'Due Soon', emoji: '🟡', color: 'bg-[hsl(var(--coral))]/10 text-[hsl(var(--coral))]' };
    return { label: 'On Track', emoji: '🟢', color: 'bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))]' };
  };

  const addMedication = () => {
    if (!newMed.name || !newMed.dosage) { toast({ title: 'Error', description: 'Name and dosage required.', variant: 'destructive' }); return; }
    setMedications(prev => [...prev, { id: Date.now().toString(), ...newMed, timing: ['08:00', '20:00'], lastTaken: '', nextDue: new Date().toISOString(), adherence: 100 }]);
    setNewMed({ name: '', dosage: '', frequency: '', exchangeRelated: false });
    setShowAddForm(false);
    toast({ title: '💊 Medication Added' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">💊 Medications</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track meds & adherence</p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(true)} className="rounded-full gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>

      {/* Medication Cards */}
      <div className="space-y-3">
        {medications.map(med => {
          const status = getStatus(med);
          return (
            <Card key={med.id} className="rounded-2xl border-border/30 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">💊</span>
                    <div>
                      <p className="font-bold text-sm text-foreground">{med.name}</p>
                      <p className="text-[11px] text-muted-foreground">{med.dosage} · {med.frequency}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] px-2 py-0.5 border-0 font-semibold ${status.color}`}>
                    {status.emoji} {status.label}
                  </Badge>
                </div>

                {med.exchangeRelated && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full">🔗 Exchange Related</Badge>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next: {new Date(med.nextDue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Adherence</span>
                    <span className={`font-bold ${med.adherence >= 80 ? 'text-[hsl(var(--mint))]' : 'text-destructive'}`}>{med.adherence}%</span>
                  </div>
                  <Progress value={med.adherence} className="h-2" />
                </div>

                <Button size="sm" onClick={() => handleTake(med.id)} className="w-full rounded-xl h-9 text-xs font-semibold bg-[hsl(var(--mint))] hover:bg-[hsl(var(--mint))]/90 text-white">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Take Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="rounded-2xl border-border/30 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Add Medication</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Name *</Label><Input value={newMed.name} onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Calcium Carbonate" className="mt-1 h-10 rounded-xl text-sm" /></div>
              <div><Label className="text-xs">Dosage *</Label><Input value={newMed.dosage} onChange={e => setNewMed(p => ({ ...p, dosage: e.target.value }))} placeholder="e.g., 500mg" className="mt-1 h-10 rounded-xl text-sm" /></div>
            </div>
            <div><Label className="text-xs">Frequency</Label><Input value={newMed.frequency} onChange={e => setNewMed(p => ({ ...p, frequency: e.target.value }))} placeholder="e.g., With meals" className="mt-1 h-10 rounded-xl text-sm" /></div>
            <Button onClick={addMedication} className="w-full rounded-xl h-10 text-sm font-semibold">Add Medication</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicationTracker;
