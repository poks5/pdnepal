import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Stethoscope, UserPlus, RefreshCw, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import BrowseDoctors from '@/components/BrowseDoctors';

interface DoctorAssignment {
  id: string;
  doctor_id: string;
  status: string;
  assigned_at: string;
  request_reason?: string;
  doctor_name?: string;
  doctor_hospital?: string;
  doctor_specialization?: string[];
}

const MyDoctor: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentDoctor, setCurrentDoctor] = useState<DoctorAssignment | null>(null);
  const [pendingRequest, setPendingRequest] = useState<DoctorAssignment | null>(null);
  const [showBrowse, setShowBrowse] = useState(false);
  const [showChangeReason, setShowChangeReason] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [selectedNewDoctorId, setSelectedNewDoctorId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctor_patient_assignments')
        .select('*')
        .eq('patient_id', user.id)
        .in('status', ['active', 'pending']);

      if (error) throw error;

      const assignments = data || [];

      // Fetch doctor profiles for each assignment
      for (const assignment of assignments) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, hospital, specialization')
          .eq('user_id', assignment.doctor_id)
          .maybeSingle();

        if (profile) {
          (assignment as any).doctor_name = profile.full_name;
          (assignment as any).doctor_hospital = profile.hospital;
          (assignment as any).doctor_specialization = profile.specialization;
        }
      }

      const active = assignments.find(a => a.status === 'active') as DoctorAssignment | undefined;
      const pending = assignments.find(a => a.status === 'pending') as DoctorAssignment | undefined;

      setCurrentDoctor(active || null);
      setPendingRequest(pending || null);
    } catch (err: any) {
      toast({ title: 'Error loading doctor info', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, [user]);

  const handleRequestDoctor = async (doctorId: string, reason?: string) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('doctor_patient_assignments').insert({
        patient_id: user.id,
        doctor_id: doctorId,
        status: 'pending',
        request_reason: reason || null,
        requested_by: user.id,
      });
      if (error) throw error;
      toast({ title: 'Request sent', description: 'Your doctor request has been submitted. You will be notified once approved.' });
      setShowBrowse(false);
      setShowChangeReason(false);
      setChangeReason('');
      fetchAssignments();
    } catch (err: any) {
      toast({ title: 'Error sending request', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeDoctor = (doctorId: string) => {
    setSelectedNewDoctorId(doctorId);
    setShowBrowse(false);
    setShowChangeReason(true);
  };

  const handleConfirmChange = () => {
    handleRequestDoctor(selectedNewDoctorId, changeReason);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500/15 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending Approval</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Doctor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            My Doctor
          </CardTitle>
          <CardDescription>Your assigned nephrologist</CardDescription>
        </CardHeader>
        <CardContent>
          {currentDoctor ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{currentDoctor.doctor_name || 'Unknown'}</h3>
                  {currentDoctor.doctor_hospital && (
                    <p className="text-sm text-muted-foreground">{currentDoctor.doctor_hospital}</p>
                  )}
                  {currentDoctor.doctor_specialization && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {currentDoctor.doctor_specialization.map(spec => (
                        <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                {statusBadge(currentDoctor.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                Assigned since {new Date(currentDoctor.assigned_at).toLocaleDateString()}
              </p>
              {!pendingRequest && (
                <Button variant="outline" size="sm" onClick={() => setShowBrowse(true)} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Request Doctor Change
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Stethoscope className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground">No doctor assigned yet</p>
                <p className="text-sm text-muted-foreground">Browse and request a nephrologist to manage your treatment</p>
              </div>
              {!pendingRequest && (
                <Button onClick={() => setShowBrowse(true)} className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Browse Doctors
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Request */}
      {pendingRequest && (
        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Pending Request</h4>
                <p className="text-sm text-muted-foreground">
                  You have a pending request to <strong>{pendingRequest.doctor_name || 'a doctor'}</strong>.
                  You'll be notified once the doctor responds.
                </p>
                {pendingRequest.request_reason && (
                  <p className="text-xs text-muted-foreground mt-1">Reason: {pendingRequest.request_reason}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browse Doctors Dialog */}
      <Dialog open={showBrowse} onOpenChange={setShowBrowse}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              {currentDoctor ? 'Request Doctor Change' : 'Choose Your Doctor'}
            </DialogTitle>
          </DialogHeader>
          <BrowseDoctors
            onSelectDoctor={(doctorId) => {
              if (currentDoctor) {
                handleChangeDoctor(doctorId);
              } else {
                handleRequestDoctor(doctorId);
              }
            }}
            currentDoctorId={currentDoctor?.doctor_id}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Change Reason Dialog */}
      <Dialog open={showChangeReason} onOpenChange={setShowChangeReason}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reason for Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Why would you like to change your doctor? (optional)</Label>
              <Textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="e.g., Relocating to a different area, need a specialist..."
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowChangeReason(false)}>Cancel</Button>
              <Button onClick={handleConfirmChange} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyDoctor;
