import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  ChevronLeft, ChevronRight, Shield, Award, AlertTriangle,
  CheckCircle2, XCircle, Activity, Brain, HandMetal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ── Risk Assessment Questions ──
const riskQuestions = [
  {
    id: 'handwash',
    question: { en: 'How often do you wash hands before every exchange?', ne: 'एक्सचेन्ज अघि कति पटक हात धुनुहुन्छ?' },
    options: [
      { en: 'Always (every time)', ne: 'सधैँ (हरेक पटक)', score: 0 },
      { en: 'Usually (most times)', ne: 'प्रायः (धेरैजसो)', score: 1 },
      { en: 'Sometimes', ne: 'कहिलेकाहीँ', score: 3 },
      { en: 'Rarely', ne: 'कम मात्र', score: 5 },
    ],
  },
  {
    id: 'mask',
    question: { en: 'Do you wear a mask during exchanges?', ne: 'एक्सचेन्ज गर्दा मास्क लगाउनुहुन्छ?' },
    options: [
      { en: 'Always', ne: 'सधैँ', score: 0 },
      { en: 'Sometimes', ne: 'कहिलेकाहीँ', score: 2 },
      { en: 'Never', ne: 'कहिल्यै होइन', score: 4 },
    ],
  },
  {
    id: 'sterile',
    question: { en: 'Do you avoid touching connection tips?', ne: 'कनेक्सन टिप नछुने गर्नुहुन्छ?' },
    options: [
      { en: 'Always careful', ne: 'सधैँ सावधान', score: 0 },
      { en: 'Usually careful', ne: 'प्रायः सावधान', score: 1 },
      { en: 'Not always', ne: 'सधैँ होइन', score: 3 },
    ],
  },
  {
    id: 'workspace',
    question: { en: 'Is your exchange area clean and closed?', ne: 'एक्सचेन्ज गर्ने ठाउँ सफा र बन्द छ?' },
    options: [
      { en: 'Yes — dedicated clean room', ne: 'हो — समर्पित सफा कोठा', score: 0 },
      { en: 'Mostly clean', ne: 'प्रायः सफा', score: 1 },
      { en: 'Sometimes dusty or open', ne: 'कहिलेकाहीँ धुलो वा खुला', score: 3 },
    ],
  },
  {
    id: 'exitsite',
    question: { en: 'How often do you clean your exit site?', ne: 'एक्जिट साइट कति पटक सफा गर्नुहुन्छ?' },
    options: [
      { en: 'Daily', ne: 'दैनिक', score: 0 },
      { en: 'Every 2–3 days', ne: '२–३ दिनमा', score: 2 },
      { en: 'Weekly or less', ne: 'हप्तामा वा कम', score: 4 },
    ],
  },
  {
    id: 'cloudy',
    question: { en: 'Do you know what to do if fluid is cloudy?', ne: 'पानी धमिलो भएमा के गर्ने थाहा छ?' },
    options: [
      { en: 'Yes — save bag and call doctor', ne: 'हो — ब्याग बचाउने र डाक्टरलाई फोन गर्ने', score: 0 },
      { en: 'Not sure', ne: 'निश्चित छैन', score: 3 },
      { en: 'No idea', ne: 'थाहा छैन', score: 5 },
    ],
  },
];

