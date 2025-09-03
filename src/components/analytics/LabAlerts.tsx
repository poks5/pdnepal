import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, TrendingDown, Bell } from 'lucide-react';

interface LabAlert {
  id: string;
  parameter: string;
  value: number;
  referenceRange: string;
  severity: 'low' | 'high' | 'critical';
  trend: 'improving' | 'stable' | 'worsening';
  recommendation: string;
  timestamp: string;
}

const LabAlerts: React.FC = () => {
  const alerts: LabAlert[] = [
    {
      id: '1',
      parameter: 'Hemoglobin',
      value: 8.2,
      referenceRange: '12.0-15.5 g/dL',
      severity: 'low',
      trend: 'worsening',
      recommendation: 'Consider iron supplementation and EPO therapy evaluation',
      timestamp: '2024-06-15T10:00:00Z'
    },
    {
      id: '2',
      parameter: 'Phosphorus',
      value: 6.8,
      referenceRange: '2.5-4.5 mg/dL',
      severity: 'high',
      trend: 'stable',
      recommendation: 'Review phosphate binder dosage and dietary phosphorus intake',
      timestamp: '2024-06-15T10:00:00Z'
    },
    {
      id: '3',
      parameter: 'iPTH',
      value: 650,
      referenceRange: '15-65 pg/mL',
      severity: 'critical',
      trend: 'improving',
      recommendation: 'Immediate nephrologist consultation for hyperparathyroidism management',
      timestamp: '2024-06-15T10:00:00Z'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'worsening': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const otherAlerts = alerts.filter(alert => alert.severity !== 'critical');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lab Result Alerts</h2>
          <p className="text-gray-600">Automated flagging of concerning lab values</p>
        </div>
        <Button variant="outline">
          <Bell className="w-4 h-4 mr-2" />
          Alert Settings
        </Button>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Critical Alerts - Immediate Attention Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalAlerts.map(alert => (
                <div key={alert.id} className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-red-800">{alert.parameter}</h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      {getTrendIcon(alert.trend)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Current Value</p>
                      <p className="text-lg font-bold text-red-600">{alert.value}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reference Range</p>
                      <p className="text-sm font-medium">{alert.referenceRange}</p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800 font-medium mb-1">Recommendation:</p>
                    <p className="text-sm text-red-700">{alert.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Value Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {otherAlerts.map(alert => (
              <div key={alert.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{alert.parameter}</h3>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    {getTrendIcon(alert.trend)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Current Value</p>
                    <p className={`text-lg font-bold ${
                      alert.severity === 'high' ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {alert.value}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reference Range</p>
                    <p className="text-sm font-medium">{alert.referenceRange}</p>
                  </div>
                </div>
                
                <div className={`border rounded p-3 ${
                  alert.severity === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className={`text-sm font-medium mb-1 ${
                    alert.severity === 'high' ? 'text-orange-800' : 'text-blue-800'
                  }`}>
                    Recommendation:
                  </p>
                  <p className={`text-sm ${
                    alert.severity === 'high' ? 'text-orange-700' : 'text-blue-700'
                  }`}>
                    {alert.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {alerts.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
              <p className="text-gray-600">All lab values are within normal ranges.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <p className="text-sm text-gray-600">Require immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alerts.length}</div>
            <p className="text-sm text-gray-600">Active lab alerts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trending Worse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.trend === 'worsening').length}
            </div>
            <p className="text-sm text-gray-600">Deteriorating values</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabAlerts;
