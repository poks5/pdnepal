import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, CheckCircle2, Send, Loader2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { learningModules } from './learningContent';
import { useToast } from '@/hooks/use-toast';

interface PatientBasic {
  id: string;
  name: string;
}

const DoctorLearningAssignments: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [patients, setPatients] = useState<PatientBasic[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [existingAssignments, setExistingAssignments] = useState<Set<string>>(new Set());
  const [patientProgress, setPatientProgress] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch assigned patients
  useEffect(() => {
    if (!user) return;
    const fetchPatients = async () => {
      setLoading(true);
      const { data: assignments } = await supabase
        .from('doctor_patient_assignments')
        .select('patient_id')
        .eq('doctor_id', user.id)
        .eq('status', 'active');

      if (!assignments?.length) { setPatients([]); setLoading(false); return; }

      const ids = assignments.map(a => a.patient_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', ids);

      setPatients((profiles || []).map(p => ({ id: p.user_id, name: p.full_name })));
      setLoading(false);
    };
    fetchPatients();
  }, [user]);

  // Fetch existing assignments & progress for selected patient
  useEffect(() => {
    if (!selectedPatient) {
      setExistingAssignments(new Set());
      setPatientProgress(new Set());
      return;
    }
    const fetch = async () => {
      const [{ data: assignments }, { data: progress }] = await Promise.all([
        supabase.from('learning_assignments').select('module_id').eq('patient_id', selectedPatient),
        supabase.from('learning_progress').select('module_id').eq('user_id', selectedPatient).eq('completed', true),
      ]);
      setExistingAssignments(new Set((assignments || []).map(a => a.module_id)));
      setPatientProgress(new Set((progress || []).map(p => p.module_id)));
      setSelectedModules(new Set());
    };
    fetch();
  }, [selectedPatient]);

  const handleAssign = async () => {
    if (!user || !selectedPatient || selectedModules.size === 0) return;
    setAssigning(true);
    try {
      const inserts = [...selectedModules].map(moduleId => ({
        patient_id: selectedPatient,
        doctor_id: user.id,
        module_id: moduleId,
        notes: `Assigned by doctor`,
      }));
      const { error } = await supabase.from('learning_assignments').upsert(inserts, { onConflict: 'patient_id,module_id' });
      if (error) throw error;
      setExistingAssignments(prev => new Set([...prev, ...selectedModules]));
      setSelectedModules(new Set());
      toast({ title: language === 'en' ? 'Modules assigned successfully!' : 'मोड्युलहरू सफलतापूर्वक तोकियो!' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  const toggleModule = (id: string) => {
    setSelectedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const patientName = patients.find(p => p.id === selectedPatient)?.name;
  const completedCount = [...existingAssignments].filter(m => patientProgress.has(m)).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">
            {language === 'en' ? 'Assign Learning Modules' : 'सिकाइ मोड्युलहरू तोक्नुहोस्'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {language === 'en' ? 'Select a patient and assign education modules' : 'बिरामी छान्नुहोस् र शिक्षा मोड्युलहरू तोक्नुहोस्'}
          </p>
        </div>
      </div>

      {/* Patient selector */}
      <Select value={selectedPatient} onValueChange={setSelectedPatient}>
        <SelectTrigger className="rounded-xl">
          <SelectValue placeholder={language === 'en' ? 'Select a patient...' : 'बिरामी छान्नुहोस्...'} />
        </SelectTrigger>
        <SelectContent>
          {patients.map(p => (
            <SelectItem key={p.id} value={p.id}>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" /> {p.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPatient && (
        <>
          {/* Patient progress summary */}
          {existingAssignments.size > 0 && (
            <Card className="border-border/40 rounded-2xl">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">
                    {patientName} — {language === 'en' ? 'Progress' : 'प्रगति'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {completedCount}/{existingAssignments.size} {language === 'en' ? 'done' : 'पूरा'}
                  </Badge>
                </div>
                <Progress value={existingAssignments.size > 0 ? (completedCount / existingAssignments.size) * 100 : 0} className="h-1.5" />
              </CardContent>
            </Card>
          )}

          {/* Module list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {language === 'en' ? 'Available Modules' : 'उपलब्ध मोड्युलहरू'}
            </p>
            {learningModules.map(module => {
              const isAssigned = existingAssignments.has(module.id);
              const isCompleted = patientProgress.has(module.id);
              const isSelected = selectedModules.has(module.id);

              return (
                <button
                  key={module.id}
                  onClick={() => !isAssigned && toggleModule(module.id)}
                  disabled={isAssigned}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                    isAssigned
                      ? isCompleted
                        ? 'bg-[hsl(var(--mint))]/5 border-[hsl(var(--mint))]/20 opacity-80'
                        : 'bg-primary/5 border-primary/20 opacity-80'
                      : isSelected
                      ? 'bg-primary/10 border-primary/40 shadow-sm'
                      : 'bg-card border-border/30 hover:border-primary/30'
                  }`}
                >
                  {!isAssigned ? (
                    <Checkbox checked={isSelected} className="shrink-0" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[hsl(var(--mint))] shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-primary/40 shrink-0 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                    </div>
                  )}
                  <span className="text-xl shrink-0">{module.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{module.title[language]}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{module.description[language]}</p>
                  </div>
                  {isAssigned && (
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${isCompleted ? 'border-[hsl(var(--mint))]/40 text-[hsl(var(--mint))]' : 'border-primary/40 text-primary'}`}>
                      {isCompleted ? (language === 'en' ? 'Done' : 'पूरा') : (language === 'en' ? 'Assigned' : 'तोकिएको')}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Assign button */}
          {selectedModules.size > 0 && (
            <Button onClick={handleAssign} disabled={assigning} className="w-full rounded-xl gap-2">
              {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {language === 'en' ? `Assign ${selectedModules.size} Module(s)` : `${selectedModules.size} मोड्युल(हरू) तोक्नुहोस्`}
            </Button>
          )}
        </>
      )}

      {patients.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {language === 'en' ? 'No active patients assigned to you.' : 'तपाईंलाई कुनै सक्रिय बिरामी तोकिएको छैन।'}
        </div>
      )}
    </div>
  );
};

export default DoctorLearningAssignments;
