
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, TrendingUp, Download, AlertTriangle, Pill, Camera } from 'lucide-react';
import TrendAnalysis from './TrendAnalysis';
import DataExport from './DataExport';
import LabAlerts from './LabAlerts';
import MedicationTracker from '../medical/MedicationTracker';
import SymptomTracker from '../medical/SymptomTracker';
import PhotoDocumentation from '../medical/PhotoDocumentation';

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trends');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Medical Center</h1>
        <p className="text-gray-600">Comprehensive data analysis, predictive alerts, and medical tracking</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Lab Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center space-x-2">
            <Pill className="w-4 h-4" />
            <span className="hidden sm:inline">Medications</span>
          </TabsTrigger>
          <TabsTrigger value="symptoms" className="flex items-center space-x-2">
            <BarChart className="w-4 h-4" />
            <span className="hidden sm:inline">Symptoms</span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Photos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <TrendAnalysis />
        </TabsContent>

        <TabsContent value="alerts">
          <LabAlerts />
        </TabsContent>

        <TabsContent value="export">
          <DataExport />
        </TabsContent>

        <TabsContent value="medications">
          <MedicationTracker />
        </TabsContent>

        <TabsContent value="symptoms">
          <SymptomTracker />
        </TabsContent>

        <TabsContent value="photos">
          <PhotoDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
