
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Users, FileText } from 'lucide-react';
import { LabTest, labRanges } from '@/types/labData';

interface LabOverviewProps {
  patients: any[];
  onViewPatientLabs: (patientId: string) => void;
}

const LabOverview: React.FC<LabOverviewProps> = ({ patients, onViewPatientLabs }) => {
  // Mock lab data for demonstration - in real app, this would come from props or API
  const [recentLabResults] = useState<LabTest[]>([
    {
      id: 'lab_1',
      patientId: '1',
      testDate: '2024-06-15',
      category: 'blood_chemistry',
      creatinine: 1.8, // High
      potassium: 5.2, // High
      hemoglobin: 10.5, // Low
      reportedBy: 'lab',
      createdAt: '2024-06-15T10:00:00Z',
      updatedAt: '2024-06-15T10:00:00Z'
    },
    {
      id: 'lab_2',
      patientId: '2',
      testDate: '2024-06-14',
      category: 'blood_chemistry',
      creatinine: 1.0,
      potassium: 4.0,
      hemoglobin: 12.8,
      reportedBy: 'lab',
      createdAt: '2024-06-14T10:00:00Z',
      updatedAt: '2024-06-14T10:00:00Z'
    },
    {
      id: 'lab_3',
      patientId: '3',
      testDate: '2024-06-13',
      category: 'blood_chemistry',
      creatinine: 2.1, // High
      potassium: 3.2, // Low
      hemoglobin: 11.2,
      reportedBy: 'lab',
      createdAt: '2024-06-13T10:00:00Z',
      updatedAt: '2024-06-13T10:00:00Z'
    }
  ]);

  const getParameterStatus = (parameter: string, value: number) => {
    const range = labRanges.find(r => r.parameter === parameter);
    if (!range || !value) return 'normal';
    
    if (value < range.min) return 'low';
    if (value > range.max) return 'high';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id.toString() === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const abnormalResults = recentLabResults.filter(lab => {
    const parameters = ['creatinine', 'potassium', 'hemoglobin'];
    return parameters.some(param => {
      const value = lab[param as keyof LabTest] as number;
      return value && getParameterStatus(param, value) !== 'normal';
    });
  });

  const totalPatients = patients.length;
  const patientsWithRecentLabs = new Set(recentLabResults.map(lab => lab.patientId)).size;
  const abnormalResultsCount = abnormalResults.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Lab Data Overview</h2>
        <p className="text-gray-600">Monitor lab results across all patients</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Lab Results</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientsWithRecentLabs}</div>
            <p className="text-xs text-muted-foreground">Patients with recent labs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal Results</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{abnormalResultsCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((patientsWithRecentLabs / totalPatients) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Monthly lab completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Abnormal Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Abnormal Lab Results</span>
          </CardTitle>
          <CardDescription>Results requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {abnormalResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No abnormal results found</p>
          ) : (
            <div className="space-y-4">
              {abnormalResults.map((lab) => (
                <div key={lab.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{getPatientName(lab.patientId)}</h3>
                      <p className="text-sm text-gray-600">{new Date(lab.testDate).toLocaleDateString()}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewPatientLabs(lab.patientId)}
                    >
                      View Details
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['creatinine', 'potassium', 'hemoglobin'].map(param => {
                      const value = lab[param as keyof LabTest] as number;
                      if (!value) return null;
                      
                      const status = getParameterStatus(param, value);
                      const range = labRanges.find(r => r.parameter === param);
                      
                      return (
                        <div key={param} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{param}:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{value} {range?.unit}</span>
                            {status !== 'normal' && (
                              <Badge className={getStatusColor(status)}>
                                {status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Lab Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Lab Results Summary</CardTitle>
          <CardDescription>Latest lab results from all patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLabResults.map((lab) => (
              <div key={lab.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <h4 className="font-medium">{getPatientName(lab.patientId)}</h4>
                  <p className="text-sm text-gray-600">{new Date(lab.testDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {lab.category.replace('_', ' ')}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewPatientLabs(lab.patientId)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabOverview;
