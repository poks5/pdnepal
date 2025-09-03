
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Bell, Users } from 'lucide-react';

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

const CommentSystem: React.FC = () => {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState('1');
  const [message, setMessage] = useState('');
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [notifyCaregiver, setNotifyCaregiver] = useState(true);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      patientId: '1',
      patientName: 'Ram Bahadur Gurung',
      message: 'Please monitor UF volumes closely over the next few days. Consider increasing dwell time if volumes remain low.',
      timestamp: '2024-06-16T09:30:00Z',
      notifyPatient: true,
      notifyCaregiver: true,
      doctorName: 'Dr. Sharma'
    },
    {
      id: '2',
      patientId: '3',
      patientName: 'Krishna Prasad Oli',
      message: 'Urgent: Please come in for evaluation due to cloudy effluent. Bring fluid sample if possible.',
      timestamp: '2024-06-16T08:45:00Z',
      notifyPatient: true,
      notifyCaregiver: true,
      doctorName: 'Dr. Sharma'
    }
  ]);

  const patients = [
    { id: '1', name: 'Ram Bahadur Gurung' },
    { id: '2', name: 'Sita Devi Sharma' },
    { id: '3', name: 'Krishna Prasad Oli' },
  ];

  const handleSendComment = () => {
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    const patientName = patients.find(p => p.id === selectedPatient)?.name || '';
    
    const newComment: Comment = {
      id: Date.now().toString(),
      patientId: selectedPatient,
      patientName,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      notifyPatient,
      notifyCaregiver,
      doctorName: 'Dr. Sharma'
    };

    setComments(prev => [newComment, ...prev]);
    setMessage('');

    // Show notifications based on settings
    const notifications = [];
    if (notifyPatient) notifications.push('patient');
    if (notifyCaregiver) notifications.push('caregiver');

    toast({
      title: "Message Sent",
      description: `Message sent to ${patientName}${notifications.length > 0 ? ` with push notifications to ${notifications.join(' and ')}` : ''}.`,
    });

    console.log('Comment sent:', newComment);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Patient Communication</h2>
        <p className="text-gray-600">Send messages and instructions to patients and caregivers</p>
      </div>

      {/* Send New Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Send Message</span>
          </CardTitle>
          <CardDescription>Send instructions or comments to patients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient-select">Select Patient</Label>
            <select
              id="patient-select"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message or instructions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label>Notification Settings</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-patient"
                  checked={notifyPatient}
                  onCheckedChange={(checked) => setNotifyPatient(checked as boolean)}
                />
                <Label htmlFor="notify-patient" className="text-sm font-normal">
                  Notify Patient
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-caregiver"
                  checked={notifyCaregiver}
                  onCheckedChange={(checked) => setNotifyCaregiver(checked as boolean)}
                />
                <Label htmlFor="notify-caregiver" className="text-sm font-normal">
                  Notify Caregiver
                </Label>
              </div>
            </div>
          </div>

          <Button onClick={handleSendComment} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Previously sent messages and communications</CardDescription>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages sent yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{comment.patientName}</h4>
                      <p className="text-sm text-gray-600">{formatTimestamp(comment.timestamp)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {comment.notifyPatient && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          <Bell className="w-3 h-3 mr-1" />
                          Patient
                        </span>
                      )}
                      {comment.notifyCaregiver && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <Users className="w-3 h-3 mr-1" />
                          Caregiver
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{comment.message}</p>
                  <p className="text-xs text-gray-500 mt-2">Sent by {comment.doctorName}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentSystem;
