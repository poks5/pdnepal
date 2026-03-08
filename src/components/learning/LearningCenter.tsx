import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, BookOpen, Star, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { learningModules, categories } from './learningContent';
import LearningModuleViewer from './LearningModuleViewer';
import { useToast } from '@/hooks/use-toast';

const LearningCenter: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [assignedModules, setAssignedModules] = useState<Set<string>>(new Set());
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchProgress();
    fetchAssignments();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('learning_progress')
        .select('module_id')
        .eq('user_id', user.id)
        .eq('completed', true);
      if (data) setCompletedModules(new Set(data.map(d => d.module_id)));
    } catch (e) { /* silently fail */ }
    setLoading(false);
  };

  const fetchAssignments = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('learning_assignments')
        .select('module_id')
        .eq('patient_id', user.id);
      if (data) setAssignedModules(new Set(data.map(d => d.module_id)));
    } catch (e) { /* silently fail */ }
  };

  const handleMarkComplete = async (moduleId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,module_id' });
      if (error) throw error;
      setCompletedModules(prev => new Set([...prev, moduleId]));
      toast({ title: language === 'en' ? 'Module completed! 🎉' : 'मोड्युल पूरा भयो! 🎉' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const filteredModules = (activeCategory === 'all'
    ? learningModules
    : learningModules.filter(m => m.category === activeCategory)
  ).sort((a, b) => {
    // Assigned but not completed first
    const aAssigned = assignedModules.has(a.id) && !completedModules.has(a.id) ? 0 : 1;
    const bAssigned = assignedModules.has(b.id) && !completedModules.has(b.id) ? 0 : 1;
    return aAssigned - bAssigned;
  });

  const overallProgress = learningModules.length > 0
    ? Math.round((completedModules.size / learningModules.length) * 100)
    : 0;

  const selectedModuleData = learningModules.find(m => m.id === selectedModule);

  if (selectedModuleData) {
    return (
      <LearningModuleViewer
        module={selectedModuleData}
        completed={completedModules.has(selectedModuleData.id)}
        onMarkComplete={() => handleMarkComplete(selectedModuleData.id)}
        onBack={() => setSelectedModule(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-[hsl(var(--lavender))]/8 to-[hsl(var(--mint))]/10 rounded-2xl p-5 border border-border/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {language === 'en' ? 'Learning Center' : 'सिकाइ केन्द्र'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Your PD education journey' : 'तपाईंको PD शिक्षा यात्रा'}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {completedModules.size}/{learningModules.length} {language === 'en' ? 'modules completed' : 'मोड्युलहरू पूरा'}
            </span>
            <span className="font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
        {overallProgress === 100 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-[hsl(var(--mint))] font-semibold">
            <Star className="w-4 h-4 fill-current" />
            {language === 'en' ? 'All modules completed! Great job!' : 'सबै मोड्युलहरू पूरा! शाबास!'}
          </div>
        )}
      </div>

      {/* New Patient Education Pathway callout */}
      {assignedModules.size > 0 && (() => {
        const assignedNotDone = [...assignedModules].filter(m => !completedModules.has(m));
        const assignedDone = [...assignedModules].filter(m => completedModules.has(m));
        const pathwayProgress = assignedModules.size > 0 ? Math.round((assignedDone.length / assignedModules.size) * 100) : 0;
        return (
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-[hsl(var(--lavender))]/5 rounded-2xl">
            <CardContent className="pt-4 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-primary flex items-center gap-2">
                  🎓 {language === 'en' ? 'New Patient Education Pathway' : 'नयाँ बिरामी शिक्षा मार्ग'}
                </p>
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                  {assignedDone.length}/{assignedModules.size}
                </Badge>
              </div>
              <Progress value={pathwayProgress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {assignedNotDone.length > 0
                  ? (language === 'en' ? `${assignedNotDone.length} essential module(s) remaining` : `${assignedNotDone.length} आवश्यक मोड्युल(हरू) बाँकी`)
                  : (language === 'en' ? '✅ Pathway complete! You\'re well prepared.' : '✅ मार्ग पूरा! तपाईं राम्ररी तयार हुनुहुन्छ।')
                }
              </p>
            </CardContent>
          </Card>
        );
      })()}

      {/* Category filter */}
      <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
        <div className="inline-flex gap-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="rounded-full text-xs gap-1 whitespace-nowrap shrink-0"
            >
              <span>{cat.emoji}</span>
              {cat.label[language]}
            </Button>
          ))}
        </div>
      </div>

      {/* Module cards */}
      <div className="space-y-3">
        {filteredModules.map(module => {
          const isCompleted = completedModules.has(module.id);
          const isAssigned = assignedModules.has(module.id);

          return (
            <button
              key={module.id}
              onClick={() => setSelectedModule(module.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all group card-hover ${
                isCompleted
                  ? 'bg-[hsl(var(--mint))]/5 border-[hsl(var(--mint))]/20'
                  : isAssigned
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-card border-border/30 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  isCompleted ? 'bg-[hsl(var(--mint))]/10' : 'bg-muted/50'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6 text-[hsl(var(--mint))]" /> : module.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{module.title[language]}</p>
                    {isAssigned && !isCompleted && (
                      <Badge variant="outline" className="text-[10px] border-primary/40 text-primary px-1.5">
                        {language === 'en' ? 'Assigned' : 'तोकिएको'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{module.description[language]}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {module.cards.length} {language === 'en' ? 'cards' : 'कार्डहरू'}
                    {module.quizQuestions && module.quizQuestions.length > 0 && ` · ${language === 'en' ? 'Quiz' : 'क्विज'}`}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LearningCenter;
