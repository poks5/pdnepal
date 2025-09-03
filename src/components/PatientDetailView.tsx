
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, AlertTriangle, FileText, Users, Package, TrendingUp, Droplets, Plus } from 'lucide-react';
import LabDataManagement from '@/components/LabDataManagement';

interface PatientDetailViewProps {
  patient: any;
  onBack: () => void;
}

const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient, onBack }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showLabDialog, setShowLabDialog] = useState(false);

  // Mock data for demonstration
  const recentExchanges = [
    { id: 1, date: '2024-06-16', time: '06:00', drain: 2000, fill: 2000, uf: 300, clarity: 'clear' },
    { id: 2, date: '2024-06-16', time: '12:00', drain: 2100, fill: 2000, uf: 100, clarity: 'clear' },
    { id: 3, date: '2024-06-15', time: '18:00', drain: 1950, fill: 2000, uf: -50, clarity: 'cloudy' },
  ];

  const complications = [
    { id: 1, date: '2024-06-15', type: 'Cloudy effluent', severity: 'moderate', resolved: false },
    { id: 2, date: '2024-06-10', type: 'Exit site irritation', severity: 'mild', resolved: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <p className="text-gray-600">Age {patient.age} • ID: {patient.id}</p>
          </div>
        </div>
        <Badge className={patient.status === 'good' ? 'bg-green-100 text-green-800' : 
                         patient.status === 'stable' ? 'bg-blue-100 text-blue-800' : 
                         'bg-red-100 text-red-800'}>
          {patient.status}
        </Badge>
      </div>

      {/* Patient Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="exchanges" className="flex items-center space-x-2">
            <Droplets className="w-4 h-4" />
            <span>Exchanges</span>
          </TabsTrigger>
          <TabsTrigger value="complications" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Complications</span>
          </TabsTrigger>
          <TabsTrigger value="labs" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Labs</span>
          </TabsTrigger>
          <TabsTrigger value="caregiver" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Caregiver</span>
          </TabsTrigger>
          <TabsTrigger value="supplier" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Supplier</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly UF</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+2.1L</div>
                <p className="text-sm text-gray-600">Target: 2.0L/week</p>
                <Progress value={105} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Adherence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{patient.adherence}%</div>
                <p className="text-sm text-gray-600">Last 7 days</p>
                <Progress value={patient.adherence} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Last Exchange</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patient.lastExchange}</div>
                <p className="text-sm text-gray-600">Morning exchange completed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exchanges">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exchanges</CardTitle>
              <CardDescription>Detailed exchange history and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExchanges.map((exchange) => (
                  <div key={exchange.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{exchange.date} at {exchange.time}</p>
                        <p className="text-sm text-gray-600">
                          Drain: {exchange.drain}ml | Fill: {exchange.fill}ml | UF: {exchange.uf > 0 ? '+' : ''}{exchange.uf}ml
                        </p>
                      </div>
                      <Badge variant={exchange.clarity === 'clear' ? 'default' : 'destructive'}>
                        {exchange.clarity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complications">
          <Card>
            <CardHeader>
              <CardTitle>Complications History</CardTitle>
              <CardDescription>Track and manage patient complications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complications.map((complication) => (
                  <div key={complication.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{complication.type}</p>
                        <p className="text-sm text-gray-600">{complication.date}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={complication.severity === 'mild' ? 'secondary' : 
                                      complication.severity === 'moderate' ? 'default' : 'destructive'}>
                          {complication.severity}
                        </Badge>
                        <Badge variant={complication.resolved ? 'default' : 'destructive'}>
                          {complication.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Laboratory Data</CardTitle>
                  <CardDescription>Comprehensive lab results and history for {patient.name}</CardDescription>
                </div>
                <Button onClick={() => setShowLabDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Lab Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Lab Data Management</h3>
                <p className="text-gray-600 mb-4">
                  Access comprehensive lab data management for this patient.
                </p>
                <Button onClick={() => setShowLabDialog(true)}>
                  Open Lab Data Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caregiver">
          <Card>
            <CardHeader>
              <CardTitle>Caregiver Information</CardTitle>
              <CardDescription>Primary caregiver details and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">Sita Gurung</h3>
                  <p className="text-sm text-gray-600">Spouse</p>
                  <p className="text-sm">Phone: +977-9841234567</p>
                  <p className="text-sm">Email: sita.gurung@email.com</p>
                  <p className="text-sm">Language: Nepali</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplier">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
              <CardDescription>Medical supply details and delivery schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">Himalayan Medical Supplies</h3>
                  <p className="text-sm text-gray-600">Representative: Ram Kumar Shrestha</p>
                  <p className="text-sm">Phone: +977-9876543210</p>
                  <p className="text-sm">Last Delivery: 2024-06-10</p>
                  <p className="text-sm">Next Delivery: 2024-06-24</p>
                  <Badge variant="default" className="mt-2">Weekly Delivery</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lab Data Management Dialog */}
      <Dialog open={showLabDialog} onOpenChange={setShowLabDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lab Data Management - {patient.name}</DialogTitle>
          </DialogHeader>
          <LabDataManagement />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDetailView;
