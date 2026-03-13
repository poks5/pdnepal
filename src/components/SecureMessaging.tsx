import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Send, Paperclip, Image, FileText, AlertCircle, MessageSquare, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  patient_id: string;
  content: string;
  message_type: string;
  tag: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  is_read: boolean;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
}

const MESSAGE_TAGS = [
  { value: 'general', label: 'General', emoji: '💬' },
  { value: 'symptom', label: 'Symptom', emoji: '🤒' },
  { value: 'catheter', label: 'Catheter Issue', emoji: '🔧' },
  { value: 'lab', label: 'Lab Result', emoji: '🧪' },
  { value: 'emergency', label: 'Emergency', emoji: '🚨' },
];

const SecureMessaging: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState('general');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadContacts();
  }, [user]);

  useEffect(() => {
    if (!selectedContact || !user) return;
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`messages-${selectedContact}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === user.id && msg.recipient_id === selectedContact) ||
          (msg.sender_id === selectedContact && msg.recipient_id === user.id)
        ) {
          setMessages(prev => [...prev, msg]);
          // Mark as read if we're the recipient
          if (msg.recipient_id === user.id) {
            supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', msg.id).then();
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedContact, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContacts = async () => {
    if (!user) return;
    setLoading(true);

    // Get contacts based on role
    let contactIds: string[] = [];
    if (user.role === 'patient') {
      const { data } = await supabase
        .from('doctor_patient_assignments')
        .select('doctor_id')
        .eq('patient_id', user.id)
        .eq('status', 'active');
      contactIds = (data ?? []).map(d => d.doctor_id);
    } else {
      const { data } = await supabase
        .from('doctor_patient_assignments')
        .select('patient_id')
        .eq('doctor_id', user.id)
        .eq('status', 'active');
      contactIds = (data ?? []).map(d => d.patient_id);
    }

    if (contactIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', contactIds);

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', contactIds);

      const contactList: Contact[] = (profiles ?? []).map(p => ({
        id: p.user_id,
        name: p.full_name,
        role: roles?.find(r => r.user_id === p.user_id)?.role || 'patient',
      }));
      setContacts(contactList);
      if (contactList.length > 0 && !selectedContact) {
        setSelectedContact(contactList[0].id);
      }
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    if (!user || !selectedContact) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${selectedContact}),and(sender_id.eq.${selectedContact},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) {
      setMessages(data as Message[]);
      // Mark unread messages as read
      const unread = data.filter(m => m.recipient_id === user.id && !m.is_read);
      if (unread.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in('id', unread.map(m => m.id));
      }
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !selectedContact) return;
    setSending(true);

    const patientId = user.role === 'patient' ? user.id : selectedContact;

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: selectedContact,
      patient_id: patientId,
      content: newMessage.trim(),
      message_type: 'text',
      tag: selectedTag !== 'general' ? selectedTag : null,
    });

    if (!error) {
      setNewMessage('');
    }
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedContact) return;

    const ext = file.name.split('.').pop();
    const path = `messages/${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('clinical-photos')
      .upload(path, file);

    if (uploadError) return;

    const { data: urlData } = supabase.storage.from('clinical-photos').getPublicUrl(path);
    const isImage = file.type.startsWith('image/');
    const patientId = user.role === 'patient' ? user.id : selectedContact;

    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: selectedContact,
      patient_id: patientId,
      content: isImage ? '📷 Image' : `📎 ${file.name}`,
      message_type: isImage ? 'image' : 'file',
      tag: selectedTag !== 'general' ? selectedTag : null,
      attachment_url: urlData.publicUrl,
      attachment_type: file.type,
    });
  };

  const tagInfo = MESSAGE_TAGS.find(t => t.value === selectedTag);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">
          {language === 'en' ? 'Secure Messages' : 'सुरक्षित सन्देशहरू'}
        </h2>
      </div>

      {contacts.length === 0 ? (
        <Card className="rounded-2xl border-border/40">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'No contacts yet. Connect with a doctor to start messaging.'
                : 'अहिलेसम्म कुनै सम्पर्क छैन।'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-280px)] min-h-[400px]">
          {/* Contact List */}
          <div className="w-full md:w-64 shrink-0 space-y-1.5 overflow-y-auto">
            {contacts.map(contact => {
              const unreadCount = messages.filter(m => m.sender_id === contact.id && !m.is_read).length;
              return (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    selectedContact === contact.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-card hover:bg-muted/50 border border-border/30'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{contact.role}</p>
                  </div>
                  {unreadCount > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground text-[10px] h-5 min-w-5 justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Chat Area */}
          <Card className="flex-1 rounded-2xl border-border/30 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {language === 'en' ? 'No messages yet. Start the conversation!' : 'अहिलेसम्म कुनै सन्देश छैन।'}
                </div>
              )}
              {messages.map(msg => {
                const isMine = msg.sender_id === user?.id;
                const tag = MESSAGE_TAGS.find(t => t.value === msg.tag);
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 ${
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted/60 text-foreground rounded-bl-md'
                    }`}>
                      {tag && (
                        <span className={`text-[10px] font-semibold ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'} block mb-1`}>
                          {tag.emoji} {tag.label}
                        </span>
                      )}
                      {msg.attachment_url && msg.message_type === 'image' && (
                        <img src={msg.attachment_url} alt="Attachment" className="rounded-lg mb-2 max-h-48 object-cover" />
                      )}
                      {msg.attachment_url && msg.message_type === 'file' && (
                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline text-xs mb-1">
                          <FileText className="w-3 h-3" /> View attachment
                        </a>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border/30 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-32 h-8 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MESSAGE_TAGS.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">
                        {t.emoji} {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTag === 'emergency' && (
                  <Badge variant="destructive" className="text-[10px] animate-pulse">
                    <AlertCircle className="w-3 h-3 mr-1" /> Emergency
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
                  <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                  </div>
                </label>
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={language === 'en' ? 'Type a message...' : 'सन्देश लेख्नुहोस्...'}
                  className="flex-1 rounded-xl h-9"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  size="icon"
                  className="rounded-xl h-9 w-9 shrink-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SecureMessaging;
