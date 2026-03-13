import React, { useState } from 'react';
import { useAuth, type RegisterData, type UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  UserPlus, Mail, Lock, Phone, Building2, Stethoscope,
  ArrowLeft, ArrowRight, Eye, EyeOff, Heart, Users
} from 'lucide-react';

interface Props {
  onBack: () => void;
}

const ROLES: { role: UserRole; icon: React.ReactNode; label: string; desc: string }[] = [
  { role: 'patient', icon: <Heart className="w-7 h-7" />, label: 'Patient', desc: 'Manage your PD care' },
  { role: 'doctor', icon: <Stethoscope className="w-7 h-7" />, label: 'Doctor', desc: 'Monitor your patients' },
  { role: 'nurse', icon: <Users className="w-7 h-7" />, label: 'PD Nurse', desc: 'Provide nursing care' },
  { role: 'dietician', icon: <Heart className="w-7 h-7" />, label: 'Dietician', desc: 'Nutrition guidance' },
  { role: 'caregiver', icon: <Users className="w-7 h-7" />, label: 'Caregiver', desc: 'Support a loved one' },
];

const RegisterForm: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', hospital: '' });
  const { register } = useAuth();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    try {
      await register({
        ...form,
        role: selectedRole,
        language: 'en',
      });
    } catch {
      // toast in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 gradient-medical rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
            <span className="text-primary-foreground font-bold text-2xl">PD</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardContent className="pt-6">
            {step === 'role' ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-2">Select your role to get started</p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(({ role, icon, label, desc }) => (
                    <button
                      key={role}
                      onClick={() => handleRoleSelect(role)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all touch-target text-left"
                    >
                      <div className="text-primary">{icon}</div>
                      <span className="font-semibold text-sm">{label}</span>
                      <span className="text-xs text-muted-foreground text-center">{desc}</span>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" onClick={onBack} className="w-full mt-2">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button type="button" onClick={() => setStep('role')} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    Registering as {selectedRole}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      required
                      value={form.fullName}
                      onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                      className="h-12 pl-10 touch-target"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="h-12 pl-10 touch-target"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="h-12 pl-10 touch-target"
                      placeholder="+977-9xxxxxxxxx"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={form.password}
                      onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                      className="h-12 pl-10 pr-10 touch-target"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {(selectedRole === 'doctor' || selectedRole === 'coordinator') && (
                  <div className="space-y-2">
                    <Label>Hospital / Clinic</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={form.hospital}
                        onChange={(e) => setForm(f => ({ ...f, hospital: e.target.value }))}
                        className="h-12 pl-10 touch-target"
                        placeholder="Your workplace"
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full h-12 touch-target text-base" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;
