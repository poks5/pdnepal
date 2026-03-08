import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Check, X, Loader2, Clock, Inbox } from 'lucide-react';

interface PendingRequest {
  id: string;
  patient_id: string;
  status: string;
  assigned_at: string;
  request_reason?: string;
  patient_name?: string;
  patient_hospital?: string;
}

const PendingPatientRequests: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctor_patient_assignments')
        .select('*')
        .eq('doctor_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      // Fetch patient names
      const enriched: PendingRequest[] = [];
      for (const req of data || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, hospital')
          .eq('user_id', req.patient_id)
          .maybeSingle();

        enriched.push({
          ...req,
          request_reason: (req as any).request_reason,
          patient_name: profile?.full_name || 'Unknown Patient',
          patient_hospital: profile?.hospital || undefined,
        });
      }
      setRequests(enriched);
    } catch (err: any) {
      toast({ title: 'Error loading requests', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [user]);

  const handleResponse = async (requestId: string, approve: boolean) => {
    setProcessing(requestId);
    try {
      const newStatus = approve ? 'active' : 'rejected';
      const { error } = await supabase
        .from('doctor_patient_assignments')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;
      toast({
        title: approve ? 'Patient accepted' : 'Request declined',
        description: approve ? 'The patient has been added to your care.' : 'The request has been declined.',
      });
      fetchRequests();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Patient Requests
          {requests.length > 0 && (
            <Badge variant="destructive" className="ml-2">{requests.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>Pending patient assignment requests</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-6">
            <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="flex items-start justify-between p-3 rounded-lg border bg-card">
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground">{req.patient_name}</h4>
                  {req.patient_hospital && (
                    <p className="text-xs text-muted-foreground">{req.patient_hospital}</p>
                  )}
                  {req.request_reason && (
                    <p className="text-xs text-muted-foreground italic">"{req.request_reason}"</p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(req.assigned_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponse(req.id, false)}
                    disabled={processing === req.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {processing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleResponse(req.id, true)}
                    disabled={processing === req.id}
                  >
                    {processing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingPatientRequests;
