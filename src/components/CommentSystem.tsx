import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Send, Bell, Users, Inbox } from 'lucide-react';

interface Comment {
  id: string;
  patientId: string;
  patientName: string;
  message: string;
  timestamp: string;
  notifyPatient: boolean;
  notifyCaregiver: boolean;
  doctorName: string;
}

interface CommentSystemProps {
  patients?: { id: string; name: string }[];
}

const CommentSystem: React.FC<CommentSystemProps> = ({ patients = [] }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.id || '');
  const [message, setMessage] = useState('');
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [notifyCaregiver, setNotifyCaregiver] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);

  const handleSendComment = () => {
    if (!message.trim()) {
      toast({ title: "Empty Message", description: "Please enter a message.", variant: "destructive" });
      return;
    }

    const patientName = patients.find(p => p.id === selectedPatient)?.name || 'Unknown';
    
    const newComment: Comment = {
      id: Date.now().toString(),
      patientId: selectedPatient,
      patientName,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      notifyPatient,
      notifyCaregiver,
      doctorName: user?.fullName || 'Doctor',
    };

    setComments(prev => [newComment, ...prev]);
    setMessage('');

    toast({
      title: "Message Sent",
      description: `Message sent to ${patientName}.`,
    });
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No assigned patients to message</p>
        <p className="text-xs text-muted-foreground mt-1">Accept patient requests first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" /><span>Send Message</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Patient</Label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter instructions..." rows={4} />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="notify-patient" checked={notifyPatient} onCheckedChange={(c) => setNotifyPatient(c as boolean)} />
              <Label htmlFor="notify-patient" className="text-sm font-normal">Notify Patient</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="notify-caregiver" checked={notifyCaregiver} onCheckedChange={(c) => setNotifyCaregiver(c as boolean)} />
              <Label htmlFor="notify-caregiver" className="text-sm font-normal">Notify Caregiver</Label>
            </div>
          </div>
          <Button onClick={handleSendComment} className="w-full"><Send className="w-4 h-4 mr-2" />Send</Button>
        </CardContent>
      </Card>

      {comments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Messages</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{comment.patientName}</h4>
                      <p className="text-sm text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {comment.notifyPatient && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"><Bell className="w-3 h-3 mr-1" />Patient</span>}
                      {comment.notifyCaregiver && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-600"><Users className="w-3 h-3 mr-1" />Caregiver</span>}
                    </div>
                  </div>
                  <p className="text-foreground bg-muted p-3 rounded">{comment.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">Sent by {comment.doctorName}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommentSystem;
