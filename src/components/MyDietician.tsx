import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Apple, UserPlus, RefreshCw, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import BrowseDieticians from '@/components/BrowseDieticians';

interface DieticianAssignment {
  id: string;
  dietician_id: string;
  status: string;
  assigned_at: string;
  request_reason?: string;
  dietician_name?: string;
  dietician_hospital?: string;
}

const MyDietician: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentDietician, setCurrentDietician] = useState<DieticianAssignment | null>(null);
  const [pendingRequest, setPendingRequest] = useState<DieticianAssignment | null>(null);
  const [showBrowse, setShowBrowse] = useState(false);
  const [showChangeReason, setShowChangeReason] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [selectedNewId, setSelectedNewId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dietician_patient_assignments')
        .select('*')
        .eq('patient_id', user.id)
        .in('status', ['active', 'pending']);

      if (error) throw error;
      const assignments = data || [];

      const active = assignments.find(a => a.status === 'active');
      const pending = assignments.find(a => a.status === 'pending');

      if (active) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, hospital')
          .eq('user_id', active.dietician_id)
          .single();

        setCurrentDietician({
          ...active,
          dietician_name: profile?.full_name || 'Unknown',
          dietician_hospital: profile?.hospital || undefined,
        });
      } else {
        setCurrentDietician(null);
      }

      if (pending) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, hospital')
          .eq('user_id', pending.dietician_id)
          .single();

        setPendingRequest({
          ...pending,
          dietician_name: profile?.full_name || 'Unknown',
          dietician_hospital: profile?.hospital || undefined,
        });
      } else {
        setPendingRequest(null);
      }
    } catch (err) {
      console.error('Error fetching dietician assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, [user]);

  const handleRequest = async (dieticianId: string) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('dietician_patient_assignments').insert({
        dietician_id: dieticianId,
        patient_id: user.id,
        requested_by: user.id,
        request_reason: changeReason || null,
        status: 'pending',
      });
      if (error) throw error;
      toast({ title: 'Request sent!', description: 'Waiting for dietician approval.' });
      setShowBrowse(false);
      setShowChangeReason(false);
      setChangeReason('');
      fetchAssignments();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Apple className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">My Dietician</h2>
      </div>

      {currentDietician ? (
        <Card className="rounded-2xl border-border/30 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--peach))]/15 flex items-center justify-center">
                  <span className="text-2xl">🥗</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{currentDietician.dietician_name}</h3>
                  {currentDietician.dietician_hospital && (
                    <p className="text-sm text-muted-foreground">{currentDietician.dietician_hospital}</p>
                  )}
                  <Badge className="mt-1 bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))] border-[hsl(var(--mint))]/20">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setShowBrowse(true); }} className="rounded-xl">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Change
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-border/30">
          <CardContent className="p-8 text-center">
            <Apple className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold text-foreground mb-1">No Dietician Connected</h3>
            <p className="text-sm text-muted-foreground mb-4">Connect with a dietician for personalized nutrition guidance.</p>
            <Button onClick={() => setShowBrowse(true)} className="rounded-xl">
              <UserPlus className="w-4 h-4 mr-2" /> Find a Dietician
            </Button>
          </CardContent>
        </Card>
      )}

      {pendingRequest && (
        <Card className="rounded-2xl border-[hsl(var(--peach))]/30 bg-[hsl(var(--peach))]/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[hsl(var(--peach))]" />
            <div>
              <p className="text-sm font-semibold text-foreground">Pending request to {pendingRequest.dietician_name}</p>
              <p className="text-xs text-muted-foreground">Waiting for approval</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showBrowse} onOpenChange={setShowBrowse}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Find a Dietician</DialogTitle>
          </DialogHeader>
          <BrowseDieticians
            onSelectDietician={(id) => {
              if (currentDietician) {
                setSelectedNewId(id);
                setShowChangeReason(true);
              } else {
                handleRequest(id);
              }
            }}
            currentDieticianId={currentDietician?.dietician_id}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showChangeReason} onOpenChange={setShowChangeReason}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reason for Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Why do you want to change your dietician?</Label>
            <Textarea value={changeReason} onChange={e => setChangeReason(e.target.value)} placeholder="Optional reason..." rows={3} className="rounded-xl" />
            <Button onClick={() => handleRequest(selectedNewId)} disabled={submitting} className="w-full rounded-xl">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyDietician;