// ── Certification Quiz (10 questions) ──
const certQuiz = [
  {
    question: { en: 'What is the #1 cause of peritonitis in PD?', ne: 'PD मा पेरिटोनाइटिसको मुख्य कारण?' },
    options: [
      { en: 'Eating spicy food', ne: 'पिरो खाना' },
      { en: 'Poor hand hygiene', ne: 'हात राम्ररी नधुने' },
      { en: 'Too much exercise', ne: 'धेरै व्यायाम' },
      { en: 'Cold weather', ne: 'चिसो मौसम' },
    ],
    correct: 1,
  },
  {
    question: { en: 'How long should you wash your hands before exchange?', ne: 'एक्सचेन्ज अघि कति समय हात धुनुपर्छ?' },
    options: [
      { en: '5 seconds', ne: '५ सेकेन्ड' },
      { en: '10 seconds', ne: '१० सेकेन्ड' },
      { en: '20 seconds with soap', ne: 'साबुनले २० सेकेन्ड' },
      { en: '1 minute', ne: '१ मिनेट' },
    ],
    correct: 2,
  },
  {
    question: { en: 'What does cloudy dialysis fluid indicate?', ne: 'धमिलो डायलाइसिस पानीले के संकेत गर्छ?' },
    options: [
      { en: 'Normal finding', ne: 'सामान्य' },
      { en: 'Possible peritonitis', ne: 'सम्भावित पेरिटोनाइटिस' },
      { en: 'Too much water', ne: 'धेरै पानी' },
      { en: 'Need more protein', ne: 'प्रोटिन बढी चाहिन्छ' },
    ],
    correct: 1,
  },
  {
    question: { en: 'If fluid is cloudy, what should you do with the bag?', ne: 'पानी धमिलो भएमा ब्याग के गर्ने?' },
    options: [
      { en: 'Throw it away', ne: 'फाल्ने' },
      { en: 'Save it and bring to hospital', ne: 'सुरक्षित राख्ने र अस्पताल ल्याउने' },
      { en: 'Wait and watch', ne: 'पर्खने र हेर्ने' },
      { en: 'Drain it again', ne: 'फेरि निकाल्ने' },
    ],
    correct: 1,
  },
  {
    question: { en: 'Should you wear a mask during exchange?', ne: 'एक्सचेन्ज गर्दा मास्क लगाउनुपर्छ?' },
    options: [
      { en: 'Only if sick', ne: 'बिरामी भएमा मात्र' },
      { en: 'Yes, always', ne: 'हो, सधैँ' },
      { en: 'No, not needed', ne: 'होइन, चाहिँदैन' },
      { en: 'Only in winter', ne: 'जाडोमा मात्र' },
    ],
    correct: 1,
  },
  {
    question: { en: 'What is the most important daily catheter care step?', ne: 'क्याथेटरको सबैभन्दा महत्वपूर्ण दैनिक हेरचाह?' },
    options: [
      { en: 'Wash exit site with soap & water daily', ne: 'दैनिक साबुन पानीले एक्जिट साइट धुने' },
      { en: 'Apply oil', ne: 'तेल लगाउने' },
      { en: 'No care needed', ne: 'हेरचाह चाहिँदैन' },
      { en: 'Cover with tight bandage', ne: 'कसको पट्टी लगाउने' },
    ],
    correct: 0,
  },
  {
    question: { en: 'When should you contact your doctor immediately?', ne: 'डाक्टरलाई तुरुन्त कहिले सम्पर्क गर्ने?' },
    options: [
      { en: 'Every exchange', ne: 'हरेक एक्सचेन्ज' },
      { en: 'Cloudy fluid, fever, or severe pain', ne: 'धमिलो पानी, ज्वरो, वा गम्भीर दुखाइ' },
      { en: 'Once a month', ne: 'महिनामा एक पटक' },
      { en: 'When fluid is clear', ne: 'पानी सफा भएमा' },
    ],
    correct: 1,
  },
  {
    question: { en: 'What causes exit site infection?', ne: 'एक्जिट साइट संक्रमणको कारण?' },
    options: [
      { en: 'Swimming', ne: 'पौडी खेल्ने' },
      { en: 'Eating too much', ne: 'धेरै खाने' },
      { en: 'Poor exit site hygiene', ne: 'एक्जिट साइटको सरसफाइ नगर्ने' },
      { en: 'Cold weather', ne: 'चिसो मौसम' },
    ],
    correct: 2,
  },
  {
    question: { en: 'Signs of exit site infection include:', ne: 'एक्जिट साइट संक्रमणका लक्षण:' },
    options: [
      { en: 'Redness, swelling, pus', ne: 'रातोपन, सुन्निनु, पस' },
      { en: 'Clear fluid', ne: 'सफा पानी' },
      { en: 'No symptoms', ne: 'कुनै लक्षण छैन' },
      { en: 'Good appetite', ne: 'राम्रो भोक' },
    ],
    correct: 0,
  },
  {
    question: { en: 'Can peritonitis be treated if caught early?', ne: 'चाँडो थाहा भएमा पेरिटोनाइटिस उपचार गर्न सकिन्छ?' },
    options: [
      { en: 'No, it is always fatal', ne: 'होइन, सधैँ घातक हुन्छ' },
      { en: 'Yes, with early antibiotics', ne: 'हो, चाँडो एन्टिबायोटिकले' },
      { en: 'Only with surgery', ne: 'शल्यक्रियाले मात्र' },
      { en: 'It goes away on its own', ne: 'आफैँ जान्छ' },
    ],
    correct: 1,
  },
];

