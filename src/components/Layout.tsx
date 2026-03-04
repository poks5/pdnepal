import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone, LogOut, Menu, X, User, Bell,
  Home, Activity, FileText, Settings, FlaskConical
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleLabel: Record<string, string> = {
    patient: 'Patient',
    doctor: 'Doctor',
    caregiver: 'Caregiver',
    admin: 'Admin',
    coordinator: 'Coordinator',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 gradient-medical rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-sm">PD</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-foreground leading-none">PDsathi</h1>
                <p className="text-xs text-muted-foreground">PD Companion</p>
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <Phone className="w-4 h-4 mr-1.5" />
                Emergency
              </Button>

              <div className="flex items-center gap-2 pl-3 border-l border-border">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground leading-none">{user?.fullName}</p>
                  <Badge variant="secondary" className="text-[10px] mt-0.5 px-1.5 py-0">
                    {roleLabel[user?.role ?? ''] ?? user?.role}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 pb-4 pt-2 space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{user?.fullName}</p>
                <Badge variant="secondary" className="text-[10px]">
                  {roleLabel[user?.role ?? ''] ?? user?.role}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-destructive justify-start">
                <Phone className="w-4 h-4 mr-2" /> Emergency
              </Button>
              <Button variant="outline" size="sm" onClick={logout} className="justify-start">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t border-border" style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-14">
          {[
            { icon: Home, label: 'Home' },
            { icon: Activity, label: 'Exchanges' },
            { icon: FlaskConical, label: 'Labs' },
            { icon: FileText, label: 'Plans' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex flex-col items-center gap-0.5 py-1 px-3 text-muted-foreground hover:text-primary transition-colors touch-target">
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
