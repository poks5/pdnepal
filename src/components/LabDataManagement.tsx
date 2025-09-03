
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FileText, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePersistence } from '@/hooks/usePersistence';
import LabDataEntry from './LabDataEntry';
import LabHistory from './LabHistory';
import { LabTest } from '@/types/labData';

const LabDataManagement: React.FC = () => {
  const { toast } = useToast();
  const { saveData, loadData } = usePersistence();
  
  const [labData, setLabData] = useState<LabTest[]>([
    // Mock data for demonstration
    {
      id: 'lab_1',
      patientId: 'patient_1',
      testDate: '2024-06-10',
      category: 'blood_chemistry',
      rbs: 120,
      fbs: 95,
      pp: 140,
      hba1c: 6.2,
      urea: 42,
      creatinine: 1.1,
      sodium: 138,
      potassium: 4.2,
      calcium: 9.5,
      phosphorus: 3.8,
      albumin: 4.1,
      ipth: 45,
      tc: 7500,
      neutrophil: 60,
      lymphocyte: 30,
      hemoglobin: 12.5,
      platelets: 2.8,
      notes: 'All parameters within normal range. Continue current treatment.',
      reportedBy: 'lab',
      createdAt: '2024-06-10T10:00:00Z',
      updatedAt: '2024-06-10T10:00:00Z'
    }
  ]);
  
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [editingLab, setEditingLab] = useState<LabTest | undefined>(undefined);

  // Load persisted lab data on mount
  useEffect(() => {
    const persistedData = loadData();
    
    if (persistedData.labData && persistedData.labData.length > 0) {
      setLabData(persistedData.labData);
      console.log('Lab data loaded from persistence');
    }
  }, [loadData]);

  // Auto-save lab data whenever it changes
  useEffect(() => {
    if (labData.length > 0) {
      saveData('labData', labData);
    }
  }, [labData, saveData]);

  const handleSaveLabData = (newLabData: Partial<LabTest>) => {
    if (editingLab) {
      // Update existing lab data
      setLabData(prev => 
        prev.map(lab => 
          lab.id === editingLab.id 
            ? { ...lab, ...newLabData } as LabTest
            : lab
        )
      );
      toast({
        title: "Success",
        description: "Lab data updated successfully"
      });
    } else {
      // Add new lab data
      const newLab: LabTest = {
        id: `lab_${Date.now()}`,
        patientId: 'patient_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newLabData
      } as LabTest;
      
      setLabData(prev => [newLab, ...prev]);
      toast({
        title: "Success",
        description: "New lab data added successfully"
      });
    }
    
    setShowEntryDialog(false);
    setEditingLab(undefined);
  };

  const handleEditLab = (lab: LabTest) => {
    setEditingLab(lab);
    setShowEntryDialog(true);
  };

  const handleAddNew = () => {
    setEditingLab(undefined);
    setShowEntryDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lab Data Management</h1>
          <p className="text-gray-600">Track and manage your monthly lab results</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lab Data
        </Button>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Lab History</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Trends</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <LabHistory 
            labData={labData}
            onEdit={handleEditLab}
          />
        </TabsContent>

        <TabsContent value="trends">
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Trends Analysis</h3>
            <p className="text-gray-600">
              Trend charts and analysis will be available in the next phase.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLab ? 'Edit Lab Data' : 'Add New Lab Data'}
            </DialogTitle>
          </DialogHeader>
          <LabDataEntry
            onSave={handleSaveLabData}
            existingData={editingLab}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabDataManagement;