// ── Training Steps ──
const trainingSteps = [
  { id: 'learn', icon: Brain, label: { en: 'Learn', ne: 'सिक्नुहोस्' }, desc: { en: 'Study prevention slides', ne: 'रोकथाम स्लाइडहरू अध्ययन' } },
  { id: 'assess', icon: Activity, label: { en: 'Self-Assess', ne: 'आत्ममूल्याङ्कन' }, desc: { en: 'Check your risk score', ne: 'जोखिम स्कोर जाँच' } },
  { id: 'quiz', icon: Award, label: { en: 'Certify', ne: 'प्रमाणित' }, desc: { en: 'Pass certification quiz', ne: 'प्रमाणपत्र क्विज पास' } },
];

type PathwayStep = 'overview' | 'risk' | 'quiz' | 'certificate';

interface Props {
  onBack: () => void;
  completedModules: Set<string>;
  onMarkComplete: (moduleId: string) => Promise<void>;
}

const PeritonitisPathway: React.FC<Props> = ({ onBack, completedModules, onMarkComplete }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<PathwayStep>('overview');
  const [riskAnswers, setRiskAnswers] = useState<Record<string, number>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [certified, setCertified] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [savedRiskScore, setSavedRiskScore] = useState<number | null>(null);

  const PATHWAY_MODULE_ID = 'peritonitis-pathway';

  useEffect(() => {
    if (completedModules.has(PATHWAY_MODULE_ID)) setCertified(true);
  }, [completedModules]);

  // Check saved quiz score
  useEffect(() => {
    if (!user) return;
    supabase.from('learning_progress').select('quiz_score').eq('user_id', user.id).eq('module_id', PATHWAY_MODULE_ID).maybeSingle()
      .then(({ data }) => { if (data?.quiz_score != null) { setQuizScore(data.quiz_score); setSavedRiskScore(data.quiz_score); } });
  }, [user]);

  const prerequisitesDone = ['peritonitis-education', 'catheter-care', 'recognizing-problems']
    .every(id => completedModules.has(id));

  // ── Risk Scoring ──
  const totalRisk = Object.values(riskAnswers).reduce((s, v) => s + v, 0);
  const maxRisk = riskQuestions.reduce((s, q) => s + Math.max(...q.options.map(o => o.score)), 0);
  const riskPercent = maxRisk > 0 ? Math.round((totalRisk / maxRisk) * 100) : 0;
  const riskLevel = riskPercent <= 15 ? 'low' : riskPercent <= 45 ? 'moderate' : 'high';
  const riskColors = {
    low: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/30', label: { en: 'Low Risk', ne: 'कम जोखिम' } },
    moderate: { bg: 'bg-[hsl(var(--warning))]/10', text: 'text-[hsl(var(--warning))]', border: 'border-[hsl(var(--warning))]/30', label: { en: 'Moderate Risk', ne: 'मध्यम जोखिम' } },
    high: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', label: { en: 'High Risk', ne: 'उच्च जोखिम' } },
  };

  // ── Quiz Scoring ──
  const handleQuizSubmit = async () => {
    const correct = certQuiz.filter((q, i) => quizAnswers[i] === q.correct).length;
    const score = Math.round((correct / certQuiz.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= 80) {
      setCertified(true);
      await onMarkComplete(PATHWAY_MODULE_ID);
      // Save quiz score
      if (user) {
        await supabase.from('learning_progress').upsert({
          user_id: user.id,
          module_id: PATHWAY_MODULE_ID,
          completed: true,
          completed_at: new Date().toISOString(),
          quiz_score: score,
        }, { onConflict: 'user_id,module_id' });
      }
      toast({ title: language === 'en' ? '🏆 Certified! Peritonitis Prevention Pathway Complete!' : '🏆 प्रमाणित! पेरिटोनाइटिस रोकथाम मार्ग पूरा!' });
    }
  };

  // ── Certificate View ──
  if (step === 'certificate' || (certified && step === 'overview')) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> {language === 'en' ? 'Back' : 'पछाडि'}
        </Button>
        <Card className="rounded-3xl border-2 border-accent/40 overflow-hidden shadow-xl">
          <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-[hsl(var(--lavender))]/15 p-8 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
              <Award className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {language === 'en' ? '🏆 Certification Badge' : '🏆 प्रमाणपत्र ब्याज'}
            </h2>
            <p className="text-lg font-semibold text-accent">
              {language === 'en' ? 'Peritonitis Prevention — Certified' : 'पेरिटोनाइटिस रोकथाम — प्रमाणित'}
            </p>
            <div className="bg-card/80 rounded-2xl p-4 inline-block">
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Quiz Score' : 'क्विज स्कोर'}: <span className="font-bold text-foreground">{quizScore}%</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {user?.email} · {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-accent font-semibold">
              <Shield className="w-4 h-4" />
              {language === 'en' ? 'You are trained to prevent peritonitis' : 'तपाईं पेरिटोनाइटिस रोक्न प्रशिक्षित हुनुहुन्छ'}
            </div>
          </div>
        </Card>
        <Button variant="outline" className="w-full rounded-xl" onClick={() => { setStep('overview'); setCertified(false); setQuizSubmitted(false); setQuizAnswers({}); }}>
          {language === 'en' ? 'Retake Pathway' : 'मार्ग पुन: लिनुहोस्'}
        </Button>
      </div>
    );
  }

  // ── Quiz View ──
  if (step === 'quiz') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setStep('overview')} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> {language === 'en' ? 'Back' : 'पछाडि'}
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {language === 'en' ? 'Certification Quiz' : 'प्रमाणपत्र क्विज'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? '10 questions · Score ≥80% to certify' : '१० प्रश्न · प्रमाणित हुन ≥८०% चाहिन्छ'}
            </p>
          </div>
        </div>

        {certQuiz.map((q, qi) => {
          const selected = quizAnswers[qi];
          return (
            <Card key={qi} className="border-border/40 rounded-2xl">
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  {qi + 1}. {q.question[language]}
                </p>
                <RadioGroup
                  value={selected !== undefined ? String(selected) : ''}
                  onValueChange={(v) => !quizSubmitted && setQuizAnswers(a => ({ ...a, [qi]: parseInt(v) }))}
                >
                  {q.options.map((opt, oi) => {
                    const isCorrect = q.correct === oi;
                    let extraClass = '';
                    if (quizSubmitted && selected === oi && isCorrect) extraClass = 'bg-accent/10 border-accent/40';
                    else if (quizSubmitted && selected === oi && !isCorrect) extraClass = 'bg-destructive/10 border-destructive/40';
                    else if (quizSubmitted && isCorrect) extraClass = 'border-accent/30';

                    return (
                      <div key={oi} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${extraClass || 'border-border/30'}`}>
                        <RadioGroupItem value={String(oi)} id={`q${qi}-o${oi}`} disabled={quizSubmitted} />
                        <Label htmlFor={`q${qi}-o${oi}`} className="text-sm cursor-pointer flex-1">
                          {opt[language]}
                        </Label>
                        {quizSubmitted && selected === oi && isCorrect && <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />}
                        {quizSubmitted && selected === oi && !isCorrect && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}

        {!quizSubmitted ? (
          <Button
            onClick={handleQuizSubmit}
            disabled={Object.keys(quizAnswers).length < certQuiz.length}
            className="w-full rounded-xl"
          >
            {language === 'en' ? 'Submit Certification Quiz' : 'प्रमाणपत्र क्विज पेश गर्नुहोस्'}
          </Button>
        ) : (
          <Card className={`rounded-2xl border-2 ${quizScore >= 80 ? 'border-accent/40 bg-accent/5' : 'border-destructive/40 bg-destructive/5'}`}>
            <CardContent className="pt-4 text-center space-y-2">
              {quizScore >= 80 ? (
                <>
                  <Award className="w-8 h-8 text-accent mx-auto" />
                  <p className="font-bold text-accent">
                    🏆 {language === 'en' ? `Certified! Score: ${quizScore}%` : `प्रमाणित! स्कोर: ${quizScore}%`}
                  </p>
                  <Button size="sm" className="rounded-xl" onClick={() => setStep('certificate')}>
                    {language === 'en' ? 'View Certificate' : 'प्रमाणपत्र हेर्नुहोस्'}
                  </Button>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
                  <p className="font-bold text-destructive">
                    {language === 'en' ? `Score: ${quizScore}% — Need ≥80% to certify` : `स्कोर: ${quizScore}% — प्रमाणित हुन ≥८०% चाहिन्छ`}
                  </p>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>
                    {language === 'en' ? 'Retry Quiz' : 'क्विज पुन: प्रयास'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Risk Assessment View ──
  if (step === 'risk') {
    const allAnswered = Object.keys(riskAnswers).length === riskQuestions.length;
    const rc = riskColors[riskLevel];

    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setStep('overview')} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" /> {language === 'en' ? 'Back' : 'पछाडि'}
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--warning))]/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[hsl(var(--warning))]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {language === 'en' ? 'Risk Self-Assessment' : 'जोखिम आत्ममूल्याङ्कन'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Answer honestly to see your peritonitis risk level' : 'आफ्नो पेरिटोनाइटिस जोखिम स्तर हेर्न इमानदारीपूर्वक जवाफ दिनुहोस्'}
            </p>
          </div>
        </div>

        {riskQuestions.map((q) => (
          <Card key={q.id} className="border-border/40 rounded-2xl">
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">{q.question[language]}</p>
              <RadioGroup
                value={riskAnswers[q.id] !== undefined ? String(riskAnswers[q.id]) : ''}
                onValueChange={(v) => setRiskAnswers(a => ({ ...a, [q.id]: parseInt(v) }))}
              >
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/30 hover:border-primary/30 transition-all">
                    <RadioGroupItem value={String(opt.score)} id={`${q.id}-${oi}`} />
                    <Label htmlFor={`${q.id}-${oi}`} className="text-sm cursor-pointer flex-1">{opt[language]}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        {allAnswered && (
          <Card className={`rounded-2xl border-2 ${rc.border} ${rc.bg}`}>
            <CardContent className="pt-4 space-y-3 text-center">
              <div className={`w-16 h-16 mx-auto rounded-full ${rc.bg} flex items-center justify-center`}>
                {riskLevel === 'low' ? <Shield className={`w-8 h-8 ${rc.text}`} /> :
                 riskLevel === 'moderate' ? <AlertTriangle className={`w-8 h-8 ${rc.text}`} /> :
                 <XCircle className={`w-8 h-8 ${rc.text}`} />}
              </div>
              <p className={`text-lg font-bold ${rc.text}`}>{rc.label[language]}</p>
              <Progress value={100 - riskPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {language === 'en'
                  ? riskLevel === 'low' ? 'Great habits! Keep following sterile technique.'
                    : riskLevel === 'moderate' ? 'Review catheter care and hand washing technique.'
                    : 'Please review all prevention modules carefully and consult your PD team.'
                  : riskLevel === 'low' ? 'राम्रो बानी! सफा तरिका जारी राख्नुहोस्।'
                    : riskLevel === 'moderate' ? 'क्याथेटर हेरचाह र हात धुने तरिका समीक्षा गर्नुहोस्।'
                    : 'कृपया सबै रोकथाम मोड्युलहरू ध्यानपूर्वक समीक्षा गर्नुहोस्।'}
              </p>
              <Button size="sm" className="rounded-xl" onClick={() => setStep('quiz')}>
                {language === 'en' ? 'Proceed to Certification Quiz →' : 'प्रमाणपत्र क्विजमा जानुहोस् →'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Overview ──
  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
        <ChevronLeft className="w-4 h-4" /> {language === 'en' ? 'Back' : 'पछाडि'}
      </Button>

      {/* Hero */}
      <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-destructive/15 via-[hsl(var(--warning))]/10 to-accent/10 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-card shadow-sm flex items-center justify-center">
              <Shield className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {language === 'en' ? 'Peritonitis Prevention Pathway' : 'पेरिटोनाइटिस रोकथाम मार्ग'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'Interactive training · Risk scoring · Certification' : 'अन्तरक्रियात्मक तालिम · जोखिम स्कोरिंग · प्रमाणपत्र'}
              </p>
            </div>
          </div>
          {certified && (
            <Badge className="bg-accent/15 text-accent border-accent/30 gap-1">
              <Award className="w-3 h-3" /> {language === 'en' ? 'Certified' : 'प्रमाणित'}
            </Badge>
          )}
        </div>
      </Card>

      {/* Prerequisites */}
      {!prerequisitesDone && (
        <Card className="border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-[hsl(var(--warning))] font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {language === 'en' ? 'Complete prerequisite modules first:' : 'पहिले आवश्यक मोड्युलहरू पूरा गर्नुहोस्:'}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {[
                { id: 'catheter-care', en: 'PD Catheter Care', ne: 'PD क्याथेटर हेरचाह' },
                { id: 'recognizing-problems', en: 'Recognizing Problems', ne: 'समस्या चिन्ने' },
                { id: 'peritonitis-education', en: 'Preventing Peritonitis', ne: 'पेरिटोनाइटिस रोकथाम' },
              ].map(m => (
                <li key={m.id} className="flex items-center gap-2">
                  {completedModules.has(m.id)
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    : <XCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                  {m[language]}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Steps */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          {language === 'en' ? 'Training Steps' : 'तालिम चरणहरू'}
        </p>
        {trainingSteps.map((s, i) => {
          const StepIcon = s.icon;
          const isLocked = !prerequisitesDone && i > 0;
          const stepDone = i === 0 ? prerequisitesDone : i === 1 ? Object.keys(riskAnswers).length === riskQuestions.length : certified;

          return (
            <button
              key={s.id}
              disabled={isLocked}
              onClick={() => {
                if (s.id === 'learn') onBack(); // go back to modules list
                if (s.id === 'assess') setStep('risk');
                if (s.id === 'quiz') setStep('quiz');
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                isLocked ? 'opacity-40 cursor-not-allowed bg-muted/30 border-border/20'
                : stepDone ? 'bg-accent/5 border-accent/20'
                : 'bg-card border-border/30 hover:border-primary/30 card-hover'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                stepDone ? 'bg-accent/15' : 'bg-muted/50'
              }`}>
                {stepDone ? <CheckCircle2 className="w-5 h-5 text-accent" /> : <StepIcon className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
                    {i + 1}
                  </span>
                  <p className="text-sm font-bold text-foreground">{s.label[language]}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc[language]}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PeritonitisPathway;
