
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Phone, FileText, Settings } from 'lucide-react';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'stable': return 'bg-blue-100 text-blue-800';
      case 'attention': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>{t('patients')}</span>
        </CardTitle>
        <CardDescription>Monitor your patients' dialysis progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">
                        Age {patient.age} • Last exchange: {patient.lastExchange}
                      </p>
                      <p className="text-sm text-gray-600">
                        Weekly UF: {patient.weeklyUF}ml • Missed: {patient.missedExchanges}
                      </p>
                    </div>
                    {patient.alerts > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {patient.alerts} alerts
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Adherence</span>
                      <span className="font-medium">{patient.adherence}%</span>
                    </div>
                    <Progress value={patient.adherence} className="h-2" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Badge className={getStatusColor(patient.status)}>
                    {patient.status}
                  </Badge>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => onViewPatient(patient)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onManagePlan(patient)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Plan
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientList;
