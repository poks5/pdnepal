import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'patient' | 'doctor' | 'caregiver' | 'admin' | 'coordinator';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  language: string;
  hospital?: string;
  specialization?: string[];
  avatarUrl?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  language?: string;
  hospital?: string;
  specialization?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

async function fetchAppUser(supabaseUser: SupabaseUser): Promise<AppUser | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', supabaseUser.id)
    .single();

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supabaseUser.id);

  const role = (roles?.[0]?.role as UserRole) ?? 'patient';

  if (!profile) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    role,
    fullName: profile.full_name,
    phone: profile.phone ?? undefined,
    language: profile.language,
    hospital: profile.hospital ?? undefined,
    specialization: profile.specialization ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        // Use setTimeout to avoid potential deadlocks with Supabase client
        setTimeout(async () => {
          const appUser = await fetchAppUser(session.user);
          setUser(appUser);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchAppUser(session.user).then(appUser => {
          setUser(appUser);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: data.fullName,
          role: data.role,
          language: data.language ?? 'en',
        },
      },
    });
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
      throw error;
    }
    toast({ title: 'Account created', description: 'Check your email to verify your account.' });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    toast({ title: 'Email sent', description: 'Check your inbox for the password reset link.' });
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
  };

  return (
    <AuthContext.Provider value={{
      user, session, login, register, logout, resetPassword, updatePassword,
      isAuthenticated: !!user, loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
