import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, Activity, Settings, Database, Shield, TrendingUp,
  ChevronLeft, Building2, History, Lock, Wrench, FileText,
  AlertTriangle, Loader2
} from 'lucide-react';
import UserManagement from '@/components/UserManagement';
import SystemSettings from '@/components/SystemSettings';
import SecurityCenter from '@/components/SecurityCenter';
import DatabaseAdmin from '@/components/DatabaseAdmin';
import DataManagement from '@/components/DataManagement';
import SystemConfigPanel from '@/components/admin/SystemConfigPanel';
import RecordVersionHistory from '@/components/admin/RecordVersionHistory';
import CenterManagement from '@/components/admin/CenterManagement';
import AuditLogViewer from '@/components/admin/AuditLogViewer';

interface LiveStats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalExchangesToday: number;
  activeAlerts: number;
  totalCenters: number;
  recentAuditCount: number;
  lockedRecords: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveStats();
  }, []);

  const fetchLiveStats = async () => {
    setLoading(true);
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [usersRes, rolesRes, exchangesRes, alertsRes, centersRes, auditRes, locksRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('role'),
        supabase.from('exchange_logs').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('clinical_alerts').select('id', { count: 'exact', head: true }).eq('acknowledged', false),
        supabase.from('centers').select('id', { count: 'exact', head: true }),
        supabase.from('audit_log').select('id', { count: 'exact', head: true }).gte('created_at', last24h),
        supabase.from('record_locks').select('id', { count: 'exact', head: true }),
      ]);

      const roles = rolesRes.data || [];
      setStats({
        totalUsers: usersRes.count || 0,
        totalPatients: roles.filter(r => r.role === 'patient').length,
        totalDoctors: roles.filter(r => r.role === 'doctor').length,
        totalExchangesToday: exchangesRes.count || 0,
        activeAlerts: alertsRes.count || 0,
        totalCenters: centersRes.count || 0,
        recentAuditCount: auditRes.count || 0,
        lockedRecords: locksRes.count || 0,
      });
    } catch (err) {
      console.error('Admin stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const navSections = [
    {
      label: language === 'en' ? 'System Management' : 'प्रणाली व्यवस्थापन',
      items: [
        { id: 'users', icon: Users, label: language === 'en' ? 'User Management' : 'प्रयोगकर्ता व्यवस्थापन', desc: language === 'en' ? 'Roles, permissions, activity' : 'भूमिका, अनुमति' },
        { id: 'centers', icon: Building2, label: language === 'en' ? 'Center Management' : 'केन्द्र व्यवस्थापन', desc: language === 'en' ? 'Multi-hospital support' : 'बहु-अस्पताल सहायता', badge: stats?.totalCenters },
        { id: 'config', icon: Wrench, label: language === 'en' ? 'Clinical Configuration' : 'क्लिनिकल कन्फिगरेसन', desc: language === 'en' ? 'Fluids, antibiotics, lab ranges' : 'तरल, एन्टिबायोटिक, ल्याब' },
        { id: 'settings', icon: Settings, label: language === 'en' ? 'System Settings' : 'प्रणाली सेटिङ', desc: language === 'en' ? 'General system configuration' : 'सामान्य प्रणाली कन्फिगरेसन' },
      ],
    },
    {
      label: language === 'en' ? 'Data & Security' : 'डाटा र सुरक्षा',
      items: [
        { id: 'audit', icon: FileText, label: language === 'en' ? 'Audit Logs' : 'अडिट लग', desc: language === 'en' ? 'All system actions tracked' : 'सबै प्रणाली कार्यहरू ट्र्याक', badge: stats?.recentAuditCount },
        { id: 'versions', icon: History, label: language === 'en' ? 'Record History' : 'रेकर्ड इतिहास', desc: language === 'en' ? 'Version tracking & data locks' : 'संस्करण ट्र्याकिङ र डाटा लक', badge: stats?.lockedRecords },
        { id: 'security', icon: Shield, label: language === 'en' ? 'Security Center' : 'सुरक्षा केन्द्र', desc: language === 'en' ? 'Security policies & monitoring' : 'सुरक्षा नीति र निगरानी' },
        { id: 'database', icon: Database, label: language === 'en' ? 'Database Admin' : 'डाटाबेस एडमिन', desc: language === 'en' ? 'Backups & data management' : 'ब्याकअप र डाटा व्यवस्थापन' },
      ],
    },
  ];

  // Sub-page rendering
  if (activeTab !== 'overview') {
    const allItems = navSections.flatMap(s => s.items);
    const current = allItems.find(i => i.id === activeTab);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('overview')} className="gap-1.5 rounded-xl">
            <ChevronLeft className="w-4 h-4" /> {language === 'en' ? 'Admin' : 'एडमिन'}
          </Button>
          {current && (
            <div className="flex items-center gap-2">
              <current.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{current.label}</span>
            </div>
          )}
          <Badge variant="outline" className="ml-auto bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
            {language === 'en' ? 'Admin' : 'एडमिन'}
          </Badge>
        </div>

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'centers' && <CenterManagement />}
        {activeTab === 'config' && <SystemConfigPanel />}
        {activeTab === 'settings' && <SystemSettings />}
        {activeTab === 'audit' && <AuditLogViewer />}
        {activeTab === 'versions' && <RecordVersionHistory />}
        {activeTab === 'security' && <SecurityCenter />}
        {activeTab === 'database' && <DatabaseAdmin />}
        {activeTab === 'data' && <DataManagement />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            {language === 'en' ? 'Admin Dashboard' : 'प्रशासक ड्यासबोर्ड'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {language === 'en' ? `Welcome, ${user?.fullName}` : `स्वागत, ${user?.fullName}`}
          </p>
        </div>
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
          {language === 'en' ? 'Super Admin' : 'सुपर एडमिन'}
        </Badge>
      </div>

      {/* Live Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<Users className="w-4 h-4" />} label={language === 'en' ? 'Total Users' : 'कुल प्रयोगकर्ता'} value={stats.totalUsers} color="primary" />
          <StatCard icon={<Activity className="w-4 h-4" />} label={language === 'en' ? 'Exchanges Today' : 'आज एक्सचेन्ज'} value={stats.totalExchangesToday} color="accent" />
          <StatCard icon={<AlertTriangle className="w-4 h-4" />} label={language === 'en' ? 'Active Alerts' : 'सक्रिय अलर्ट'} value={stats.activeAlerts} color={stats.activeAlerts > 0 ? 'destructive' : 'accent'} />
          <StatCard icon={<Building2 className="w-4 h-4" />} label={language === 'en' ? 'Centers' : 'केन्द्रहरू'} value={stats.totalCenters} color="primary" />
        </div>
      )}

      {/* User Breakdown */}
      {stats && (
        <Card className="border-border/40 rounded-2xl">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{stats.totalPatients}</p>
                <p className="text-[10px] text-muted-foreground">{language === 'en' ? 'Patients' : 'बिरामी'}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stats.totalDoctors}</p>
                <p className="text-[10px] text-muted-foreground">{language === 'en' ? 'Doctors' : 'डाक्टर'}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stats.totalUsers - stats.totalPatients - stats.totalDoctors}</p>
                <p className="text-[10px] text-muted-foreground">{language === 'en' ? 'Staff/Others' : 'कर्मचारी/अन्य'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card className="border-accent/20 bg-accent/5 rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{language === 'en' ? 'System Online' : 'प्रणाली अनलाइन'}</p>
            <p className="text-[10px] text-muted-foreground">{language === 'en' ? 'All services operational' : 'सबै सेवा सञ्चालनमा'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">{language === 'en' ? 'Version' : 'संस्करण'}</p>
            <p className="text-xs font-bold text-foreground">v3.0.0</p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Sections */}
      {navSections.map((section, si) => (
        <div key={si} className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {section.label}
          </p>
          <div className="space-y-1.5">
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-sm transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold px-1">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    accent: 'text-accent bg-accent/10',
    destructive: 'text-destructive bg-destructive/10',
  };
  return (
    <Card className="border-border/40 rounded-2xl">
      <CardContent className="p-3 text-center">
        <div className={`w-8 h-8 rounded-lg ${colorClasses[color] || colorClasses.primary} flex items-center justify-center mx-auto mb-1.5`}>
          {icon}
        </div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
