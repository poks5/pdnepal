import React, { useState, createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone, LogOut, Menu, X, User, Bell,
  Home, Activity, FileText, Settings, FlaskConical,
  Users, BarChart, Shield
} from 'lucide-react';

// Context for bottom nav ↔ dashboard tab sync
interface NavContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
const NavContext = createContext<NavContextType>({ activeTab: 'overview', setActiveTab: () => {} });
export const useNav = () => useContext(NavContext);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const roleLabel: Record<string, string> = {
    patient: 'Patient',
    doctor: 'Doctor',
    caregiver: 'Caregiver',
    admin: 'Admin',
    coordinator: 'Coordinator',
  };

  const roleColor: Record<string, string> = {
    patient: 'bg-primary/10 text-primary',
    doctor: 'bg-emerald-500/10 text-emerald-600',
    caregiver: 'bg-amber-500/10 text-amber-600',
    admin: 'bg-destructive/10 text-destructive',
    coordinator: 'bg-violet-500/10 text-violet-600',
  };

  const patientNav = [
    { icon: Home, label: 'Home', id: 'overview' },
    { icon: Activity, label: 'Exchanges', id: 'exchanges' },
    { icon: FlaskConical, label: 'Labs', id: 'lab-data' },
    { icon: BarChart, label: 'Analytics', id: 'analytics' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  const doctorNav = [
    { icon: Home, label: 'Home', id: 'patients' },
    { icon: Bell, label: 'Alerts', id: 'alerts' },
    { icon: FlaskConical, label: 'Labs', id: 'labs' },
    { icon: FileText, label: 'Plans', id: 'plans' },
    { icon: Settings, label: 'More', id: 'export' },
  ];

  const adminNav = [
    { icon: Home, label: 'Home', id: 'overview' },
    { icon: Users, label: 'Users', id: 'users' },
    { icon: Shield, label: 'Security', id: 'security' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  const navItems = user?.role === 'doctor' ? doctorNav
    : user?.role === 'admin' || user?.role === 'coordinator' ? adminNav
    : patientNav;

  return (
    <NavContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 gradient-medical rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                  <span className="text-primary-foreground font-bold text-sm tracking-tight">PD</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base font-bold text-foreground leading-none tracking-tight">PDsathi</h1>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">PD Companion</p>
                </div>
              </div>

              {/* Desktop actions */}
              <div className="hidden md:flex items-center gap-4">
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-full px-4">
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Emergency
                </Button>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground leading-none">{user?.fullName}</p>
                    <Badge className={`text-[10px] mt-1 px-1.5 py-0 border-0 ${roleColor[user?.role ?? '']}`}>
                      {roleLabel[user?.role ?? ''] ?? user?.role}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive rounded-full">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex md:hidden items-center gap-1">
                <Badge className={`text-[10px] px-2 py-0.5 border-0 ${roleColor[user?.role ?? '']}`}>
                  {roleLabel[user?.role ?? ''] ?? user?.role}
                </Badge>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl px-4 pb-4 pt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3 px-1 py-2">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-destructive justify-start rounded-xl h-11">
                  <Phone className="w-4 h-4 mr-2" /> Emergency
                </Button>
                <Button variant="outline" size="sm" onClick={logout} className="justify-start rounded-xl h-11">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/90 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.map(({ icon: Icon, label, id }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[56px] transition-all touch-target rounded-xl active:scale-95 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-[10px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
                  {isActive && <div className="w-4 h-0.5 bg-primary rounded-full mt-0.5" />}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </NavContext.Provider>
  );
};

export default Layout;
