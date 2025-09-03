
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, Calendar, Download } from 'lucide-react';
import { LabTest, labRanges } from '@/types/labData';

interface LabHistoryProps {
  labData: LabTest[];
  onEdit: (labTest: LabTest) => void;
}

const LabHistory: React.FC<LabHistoryProps> = ({ labData, onEdit }) => {
  const [selectedParameter, setSelectedParameter] = useState<string>('');

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

  const formatParameterValue = (parameter: string, value: number) => {
    const range = labRanges.find(r => r.parameter === parameter);
    return `${value} ${range?.unit || ''}`;
  };

  const exportLabData = () => {
    const csvContent = [
      'Date,Parameter,Value,Unit,Status,Notes',
      ...labData.flatMap(lab => 
        Object.entries(lab)
          .filter(([key, value]) => 
            typeof value === 'number' && 
            labRanges.some(r => r.parameter === key)
          )
          .map(([parameter, value]) => {
            const range = labRanges.find(r => r.parameter === parameter);
            const status = getParameterStatus(parameter, value as number);
            return `${lab.testDate},${parameter},${value},${range?.unit || ''},${status},"${lab.notes || ''}"`;
          })
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!labData || labData.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Data</h3>
          <p className="text-gray-600 text-center">
            Start tracking your lab results to see trends and history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lab History</h2>
          <p className="text-gray-600">Track your lab results over time</p>
        </div>
        <Button onClick={exportLabData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {labData
          .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())
          .map((lab) => (
            <Card key={lab.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>{new Date(lab.testDate).toLocaleDateString()}</span>
                    </CardTitle>
                    <CardDescription>
                      Reported by: {lab.reportedBy}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onEdit(lab)}>
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Blood Chemistry */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Blood Chemistry</h4>
                    <div className="space-y-2">
                      {Object.entries(lab)
                        .filter(([key, value]) => 
                          typeof value === 'number' && 
                          ['rbs', 'fbs', 'pp', 'hba1c', 'urea', 'creatinine', 'sodium', 'potassium', 'uricAcid', 'calcium', 'phosphorus', 'albumin'].includes(key)
                        )
                        .map(([parameter, value]) => {
                          const status = getParameterStatus(parameter, value as number);
                          const range = labRanges.find(r => r.parameter === parameter);
                          return (
                            <div key={parameter} className="flex items-center justify-between text-sm">
                              <span className="capitalize">{parameter.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <div className="flex items-center space-x-2">
                                <span>{formatParameterValue(parameter, value as number)}</span>
                                <Badge className={getStatusColor(status)} variant="secondary">
                                  {status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Hematology */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Hematology</h4>
                    <div className="space-y-2">
                      {Object.entries(lab)
                        .filter(([key, value]) => 
                          typeof value === 'number' && 
                          ['tc', 'neutrophil', 'lymphocyte', 'hemoglobin', 'platelets'].includes(key)
                        )
                        .map(([parameter, value]) => {
                          const status = getParameterStatus(parameter, value as number);
                          return (
                            <div key={parameter} className="flex items-center justify-between text-sm">
                              <span className="capitalize">{parameter.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <div className="flex items-center space-x-2">
                                <span>{formatParameterValue(parameter, value as number)}</span>
                                <Badge className={getStatusColor(status)} variant="secondary">
                                  {status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Hormones & Reports */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Hormones & Reports</h4>
                    <div className="space-y-2">
                      {lab.ipth && (
                        <div className="flex items-center justify-between text-sm">
                          <span>iPTH:</span>
                          <div className="flex items-center space-x-2">
                            <span>{formatParameterValue('ipth', lab.ipth)}</span>
                            <Badge className={getStatusColor(getParameterStatus('ipth', lab.ipth))} variant="secondary">
                              {getParameterStatus('ipth', lab.ipth)}
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      {lab.peritonealFluidReport && (
                        <div className="text-sm">
                          <span className="text-green-600">✓ Peritoneal Fluid Report</span>
                        </div>
                      )}
                      
                      {lab.petTestReport && (
                        <div className="text-sm">
                          <span className="text-green-600">✓ PET Test Report</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {lab.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-1">Notes:</h5>
                    <p className="text-sm text-gray-700">{lab.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default LabHistory;
