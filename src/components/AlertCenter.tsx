import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Droplets, FlaskConical, Pill, TrendingDown, Phone, MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface ClinicalAlert {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  details: string | null;
  related_record_id: string | null;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
  expires_at: string | null;
}

const AlertCenter: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchAlerts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('clinical_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data as ClinicalAlert[]) || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const runAlertCheck = async () => {
    if (!user) return;
    setChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('check-clinical-alerts', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      if (data?.alerts) {
        setAlerts(data.alerts);
      }
      if (data?.generated > 0) {
        toast({ title: t('alertsGenerated') || `${data.generated} new alert(s) found` });
      } else {
        toast({ title: t('noNewAlerts') || 'No new alerts detected' });
      }
    } catch (err) {
      console.error('Alert check failed:', err);
      toast({ title: 'Alert check failed', variant: 'destructive' });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-destructive/15 text-destructive';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'high_wbc': return <Droplets className="w-4 h-4" />;
      case 'culture_result': return <FlaskConical className="w-4 h-4" />;
      case 'antibiotic_overdue': return <Pill className="w-4 h-4" />;
      case 'no_improvement': return <TrendingDown className="w-4 h-4" />;
      case 'missed_exchange': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'high_wbc': return t('highWBC') || 'High WBC';
      case 'culture_result': return t('cultureResult') || 'Culture Result';
      case 'antibiotic_overdue': return t('antibioticOverdue') || 'Antibiotic Overdue';
      case 'no_improvement': return t('noImprovement') || 'No Improvement';
      default: return type;
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('clinical_alerts')
        .update({
          acknowledged: true,
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      setAlerts(prev =>
        prev.map(a => a.id === alertId ? { ...a, acknowledged: true, acknowledged_by: user?.id || null, acknowledged_at: new Date().toISOString() } : a)
      );
    } catch (err) {
      console.error('Failed to acknowledge:', err);
      toast({ title: 'Failed to acknowledge alert', variant: 'destructive' });
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return t('justNow') || 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('alertCenter') || 'Alert Center'}</h2>
          <p className="text-muted-foreground">{t('clinicalAlertsDescription') || 'Smart clinical alerts based on patient data'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={runAlertCheck} disabled={checking}>
            {checking ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            {t('checkAlerts') || 'Check Alerts'}
          </Button>
          <Badge variant="destructive" className="text-sm">
            {unacknowledgedAlerts.length} {t('active') || 'Active'}
          </Badge>
        </div>
      </div>

      {/* Alert type legend */}
      <div className="flex flex-wrap gap-2">
        {['high_wbc', 'culture_result', 'antibiotic_overdue', 'no_improvement'].map(type => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
            {getTypeIcon(type)}
            <span>{getTypeLabel(type)}</span>
          </div>
        ))}
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span>{t('activeAlerts') || 'Active Alerts'}</span>
          </CardTitle>
          <CardDescription>{t('alertsRequiringAttention') || 'Alerts requiring immediate attention'}</CardDescription>
        </CardHeader>
        <CardContent>
          {unacknowledgedAlerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('noActiveAlerts') || 'No active alerts'}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('clickCheckAlerts') || 'Click "Check Alerts" to scan patient data'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unacknowledgedAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="mt-1 shrink-0">{getTypeIcon(alert.alert_type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm">{alert.title}</h3>
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          <span className="text-xs text-muted-foreground">{getTimeAgo(alert.created_at)}</span>
                        </div>
                        <p className="text-sm text-foreground/80 mb-2">{alert.message}</p>
                        {alert.details && (
                          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{alert.details}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Phone className="w-4 h-4 mr-1" />
                        {t('call') || 'Call'}
                      </Button>
                      <Button variant="outline" size="sm" className="hidden sm:flex">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {t('message') || 'Message'}
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                        {t('acknowledge') || 'Acknowledge'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('recentlyAcknowledged') || 'Recently Acknowledged'}</CardTitle>
            <CardDescription>{t('previouslyAddressedAlerts') || 'Previously addressed alerts'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {acknowledgedAlerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="border rounded-lg p-3 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      {getTypeIcon(alert.alert_type)}
                      <div className="min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{alert.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      <Badge variant="secondary">{t('acknowledged') || 'Acknowledged'}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlertCenter;
