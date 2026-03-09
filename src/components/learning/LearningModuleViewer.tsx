import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle, HelpCircle, BookOpen } from 'lucide-react';
import { LearningModule } from './learningContent';

interface Props {
  module: LearningModule;
  completed: boolean;
  onMarkComplete: () => void;
  onBack: () => void;
}

const severityConfig = {
  info: {
    border: 'border-l-primary',
    bg: 'bg-primary/5',
    icon: <BookOpen className="w-5 h-5 text-primary" />,
    badge: 'bg-primary/15 text-primary',
  },
  warning: {
    border: 'border-l-[hsl(var(--warning))]',
    bg: 'bg-[hsl(var(--warning))]/5',
    icon: <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))]" />,
    badge: 'bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]',
  },
  danger: {
    border: 'border-l-destructive',
    bg: 'bg-destructive/5',
    icon: <XCircle className="w-5 h-5 text-destructive" />,
    badge: 'bg-destructive/15 text-destructive',
  },
};

const moduleColorMap: Record<string, { gradient: string; accent: string; badge: string }> = {
  primary: {
    gradient: 'from-primary/20 via-primary/5 to-transparent',
    accent: 'text-primary',
    badge: 'bg-primary/15 text-primary border-primary/20',
  },
  accent: {
    gradient: 'from-accent/20 via-accent/5 to-transparent',
    accent: 'text-accent',
    badge: 'bg-accent/15 text-accent border-accent/20',
  },
  warning: {
    gradient: 'from-[hsl(var(--warning))]/20 via-[hsl(var(--warning))]/5 to-transparent',
    accent: 'text-[hsl(var(--warning))]',
    badge: 'bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20',
  },
  destructive: {
    gradient: 'from-destructive/20 via-destructive/5 to-transparent',
    accent: 'text-destructive',
    badge: 'bg-destructive/15 text-destructive border-destructive/20',
  },
};

