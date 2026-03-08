import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Share2, ExternalLink, Droplets, Heart, Shield, Activity, Globe } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import pdsathiLogo from '@/assets/pdsathi-logo.png';

const APP_URL = 'https://pdnepal.lovable.app';
const ABOUT_URL = 'https://pdnepal.lovable.app';

const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'landing' | 'register' | 'forgot'>('landing');
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await login(email, password); } catch {} finally { setLoading(false); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'PDsathi – PD Companion', text: 'Track your Peritoneal Dialysis with PDsathi.', url: APP_URL });
    } else { navigator.clipboard.writeText(APP_URL); }
  };

  if (view === 'register') return <RegisterForm onBack={() => setView('landing')} />;
  if (view === 'forgot') return <ForgotPasswordForm onBack={() => setView('landing')} />;

  const hour = new Date().getHours();
  const greetingKey = hour >= 5 && hour < 12 ? 'goodMorning' : hour >= 12 && hour < 17 ? 'goodAfternoon' : hour >= 17 && hour < 21 ? 'goodEvening' : 'goodNight';
  const greetingEmoji = hour >= 5 && hour < 12 ? '🌅' : hour >= 12 && hour < 17 ? '🙏' : hour >= 17 && hour < 21 ? '🌇' : '🌙';

  const featurePills = [
    { icon: Droplets, key: 'trackExchanges', color: 'bg-primary/10 text-primary' },
    { icon: Activity, key: 'labInsights', color: 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]' },
    { icon: Shield, key: 'doctorConnect', color: 'bg-[hsl(var(--lavender))]/15 text-[hsl(var(--lavender))]' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">

        {/* Language Toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
            className="inline-flex items-center gap-1.5 bg-card/80 backdrop-blur-sm rounded-full px-3.5 py-1.5 shadow-sm border border-border/30 text-xs font-semibold text-foreground hover:bg-card transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            {language === 'en' ? 'नेपाली' : 'English'}
          </button>
        </div>

        {/* Greeting + Hero Brand */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-5 py-2 shadow-md border border-border/30">
            <span className="text-2xl">{greetingEmoji}</span>
            <p className="text-base font-bold text-foreground leading-tight">{t(greetingKey)}</p>
            <span className="text-2xl">🙏</span>
          </div>

          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-28 sm:h-28 gradient-hero rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 animate-float">
              <img src={pdsathiLogo} alt="PDsathi" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[hsl(var(--mint))] rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">PD<span className="text-primary">sathi</span></h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1 font-medium">{t('appTagline')}</p>
            <p className="text-xs text-muted-foreground/70 mt-1.5 italic">{t('appMotivation')}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {featurePills.map(({ icon: Icon, key, color }) => (
              <span key={key} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${color}`}>
                <Icon className="w-3.5 h-3.5" /> {t(key)}
              </span>
            ))}
          </div>
        </section>

        {/* Login Card */}
        <Card className="shadow-2xl border-border/40 backdrop-blur-sm bg-card/90 rounded-3xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-[hsl(var(--mint))] to-[hsl(var(--lavender))]" />
          <CardContent className="p-5 sm:p-7 space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">{t('welcomeBack')}</h2>
              <p className="text-muted-foreground text-sm mt-0.5">{t('signInToContinue')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 pl-10 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-colors" placeholder="you@example.com" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold">{t('password')}</Label>
                  <button type="button" onClick={() => setView('forgot')} className="text-[11px] text-primary hover:underline font-medium">{t('forgotPassword')}</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 pl-10 pr-10 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-colors" placeholder={t('enterPassword')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />{t('signingIn')}</span>
                ) : (
                  <span className="flex items-center gap-2">{t('signIn')} <ArrowRight className="w-4 h-4" /></span>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {t('newHere')}{' '}
              <button onClick={() => setView('register')} className="text-primary font-semibold hover:underline">{t('createAccount')}</button>
            </p>
          </CardContent>
        </Card>

        {/* QR + Share */}
        <Card className="shadow-xl border-border/40 backdrop-blur-sm bg-card/90 rounded-3xl overflow-hidden">
          <CardContent className="p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="bg-white p-3 rounded-2xl shadow-inner border border-border/30 shrink-0">
                <QRCodeSVG value={APP_URL} size={120} bgColor="#ffffff" fgColor="#1a1a2e" level="M" imageSettings={{ src: pdsathiLogo, x: undefined, y: undefined, height: 28, width: 28, excavate: true }} />
              </div>
              <div className="text-center sm:text-left space-y-2.5 flex-1">
                <h3 className="font-bold text-foreground text-base">{t('sharePDsathi')}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{t('shareDescription')}</p>
                <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-semibold">
                  <Share2 className="w-3.5 h-3.5" /> {t('shareAppLink')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Link */}
        <a href={ABOUT_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Card className="shadow-lg border-border/40 bg-gradient-to-r from-primary/5 via-card to-[hsl(var(--mint))]/5 rounded-3xl hover:shadow-xl transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><ExternalLink className="w-5 h-5 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm">{t('learnMore')}</h3>
                <p className="text-muted-foreground text-xs mt-0.5 truncate">{t('learnMoreDesc')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </a>

        {/* Footer */}
        <footer className="text-center space-y-1 pb-6 pt-2">
          <p className="text-[11px] text-muted-foreground/70 font-medium">{t('conceptBy')} <span className="text-foreground/80 font-semibold">Dr. Anil Pokhrel</span></p>
          <p className="text-[10px] text-muted-foreground/50">{t('consultantNephrologist')}</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
