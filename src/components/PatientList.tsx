import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Phone, FileText, Settings, ChevronRight, AlertTriangle } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  age: number;
  adherence: number;
  lastExchange: string;
  alerts: number;
  status: string;
  missedExchanges: number;
  weeklyUF: number;
}

interface PatientListProps {
  patients: Patient[];
  onViewPatient: (patient: Patient) => void;
  onManagePlan: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onViewPatient, onManagePlan }) => {
  const { t } = useLanguage();

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    good: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Good' },
    stable: { bg: 'bg-primary/10', text: 'text-primary', label: 'Stable' },
    attention: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Attention' },
  };

  return (
    <div className="space-y-3">
      {patients.map((patient) => {
        const status = statusConfig[patient.status] || statusConfig.stable;
        return (
          <Card
            key={patient.id}
            className="border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
            onClick={() => onViewPatient(patient)}
          >
            <CardContent className="p-4">
              {/* Mobile-first layout */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{patient.name}</h3>
                    <Badge className={`${status.bg} ${status.text} border-0 text-[10px] px-1.5 py-0`}>
                      {status.label}
                    </Badge>
                    {patient.alerts > 0 && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                        {patient.alerts}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Age {patient.age} · Last: {patient.lastExchange} · UF: {patient.weeklyUF}ml/wk
                  </p>

                  {/* Adherence bar */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <Progress value={patient.adherence} className="h-1.5 flex-1" />
                    <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{patient.adherence}%</span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </div>

              {/* Action buttons — hidden on mobile, show on tap/desktop */}
              <div className="hidden sm:flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <Button variant="default" size="sm" className="rounded-xl text-xs" onClick={(e) => { e.stopPropagation(); onViewPatient(patient); }}>
                  <FileText className="w-3.5 h-3.5 mr-1" /> Details
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={(e) => { e.stopPropagation(); onManagePlan(patient); }}>
                  <Settings className="w-3.5 h-3.5 mr-1" /> Plan
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={(e) => e.stopPropagation()}>
                  <Phone className="w-3.5 h-3.5 mr-1" /> Call
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PatientList;
