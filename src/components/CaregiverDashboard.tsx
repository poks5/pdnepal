
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Calendar, AlertTriangle, MessageSquare, User, BookOpen } from 'lucide-react';
import LearningCenter from './learning/LearningCenter';

const CaregiverDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [patientData] = useState({
    name: 'Ram Bahadur Gurung',
    relationship: 'Father',
    todayExchanges: { completed: 2, total: 4 },
    adherence: 85,
    lastExchange: '2 hours ago',
    alerts: 1
  });

  const [recentExchanges] = useState([
    { time: '06:00', type: 'morning', completed: true, clarity: 'clear' },
    { time: '12:00', type: 'afternoon', completed: true, clarity: 'clear' },
    { time: '18:00', type: 'evening', completed: false, clarity: null },
    { time: '22:00', type: 'night', completed: false, clarity: null }
  ]);

  const adherencePercent = (patientData.todayExchanges.completed / patientData.todayExchanges.total) * 100;

  const [caregiverTab, setCaregiverTab] = useState('overview');

  return (
    <div className="space-y-6">
      <Tabs value={caregiverTab} onValueChange={setCaregiverTab}>
        <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
          <TabsList className="inline-flex w-max gap-1 bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
              <Heart className="w-3.5 h-3.5" /> {t('overview')}
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
              <BookOpen className="w-3.5 h-3.5" /> {language === 'en' ? 'Learning' : 'सिकाइ'}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="learning">
          <LearningCenter />
        </TabsContent>

        <TabsContent value="overview">
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">{t('welcome')}, Maya!</h1>
        <p className="text-purple-100">
          Caring for {patientData.name} ({patientData.relationship})
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span className="text-sm">Caregiver Dashboard</span>
          </div>
          <Badge className="bg-purple-100 text-purple-800">Read-only Access</Badge>
        </div>
      </div>

      {/* Patient Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Patient Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Today's Progress</span>
                  <span>{patientData.todayExchanges.completed}/{patientData.todayExchanges.total}</span>
                </div>
                <Progress value={adherencePercent} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{patientData.adherence}%</div>
                  <div className="text-xs text-gray-600">Weekly Adherence</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{patientData.alerts}</div>
                  <div className="text-xs text-gray-600">Active Alerts</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Doctor's Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  "Patient showing good progress. Continue current routine. Monitor for any cloudy drainage."
                </p>
                <p className="text-xs text-gray-500 mt-2">Dr. Sharma - 2 hours ago</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Doctor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Exchange Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Today's Exchange Schedule</span>
          </CardTitle>
          <CardDescription>Monitor your loved one's dialysis exchanges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExchanges.map((exchange, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  exchange.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      exchange.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {exchange.time} - {t(exchange.type)}
                      </p>
                      {exchange.completed && exchange.clarity && (
                        <p className="text-sm text-gray-600">
                          Clarity: {exchange.clarity}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={exchange.completed ? "default" : "secondary"}
                    className={exchange.completed ? "bg-green-100 text-green-800" : ""}
                  >
                    {exchange.completed ? t('completed') : t('pending')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Alerts & Reminders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm text-gray-700">Next exchange reminder in 2 hours (6:00 PM)</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm text-gray-700">Patient maintaining good adherence - 3 day streak!</p>
            </div>
            {patientData.alerts > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <p className="text-sm text-gray-700">Doctor wants to review recent UF trends</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaregiverDashboard;
