
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useExchangePlan } from '@/contexts/ExchangePlanContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ExchangePlanEditor from './ExchangePlanEditor';
import { Clock, Edit, Plus, Calendar, Droplets, Timer, User, Stethoscope } from 'lucide-react';

const ExchangePlanView: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { currentPlan, plans, setActivePlan } = useExchangePlan();
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleEditPlan = (plan = null) => {
    setEditingPlan(plan);
    setShowEditor(true);
  };

  const handleSavePlan = () => {
    setShowEditor(false);
    setEditingPlan(null);
  };

  const getSolutionLabel = (solution: string) => {
    switch (solution) {
      case 'low': return '1.5% Glucose';
      case 'medium': return '2.5% Glucose';
      case 'high': return '4.25% Glucose';
      default: return solution;
    }
  };

  const getSolutionColor = (solution: string) => {
    switch (solution) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDwellTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  if (!currentPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Exchange Plan</span>
          </CardTitle>
          <CardDescription>No active exchange plan found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You don't have an active exchange plan yet.</p>
            <Button onClick={() => handleEditPlan()}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{currentPlan.name}</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active Plan
                </Badge>
              </CardTitle>
              <CardDescription>{currentPlan.description}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditPlan(currentPlan)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Plan
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditPlan()}
              >
                <Plus className="w-4 h-4 mr-1" />
                New Plan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Patient</p>
                <p className="font-medium">{currentPlan.patientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Stethoscope className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Last Modified By</p>
                <p className="font-medium">{currentPlan.modifiedAt}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Droplets className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Daily Volume</p>
                <p className="font-medium">{currentPlan.totalDailyVolume.toLocaleString()}ml</p>
              </div>
            </div>
          </div>
          {currentPlan.notes && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">{currentPlan.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exchange Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Exchange Schedule</CardTitle>
          <CardDescription>
            {currentPlan.schedules.filter(s => s.enabled).length} exchanges per day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentPlan.schedules
              .filter(schedule => schedule.enabled)
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((schedule, index) => (
              <div
                key={schedule.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-lg">{schedule.time}</span>
                      <Badge className="capitalize">{schedule.type}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{schedule.fillVolume}ml</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <Timer className="w-3 h-3 inline mr-1" />
                      <span>{formatDwellTime(schedule.dwellTime)}</span>
                    </div>
                    <Badge className={getSolutionColor(schedule.solution)}>
                      {getSolutionLabel(schedule.solution)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan History */}
      {user?.role === 'doctor' && (
        <Card>
          <CardHeader>
            <CardTitle>Plan History</CardTitle>
            <CardDescription>Previous exchange plans for this patient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plans
                .filter(plan => plan.patientId === currentPlan.patientId)
                .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
                .map((plan) => (
                <div
                  key={plan.id}
                  className={`p-3 border rounded-lg flex items-center justify-between ${
                    plan.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-gray-600">
                      Modified {plan.modifiedAt}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {plan.isActive && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePlan(plan.id)}
                      disabled={plan.isActive}
                    >
                      {plan.isActive ? 'Current' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ExchangePlanEditor
            plan={editingPlan}
            onSave={handleSavePlan}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExchangePlanView;
