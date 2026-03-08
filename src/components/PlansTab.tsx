
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, Settings } from 'lucide-react';

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
}

interface PlansTabProps {
  patients: Patient[];
  onManagePlan: (patient: Patient) => void;
}

const PlansTab: React.FC<PlansTabProps> = ({ patients, onManagePlan }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClipboardList className="w-5 h-5" />
          <span>Exchange Plans Management</span>
        </CardTitle>
        <CardDescription>Manage dialysis exchange plans for your patients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="p-4 border rounded-lg flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-600">Standard CAPD Plan - 4 exchanges daily</p>
                <p className="text-xs text-gray-500">Last modified: 3 days ago</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManagePlan(patient)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Manage Plan
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlansTab;
