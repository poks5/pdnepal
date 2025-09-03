
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pill, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string[];
  exchangeRelated: boolean;
  lastTaken: string;
  nextDue: string;
  adherence: number;
}

const MedicationTracker: React.FC = () => {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Calcium Carbonate',
      dosage: '500mg',
      frequency: 'With meals',
      timing: ['08:00', '13:00', '19:00'],
      exchangeRelated: true,
      lastTaken: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      nextDue: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      adherence: 85
    },
    {
      id: '2',
      name: 'Sevelamer',
      dosage: '800mg',
      frequency: 'Before exchanges',
      timing: ['06:00', '12:00', '18:00', '24:00'],
      exchangeRelated: true,
      lastTaken: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      nextDue: new Date().toISOString(),
      adherence: 92
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    exchangeRelated: false
  });

  const handleTakeMedication = (medicationId: string) => {
    setMedications(prev => prev.map(med => {
      if (med.id === medicationId) {
        const now = new Date();
        const timings = med.timing;
        const currentHour = now.getHours();
        
        // Find next scheduled time
        let nextTime = timings.find(time => {
          const [hour] = time.split(':').map(Number);
          return hour > currentHour;
        });
        
        if (!nextTime) {
          nextTime = timings[0]; // Next day's first dose
        }
        
        const [nextHour, nextMinute] = nextTime.split(':').map(Number);
        const nextDue = new Date();
        nextDue.setHours(nextHour, nextMinute, 0, 0);
        if (nextDue <= now) {
          nextDue.setDate(nextDue.getDate() + 1);
        }
        
        return {
          ...med,
          lastTaken: now.toISOString(),
          nextDue: nextDue.toISOString()
        };
      }
      return med;
    }));
    
    toast({
      title: "Medication Logged",
      description: "Medication intake has been recorded."
    });
  };

  const getStatusColor = (medication: Medication) => {
    const now = new Date();
    const nextDue = new Date(medication.nextDue);
    const overdue = now > nextDue;
    const dueSoon = (nextDue.getTime() - now.getTime()) < 30 * 60 * 1000; // 30 minutes
    
    if (overdue) return 'bg-red-100 text-red-800';
    if (dueSoon) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (medication: Medication) => {
    const now = new Date();
    const nextDue = new Date(medication.nextDue);
    const overdue = now > nextDue;
    const dueSoon = (nextDue.getTime() - now.getTime()) < 30 * 60 * 1000;
    
    if (overdue) return 'Overdue';
    if (dueSoon) return 'Due Soon';
    return 'On Schedule';
  };

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast({
        title: "Error",
        description: "Please fill in medication name and dosage.",
        variant: "destructive"
      });
      return;
    }

    const medication: Medication = {
      id: Date.now().toString(),
      ...newMedication,
      timing: ['08:00', '20:00'], // Default timing
      lastTaken: '',
      nextDue: new Date().toISOString(),
      adherence: 100
    };

    setMedications(prev => [...prev, medication]);
    setNewMedication({ name: '', dosage: '', frequency: '', exchangeRelated: false });
    setShowAddForm(false);
    
    toast({
      title: "Medication Added",
      description: `${medication.name} has been added to your tracker.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medication Tracker</h2>
          <p className="text-gray-600">Track medications and their relationship to exchange schedules</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Current Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map((medication) => (
          <Card key={medication.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg">{medication.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(medication)}>
                  {getStatusText(medication)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Dosage: <span className="font-medium">{medication.dosage}</span></p>
                  <p className="text-sm text-gray-600">Frequency: <span className="font-medium">{medication.frequency}</span></p>
                  {medication.exchangeRelated && (
                    <Badge variant="outline" className="mt-1">Exchange Related</Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Next: {new Date(medication.nextDue).toLocaleTimeString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-600">Adherence: </span>
                    <span className={`font-medium ${medication.adherence >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                      {medication.adherence}%
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleTakeMedication(medication.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Take Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Medication Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Medication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medName">Medication Name *</Label>
                <Input
                  id="medName"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Calcium Carbonate"
                />
              </div>
              
              <div>
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="e.g., 500mg"
                />
              </div>
              
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  placeholder="e.g., With meals"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="exchangeRelated"
                  checked={newMedication.exchangeRelated}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, exchangeRelated: e.target.checked }))}
                />
                <Label htmlFor="exchangeRelated">Related to exchange schedule</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={addMedication}>
                Add Medication
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Medication Reminders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {medications.filter(med => {
              const now = new Date();
              const nextDue = new Date(med.nextDue);
              return now > nextDue || (nextDue.getTime() - now.getTime()) < 60 * 60 * 1000;
            }).map(med => (
              <div key={med.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div>
                  <p className="font-medium">{med.name} - {med.dosage}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(med.nextDue) < new Date() ? 'Overdue' : 'Due soon'}
                  </p>
                </div>
                <Button size="sm" onClick={() => handleTakeMedication(med.id)}>
                  Mark Taken
                </Button>
              </div>
            ))}
            {medications.filter(med => {
              const now = new Date();
              const nextDue = new Date(med.nextDue);
              return now <= nextDue && (nextDue.getTime() - now.getTime()) >= 60 * 60 * 1000;
            }).length === medications.length && (
              <p className="text-center text-gray-500 py-4">No pending medication reminders</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationTracker;
