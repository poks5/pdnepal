import React, { useState, createContext, useContext } from 'react';
import OfflineBanner from '@/components/OfflineBanner';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone, LogOut, Menu, X, User, Bell,
  Home, Activity, FileText, Settings, FlaskConical,
  Users, BarChart, Shield, Globe, BookOpen, MessageSquare
} from 'lucide-react';
import pdsathiLogo from '@/assets/pdsathi-logo.png';

// Context for bottom nav ↔ dashboard tab sync
interface NavContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  badgeCounts: Record<string, number>;
  setBadgeCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}
const NavContext = createContext<NavContextType>({ activeTab: 'overview', setActiveTab: () => {}, badgeCounts: {}, setBadgeCounts: () => {} });
export const useNav = () => useContext(NavContext);

interface LayoutProps {
  children: React.ReactNode;
  viewRole?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, viewRole }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const defaultTab = (() => {
    const r = viewRole ?? user?.role;
    if (r === 'dietician' || r === 'doctor' || r === 'nurse') return 'patients';
    if (r === 'admin' || r === 'coordinator') return 'overview';
    return 'overview';
  })();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  const roleLabel: Record<string, string> = {
    patient: 'Patient', doctor: 'Doctor', caregiver: 'Caregiver',
    admin: 'Admin', coordinator: 'Coordinator', dietician: 'Dietician', nurse: 'Nurse',
  };
  const roleEmoji: Record<string, string> = {
    patient: '🩺', doctor: '👨‍⚕️', caregiver: '🤝', admin: '🛡️',
    coordinator: '📋', dietician: '🥗', nurse: '👩‍⚕️',
  };
  const roleColor: Record<string, string> = {
    patient: 'bg-primary/10 text-primary',
    doctor: 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]',
    caregiver: 'bg-[hsl(var(--peach))]/15 text-[hsl(var(--coral))]',
    admin: 'bg-destructive/10 text-destructive',
    coordinator: 'bg-[hsl(var(--lavender))]/15 text-[hsl(var(--lavender))]',
    dietician: 'bg-[hsl(var(--peach))]/15 text-[hsl(var(--peach))]',
    nurse: 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]',
  };

  const patientNav = [
    { icon: Home, label: t('home'), id: 'overview', emoji: '🏠' },
    { icon: Activity, label: t('exchanges'), id: 'exchanges', emoji: '💧' },
    { icon: MessageSquare, label: t('messages') || 'Messages', id: 'messages', emoji: '💬' },
    { icon: BarChart, label: t('analytics'), id: 'analytics', emoji: '📊' },
    { icon: Settings, label: t('settings'), id: 'settings', emoji: '⚙️' },
  ];
  const doctorNav = [
    { icon: Home, label: t('home'), id: 'patients', emoji: '🏠' },
    { icon: Bell, label: t('alerts'), id: 'alerts', emoji: '🔔' },
    { icon: FlaskConical, label: t('labs'), id: 'labs', emoji: '🧪' },
    { icon: FileText, label: t('plans'), id: 'plans', emoji: '📋' },
    { icon: Settings, label: t('more'), id: 'more', emoji: '⚙️' },
  ];
  const adminNav = [
    { icon: Home, label: t('home'), id: 'overview', emoji: '🏠' },
    { icon: Users, label: t('users'), id: 'users', emoji: '👥' },
    { icon: Shield, label: t('security'), id: 'security', emoji: '🛡️' },
    { icon: Settings, label: t('settings'), id: 'settings', emoji: '⚙️' },
  ];
  const dieticianNav = [
    { icon: Home, label: 'Patients', id: 'patients', emoji: '🏠' },
    { icon: Bell, label: 'Alerts', id: 'alerts', emoji: '🔔' },
    { icon: Settings, label: 'More', id: 'more', emoji: '⚙️' },
  ];

  const navRole = viewRole ?? user?.role;
  const navItems = navRole === 'dietician' ? dieticianNav
    : navRole === 'doctor' || navRole === 'nurse' ? doctorNav
    : navRole === 'admin' || navRole === 'coordinator' ? adminNav
    : patientNav;

  return (
    <NavContext.Provider value={{ activeTab, setActiveTab, badgeCounts, setBadgeCounts }}>
      <div className="min-h-screen bg-background relative">
        {/* Ambient prestige aura */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-[0.18] bg-primary" />
          <div className="absolute top-1/3 -right-32 w-[460px] h-[460px] rounded-full blur-3xl opacity-[0.12] bg-[hsl(var(--gold))]" />
        </div>

        <OfflineBanner />

        {/* ── Premium Header ── */}
        <header
          className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/40"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] shadow-emerald">
                  <img src={pdsathiLogo} alt="PDsathi" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[hsl(var(--gold))] ring-2 ring-background" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-display text-[15px] sm:text-base font-bold text-foreground leading-none">PDsathi</h1>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-[0.18em] mt-1">Peritoneal Care</p>
                </div>
              </div>


              {/* Desktop actions */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full bg-muted/50 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {language === 'en' ? 'नेपाली' : 'EN'}
                </button>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-full px-4 shadow-sm">
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  {t('emergency')}
                </Button>
                <div className="h-8 w-px bg-border/50" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-md">
                    <span className="text-base">{roleEmoji[user?.role ?? ''] ?? '👤'}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground leading-none">{user?.fullName}</p>
                    <Badge className={`text-[10px] mt-0.5 px-2 py-0 border-0 font-semibold ${roleColor[user?.role ?? '']}`}>
                      {roleLabel[user?.role ?? ''] ?? user?.role}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive rounded-full w-8 h-8">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile actions – minimal */}
              <div className="flex md:hidden items-center gap-1.5">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                  className="text-[10px] font-bold text-muted-foreground bg-muted/60 w-7 h-7 rounded-full flex items-center justify-center"
                >
                  {language === 'en' ? 'ने' : 'EN'}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile slide-down menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/20 bg-card/95 backdrop-blur-xl px-4 pb-4 pt-3 space-y-3 animate-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-md">
                  <span className="text-lg">{roleEmoji[user?.role ?? ''] ?? '👤'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Badge className={`text-[10px] px-2 py-0.5 border-0 font-semibold shrink-0 ${roleColor[user?.role ?? '']}`}>
                  {roleLabel[user?.role ?? '']}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-destructive justify-start rounded-xl h-11 border-destructive/20 text-xs">
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> {t('emergency')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }} className="justify-start rounded-xl h-11 text-xs">
                  <LogOut className="w-3.5 h-3.5 mr-1.5" /> {t('logout')}
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-24 md:pb-8">
          <div className="animate-in fade-in-0 duration-200">
            {children}
          </div>
        </main>

        {/* Footer – desktop only */}
        <footer className="hidden md:block text-center py-4 border-t border-border/20">
          <p className="text-[11px] text-muted-foreground/60">
            {t('conceptBy')} <span className="font-semibold text-muted-foreground/80">Dr. Anil Pokhrel</span> · {t('consultantNephrologist')}
          </p>
        </footer>

        {/* ── Premium Bottom Navigation ── */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 pb-2"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
        >
          <div className="relative max-w-md mx-auto">
            {/* Glow halo */}
            <div className="absolute -inset-x-4 -bottom-2 h-16 bg-gradient-to-t from-background/80 via-background/40 to-transparent blur-md pointer-events-none" />
            <div className="relative bg-card/85 backdrop-blur-2xl border border-border/50 rounded-[28px] shadow-[0_10px_40px_-8px_hsl(162_45%_8%/0.18)]">
              <div className="flex justify-around items-center h-[64px] px-1.5">
                {navItems.map(({ icon: Icon, label, id }) => {
                  const isActive = activeTab === id;
                  const badge = badgeCounts[id] || 0;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className="relative flex-1 flex flex-col items-center justify-center gap-1 h-full group tap-highlight-none"
                    >
                      <div className={`relative flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] shadow-emerald scale-100'
                          : 'w-10 h-10 rounded-2xl scale-95'
                      } group-active:scale-90`}>
                        <Icon className={`transition-all duration-300 ${
                          isActive ? 'w-[20px] h-[20px] text-primary-foreground' : 'w-[22px] h-[22px] text-muted-foreground/80'
                        }`} strokeWidth={isActive ? 2.4 : 2} />
                        {badge > 0 && (
                          <span className="absolute -top-0.5 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-[hsl(var(--gold))] text-[9px] font-bold px-1 text-[hsl(var(--accent-foreground))] ring-2 ring-card">
                            {badge}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] leading-none transition-all duration-200 ${
                        isActive ? 'font-semibold text-primary opacity-100' : 'font-medium text-muted-foreground/60 opacity-90'
                      }`}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </NavContext.Provider>
  );
};

export default Layout;

