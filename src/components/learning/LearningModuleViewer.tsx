import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { LearningModule, QuizQuestion } from './learningContent';

interface Props {
  module: LearningModule;
  completed: boolean;
  onMarkComplete: () => void;
  onBack: () => void;
}

const severityStyles = {
  info: 'border-l-4 border-l-primary bg-primary/5',
  warning: 'border-l-4 border-l-[hsl(var(--warning,45_93%_47%))] bg-[hsl(var(--warning,45_93%_47%))]/5',
  danger: 'border-l-4 border-l-destructive bg-destructive/5',
};

const severityIcons = {
  info: null,
  warning: <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning,45_93%_47%))]" />,
  danger: <XCircle className="w-5 h-5 text-destructive" />,
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
                  if (quizSubmitted && selected && isCorrect) optClass = 'border-[hsl(var(--mint))] bg-[hsl(var(--mint))]/10';
                  else if (quizSubmitted && selected && !isCorrect) optClass = 'border-destructive bg-destructive/10';
                  else if (quizSubmitted && isCorrect) optClass = 'border-[hsl(var(--mint))]/50';
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
              <p className="text-[hsl(var(--mint))] font-bold">🎉 {language === 'en' ? 'All correct! Module completed!' : 'सबै सहि! मोड्युल पूरा भयो!'}</p>
            ) : (
              <p className="text-destructive font-bold">{language === 'en' ? 'Some answers were incorrect. Review and try again!' : 'केही उत्तरहरू गलत थिए। समीक्षा गरेर पुन: प्रयास गर्नुहोस्!'}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> {language === 'en' ? 'Back' : 'पछाडि'}
        </Button>
        {completed && (
          <Badge className="bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))] border-[hsl(var(--mint))]/30">
            <CheckCircle2 className="w-3 h-3 mr-1" /> {language === 'en' ? 'Completed' : 'पूरा भयो'}
          </Badge>
        )}
      </div>

      {/* Module title */}
      <div className="text-center space-y-1">
        <span className="text-3xl">{module.emoji}</span>
        <h2 className="text-lg font-bold text-foreground">{module.title[language]}</h2>
        <p className="text-xs text-muted-foreground">{module.description[language]}</p>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{language === 'en' ? 'Card' : 'कार्ड'} {currentCard + 1}/{module.cards.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Card */}
      <Card className={`rounded-2xl overflow-hidden transition-all ${card.severity ? severityStyles[card.severity] : 'border-border/40'}`}>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{card.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{card.title[language]}</h3>
                {card.severity && severityIcons[card.severity]}
              </div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{card.meaning[language]}</p>
            </div>
          </div>
          <div className="space-y-2 pl-1">
            {card.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span className="text-foreground/90">{action[language]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => setCurrentCard(c => c - 1)} disabled={currentCard === 0} className="rounded-xl gap-1">
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
              <Button size="sm" onClick={onMarkComplete} className="rounded-xl gap-1 bg-[hsl(var(--mint))] hover:bg-[hsl(var(--mint))]/90 text-white">
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
