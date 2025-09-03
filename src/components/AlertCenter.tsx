import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Droplets, Package, Phone, MessageSquare, FileText } from 'lucide-react';

interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'peritonitis_risk' | 'missed_exchange' | 'low_uf' | 'supply_delay' | 'catheter_issue' | 'lab_abnormal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  details?: string;
}

const AlertCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      patientId: '3',
      patientName: 'Krishna Prasad Oli',
      type: 'peritonitis_risk',
      severity: 'critical',
      message: 'Cloudy effluent reported 2x in 24h - Peritonitis risk',
      timestamp: '2024-06-16T08:30:00Z',
      acknowledged: false,
      details: 'Patient reported cloudy fluid in evening and morning exchanges. Recommend immediate evaluation.'
    },
    {
      id: '2',
      patientId: '3',
      patientName: 'Krishna Prasad Oli',
      type: 'missed_exchange',
      severity: 'high',
      message: 'Missed afternoon exchange - 6 hours overdue',
      timestamp: '2024-06-16T18:00:00Z',
      acknowledged: false,
      details: 'Patient was scheduled for 12:00 exchange, last contact at 06:00.'
    },
    {
      id: '3',
      patientId: '1',
      patientName: 'Ram Bahadur Gurung',
      type: 'low_uf',
      severity: 'medium',
      message: 'Low UF trend - 3 consecutive days below target',
      timestamp: '2024-06-16T06:00:00Z',
      acknowledged: false,
      details: 'UF volumes: Day 1: 150ml, Day 2: 100ml, Day 3: 180ml. Target: 300ml+'
    },
    {
      id: '4',
      patientId: '2',
      patientName: 'Sita Devi Sharma',
      type: 'supply_delay',
      severity: 'low',
      message: 'Supply delivery delayed - 2 days overdue',
      timestamp: '2024-06-15T09:00:00Z',
      acknowledged: false,
      details: 'Weekly delivery expected on 2024-06-13, supplier has not confirmed new date.'
    },
    {
      id: '5',
      patientId: '1',
      patientName: 'Ram Bahadur Gurung',
      type: 'lab_abnormal',
      severity: 'high',
      message: 'Abnormal lab results - High creatinine and potassium',
      timestamp: '2024-06-15T14:00:00Z',
      acknowledged: false,
      details: 'Creatinine: 1.8 mg/dL (Normal: 0.6-1.2), Potassium: 5.2 mEq/L (Normal: 3.5-5.0). Recommend immediate review.'
    },
    {
      id: '6',
      patientId: '3',
      patientName: 'Krishna Prasad Oli',
      type: 'lab_abnormal',
      severity: 'medium',
      message: 'Low potassium levels detected',
      timestamp: '2024-06-13T11:00:00Z',
      acknowledged: false,
      details: 'Potassium: 3.2 mEq/L (Normal: 3.5-5.0). Monitor for symptoms and consider supplementation.'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'peritonitis_risk': return <AlertTriangle className="w-4 h-4" />;
      case 'missed_exchange': return <Clock className="w-4 h-4" />;
      case 'low_uf': return <Droplets className="w-4 h-4" />;
      case 'supply_delay': return <Package className="w-4 h-4" />;
      case 'lab_abnormal': return <FileText className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Center</h2>
          <p className="text-gray-600">Clinical alerts and notifications requiring attention</p>
        </div>
        <Badge variant="destructive" className="text-sm">
          {unacknowledgedAlerts.length} Active Alerts
        </Badge>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Active Alerts</span>
          </CardTitle>
          <CardDescription>Alerts requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {unacknowledgedAlerts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active alerts</p>
          ) : (
            <div className="space-y-4">
              {unacknowledgedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{alert.patientName}</h3>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-sm text-gray-500">{getTimeAgo(alert.timestamp)}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{alert.message}</p>
                        {alert.details && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {alert.details}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        Acknowledge
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
            <CardTitle>Recently Acknowledged</CardTitle>
            <CardDescription>Previously addressed alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {acknowledgedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border rounded-lg p-3 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(alert.type)}
                      <div>
                        <h4 className="font-medium text-gray-900">{alert.patientName}</h4>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="secondary">Acknowledged</Badge>
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
