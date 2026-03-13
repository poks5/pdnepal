import React, { useState, createContext, useContext } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  const roleLabel: Record<string, string> = {
    patient: 'Patient',
    doctor: 'Doctor',
    caregiver: 'Caregiver',
    admin: 'Admin',
    coordinator: 'Coordinator',
  };

  const roleEmoji: Record<string, string> = {
    patient: '🩺',
    doctor: '👨‍⚕️',
    caregiver: '🤝',
    admin: '🛡️',
    coordinator: '📋',
  };

  const roleColor: Record<string, string> = {
    patient: 'bg-primary/10 text-primary',
    doctor: 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))]',
    caregiver: 'bg-[hsl(var(--peach))]/15 text-[hsl(var(--coral))]',
    admin: 'bg-destructive/10 text-destructive',
    coordinator: 'bg-[hsl(var(--lavender))]/15 text-[hsl(var(--lavender))]',
  };

  const patientNav = [
    { icon: Home, label: t('home'), id: 'overview', emoji: '🏠' },
    { icon: Activity, label: t('exchanges'), id: 'exchanges', emoji: '💧' },
    { icon: BookOpen, label: t('learningCenter'), id: 'learning', emoji: '📖' },
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

  const navRole = viewRole ?? user?.role;
  const navItems = navRole === 'doctor' ? doctorNav
    : navRole === 'admin' || navRole === 'coordinator' ? adminNav
    : patientNav;

  return (
    <NavContext.Provider value={{ activeTab, setActiveTab, badgeCounts, setBadgeCounts }}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/85 backdrop-blur-2xl border-b border-border/30 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden bg-primary/5">
                  <img src={pdsathiLogo} alt="PDsathi" className="w-9 h-9 object-contain" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base font-extrabold text-foreground leading-none tracking-tight">PDsathi</h1>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">PD Companion</p>
                </div>
              </div>

              {/* Desktop actions */}
              <div className="hidden md:flex items-center gap-4">
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
                  <div className="w-10 h-10 rounded-2xl gradient-hero flex items-center justify-center shadow-md">
                    <span className="text-lg">{roleEmoji[user?.role ?? ''] ?? '👤'}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground leading-none">{user?.fullName}</p>
                    <Badge className={`text-[10px] mt-1 px-2 py-0.5 border-0 font-semibold ${roleColor[user?.role ?? '']}`}>
                      {roleLabel[user?.role ?? ''] ?? user?.role}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive rounded-full">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                  className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-full"
                >
                  {language === 'en' ? 'ने' : 'EN'}
                </button>
                <Badge className={`text-[10px] px-2 py-0.5 border-0 font-semibold ${roleColor[user?.role ?? '']}`}>
                  {roleEmoji[user?.role ?? '']} {t(user?.role ?? 'patient')}
                </Badge>
                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/30 bg-card/95 backdrop-blur-2xl px-4 pb-5 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3.5 px-1">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden bg-primary/5 shadow-lg">
                  <img src={pdsathiLogo} alt="PDsathi" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="outline" size="sm" className="text-destructive justify-start rounded-2xl h-12 border-destructive/20">
                  <Phone className="w-4 h-4 mr-2" /> {t('emergency')}
                </Button>
                <Button variant="outline" size="sm" onClick={logout} className="justify-start rounded-2xl h-12">
                  <LogOut className="w-4 h-4 mr-2" /> {t('logout')}
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-28 md:pb-8">
          {children}
        </main>

        {/* Footer credit */}
        <footer className="hidden md:block text-center py-4 border-t border-border/20">
          <p className="text-[11px] text-muted-foreground/60">
            {t('conceptBy')} <span className="font-semibold text-muted-foreground/80">Dr. Anil Pokhrel</span> · {t('consultantNephrologist')}
          </p>
        </footer>

        {/* Modern mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="mx-3 mb-2 bg-card/90 backdrop-blur-2xl rounded-3xl border border-border/30 shadow-xl shadow-foreground/5">
            <div className="flex justify-around items-center h-[68px] px-1">
              {navItems.map(({ icon: Icon, label, id, emoji }) => {
                const isActive = activeTab === id;
                const badge = badgeCounts[id] || 0;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[52px] transition-all touch-target rounded-2xl active:scale-90 ${
                      isActive
                        ? 'bg-primary/10'
                        : ''
                    }`}
                  >
                    <div className="relative">
                      {isActive ? (
                        <span className="text-lg">{emoji}</span>
                      ) : (
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      )}
                      {badge > 0 && (
                        <span className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1 shadow-sm">
                          {badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] leading-none mt-0.5 ${isActive ? 'font-bold text-primary' : 'font-medium text-muted-foreground'}`}>{label}</span>
                    {isActive && <div className="w-5 h-1 bg-primary rounded-full mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </NavContext.Provider>
  );
};

export default Layout;