const LearningModuleViewer: React.FC<Props> = ({ module, completed, onMarkComplete, onBack }) => {
  const { language } = useLanguage();
  const [currentCard, setCurrentCard] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const card = module.cards[currentCard];
  const progress = ((currentCard + 1) / module.cards.length) * 100;
  const hasQuiz = module.quizQuestions && module.quizQuestions.length > 0;
  const colors = moduleColorMap[module.color || 'primary'] || moduleColorMap.primary;
  const slideNumber = currentCard + 1;

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    const allCorrect = module.quizQuestions?.every((q, i) => quizAnswers[i] === q.correctIndex);
    if (allCorrect) onMarkComplete();
  };

  if (showQuiz && hasQuiz) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setShowQuiz(false)} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> {language === 'en' ? 'Back to Module' : 'मोड्युलमा फर्कनुहोस्'}
        </Button>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          {language === 'en' ? 'Quick Quiz' : 'छिटो क्विज'}
        </h3>
        {module.quizQuestions!.map((q, qi) => (
          <Card key={qi} className="border-border/40">
            <CardContent className="pt-4 space-y-3">
              <p className="font-semibold text-foreground">{q.question[language]}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = quizAnswers[qi] === oi;
                  const isCorrect = q.correctIndex === oi;
                  let optClass = 'border-border/40 hover:border-primary/50 cursor-pointer';
                  if (quizSubmitted && selected && isCorrect) optClass = 'border-accent bg-accent/10';
                  else if (quizSubmitted && selected && !isCorrect) optClass = 'border-destructive bg-destructive/10';
                  else if (quizSubmitted && isCorrect) optClass = 'border-accent/50';
                  else if (selected) optClass = 'border-primary bg-primary/5';

                  return (
                    <button
                      key={oi}
                      onClick={() => !quizSubmitted && setQuizAnswers(a => ({ ...a, [qi]: oi }))}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${optClass}`}
                      disabled={quizSubmitted}
                    >
                      {opt[language]}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
        {!quizSubmitted ? (
          <Button onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < module.quizQuestions!.length} className="w-full rounded-xl">
            {language === 'en' ? 'Submit Answers' : 'उत्तरहरू पेश गर्नुहोस्'}
          </Button>
        ) : (
          <div className="text-center p-4 rounded-xl bg-muted/50">
            {module.quizQuestions!.every((q, i) => quizAnswers[i] === q.correctIndex) ? (
              <p className="text-accent font-bold">🎉 {language === 'en' ? 'All correct! Module completed!' : 'सबै सहि! मोड्युल पूरा भयो!'}</p>
            ) : (
              <p className="text-destructive font-bold">{language === 'en' ? 'Some answers were incorrect. Review and try again!' : 'केही उत्तरहरू गलत थिए। समीक्षा गरेर पुन: प्रयास गर्नुहोस्!'}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  const sev = card.severity ? severityConfig[card.severity] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> {language === 'en' ? 'Back' : 'पछाडि'}
        </Button>
        <div className="flex items-center gap-2">
          {completed && (
            <Badge className="bg-accent/15 text-accent border-accent/30">
              <CheckCircle2 className="w-3 h-3 mr-1" /> {language === 'en' ? 'Completed' : 'पूरा भयो'}
            </Badge>
          )}
        </div>
      </div>

      {/* Infographic Card */}
      <Card className={`rounded-3xl overflow-hidden border-0 shadow-lg transition-all`}>
        {/* Card Header with gradient */}
        <div className={`bg-gradient-to-b ${colors.gradient} p-5 pb-3 relative`}>
          {/* Module badge */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className={`${colors.badge} text-[10px] font-semibold rounded-full px-2.5`}>
              {module.title[language]}
            </Badge>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full">
              {language === 'en' ? `Slide ${slideNumber}/${module.cards.length}` : `स्लाइड ${slideNumber}/${module.cards.length}`}
            </span>
          </div>

          {/* Emoji + Title */}
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-card shadow-sm flex items-center justify-center shrink-0 text-3xl">
              {card.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground leading-tight">{card.title[language]}</h3>
                {sev && sev.icon}
              </div>
              {sev && (
                <Badge className={`${sev.badge} text-[9px] mt-1 rounded-full border-0`}>
                  {card.severity === 'danger' ? (language === 'en' ? '⚠️ Important' : '⚠️ महत्वपूर्ण') :
                   card.severity === 'warning' ? (language === 'en' ? '⚡ Attention' : '⚡ ध्यान') :
                   (language === 'en' ? 'ℹ️ Tip' : 'ℹ️ सुझाव')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <CardContent className={`p-5 pt-4 space-y-4 ${sev ? `border-l-4 ${sev.border}` : ''}`}>
          {/* Main content */}
          <div className="bg-muted/30 rounded-2xl p-4">
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {card.meaning[language]}
            </p>
          </div>

          {/* Key Points */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {language === 'en' ? 'Key Points' : 'मुख्य बुँदाहरू'}
            </p>
            {card.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-3 text-sm group">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 ${
                  sev ? `${sev.bg} ${sev.border.replace('border-l-', 'text-')}` : `bg-primary/10 ${colors.accent}`
                }`}>
                  {i + 1}
                </div>
                <span className="text-foreground/85 leading-relaxed pt-0.5">{action[language]}</span>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Progress bar at bottom */}
        <div className="px-5 pb-4">
          <Progress value={progress} className="h-1.5 rounded-full" />
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentCard(c => c - 1)}
          disabled={currentCard === 0}
          className="rounded-xl gap-1 border-border/50"
        >
          <ChevronLeft className="w-4 h-4" /> {language === 'en' ? 'Previous' : 'अघिल्लो'}
        </Button>
        {currentCard < module.cards.length - 1 ? (
          <Button size="sm" onClick={() => setCurrentCard(c => c + 1)} className="rounded-xl gap-1">
            {language === 'en' ? 'Next' : 'अर्को'} <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            {hasQuiz && (
              <Button size="sm" variant="outline" onClick={() => setShowQuiz(true)} className="rounded-xl gap-1">
                <HelpCircle className="w-4 h-4" /> {language === 'en' ? 'Take Quiz' : 'क्विज लिनुहोस्'}
              </Button>
            )}
            {!completed && (
              <Button size="sm" onClick={onMarkComplete} className="rounded-xl gap-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                <CheckCircle2 className="w-4 h-4" /> {language === 'en' ? 'Mark as Learned' : 'सिकियो भनी चिन्ह लगाउनुहोस्'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningModuleViewer;
