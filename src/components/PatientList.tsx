import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  FileText, Settings, ChevronRight, AlertTriangle, Inbox,
  Search, SortAsc, SortDesc, Filter
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Patient {
  id: string;
  name: string;
  age: number;
  adherence: number;
  lastExchange: string;
  alerts: number;
  status: string;
  missedExchanges: number;
  weeklyUF: number;
  hospital?: string;
}

interface PatientListProps {
  patients: Patient[];
  onViewPatient: (patient: Patient) => void;
  onManagePlan: (patient: Patient) => void;
}

type SortField = 'name' | 'adherence' | 'alerts' | 'weeklyUF';

const PatientList: React.FC<PatientListProps> = ({ patients, onViewPatient, onManagePlan }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    good: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: '✅ Good' },
    stable: { bg: 'bg-primary/10', text: 'text-primary', label: '🔵 Stable' },
    attention: { bg: 'bg-destructive/10', text: 'text-destructive', label: '⚠️ Attention' },
  };

  const filtered = useMemo(() => {
    let list = patients;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.hospital?.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter(p => p.status === statusFilter);
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'adherence') cmp = a.adherence - b.adherence;
      else if (sortField === 'alerts') cmp = a.alerts - b.alerts;
      else if (sortField === 'weeklyUF') cmp = a.weeklyUF - b.weeklyUF;
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [patients, search, statusFilter, sortField, sortAsc]);

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No patients assigned yet</p>
        <p className="text-xs text-muted-foreground mt-1">Patients will appear here once they request and you approve them</p>
      </div>
    );
  }

  const statusCounts = {
    all: patients.length,
    attention: patients.filter(p => p.status === 'attention').length,
    stable: patients.filter(p => p.status === 'stable').length,
    good: patients.filter(p => p.status === 'good').length,
  };

  return (
    <div className="space-y-3">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-card border-border/50 h-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-xl h-10 border-border/50">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({statusCounts.all})</SelectItem>
              <SelectItem value="attention">⚠️ Attention ({statusCounts.attention})</SelectItem>
              <SelectItem value="stable">🔵 Stable ({statusCounts.stable})</SelectItem>
              <SelectItem value="good">✅ Good ({statusCounts.good})</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger className="w-[130px] rounded-xl h-10 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">By Name</SelectItem>
              <SelectItem value="adherence">By Adherence</SelectItem>
              <SelectItem value="alerts">By Alerts</SelectItem>
              <SelectItem value="weeklyUF">By UF</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/50" onClick={() => setSortAsc(!sortAsc)}>
            {sortAsc ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground px-1">
        Showing {filtered.length} of {patients.length} patients
      </p>

      {/* Patient cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No patients match your filters</p>
        </div>
      ) : (
        filtered.map((patient) => {
          const status = statusConfig[patient.status] || statusConfig.stable;
          return (
            <Card
              key={patient.id}
              className="border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
              onClick={() => onViewPatient(patient)}
            >
              <CardContent className="p-4">
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
                      {patient.age > 0 ? `Age ${patient.age}` : ''}
                      {patient.hospital ? ` · ${patient.hospital}` : ''}
                      {` · Last: ${patient.lastExchange}`}
                      {` · UF: ${patient.weeklyUF}ml/wk`}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Progress value={patient.adherence} className="h-1.5 flex-1" />
                      <span className={`text-xs font-semibold w-8 text-right ${patient.adherence < 75 ? 'text-destructive' : patient.adherence < 90 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {patient.adherence}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                </div>
                <div className="hidden sm:flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                  <Button variant="default" size="sm" className="rounded-xl text-xs" onClick={(e) => { e.stopPropagation(); onViewPatient(patient); }}>
                    <FileText className="w-3.5 h-3.5 mr-1" /> Details
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={(e) => { e.stopPropagation(); onManagePlan(patient); }}>
                    <Settings className="w-3.5 h-3.5 mr-1" /> Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default PatientList;
