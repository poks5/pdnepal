import React from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Eye } from 'lucide-react';

interface RoleSwitcherProps {
  activeViewRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
}

const allRoles: { role: UserRole; label: string; emoji: string; color: string }[] = [
  { role: 'admin', label: 'Admin', emoji: '🛡️', color: 'bg-destructive/15 text-destructive border-destructive/30' },
  { role: 'coordinator', label: 'Coordinator', emoji: '📋', color: 'bg-[hsl(var(--lavender))]/15 text-[hsl(var(--lavender))] border-[hsl(var(--lavender))]/30' },
  { role: 'doctor', label: 'Doctor', emoji: '👨‍⚕️', color: 'bg-[hsl(var(--mint))]/15 text-[hsl(var(--mint))] border-[hsl(var(--mint))]/30' },
  { role: 'caregiver', label: 'Caregiver', emoji: '🤝', color: 'bg-[hsl(var(--peach))]/15 text-[hsl(var(--coral))] border-[hsl(var(--coral))]/30' },
  { role: 'patient', label: 'Patient', emoji: '🩺', color: 'bg-primary/15 text-primary border-primary/30' },
];

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ activeViewRole, onSwitchRole }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Only show for admin users
  if (!user?.roles?.includes('admin')) return null;

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-3 shadow-lg">
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center">
          <Shield className="w-3.5 h-3.5 text-destructive" />
        </div>
        <span className="text-xs font-bold text-foreground tracking-wide uppercase">View As</span>
        <div className="flex items-center gap-1 ml-auto text-[10px] text-muted-foreground">
          <Eye className="w-3 h-3" />
          <span className="font-medium">Super Admin</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {allRoles.map(({ role, label, emoji, color }) => {
          const isActive = activeViewRole === role;
          return (
            <button
              key={role}
              onClick={() => onSwitchRole(role)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                border transition-all duration-200 active:scale-95
                ${isActive
                  ? `${color} shadow-sm ring-1 ring-current/20`
                  : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/70'
                }
              `}
            >
              <span className="text-sm">{emoji}</span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSwitcher;
