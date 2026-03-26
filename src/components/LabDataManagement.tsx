import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import LabDataEntry from './LabDataEntry';
import LabHistory from './LabHistory';
import { LabTest } from '@/types/labData';

interface LabDataManagementProps {
  patientId?: string;
}

const LabDataManagement: React.FC<LabDataManagementProps> = ({ patientId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const targetPatientId = patientId || user?.id;
  
  const [labData, setLabData] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [editingLab, setEditingLab] = useState<LabTest | undefined>(undefined);

  useEffect(() => {
    if (!targetPatientId) return;
    const fetchLabs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lab_results')
          .select('*')
          .eq('patient_id', targetPatientId)
          .order('test_date', { ascending: false })
          .limit(50);
        if (error) throw error;
        
        const mapped: LabTest[] = (data || []).map((row: any) => ({
          id: row.id,
          patientId: row.patient_id,
          testDate: row.test_date,
          category: (row.test_type as any) || 'blood_chemistry',
          creatinine: row.creatinine ?? undefined,
          potassium: row.potassium ?? undefined,
          sodium: row.sodium ?? undefined,
          calcium: row.calcium ?? undefined,
          phosphorus: row.phosphorus ?? undefined,
          albumin: row.albumin ?? undefined,
          hemoglobin: row.hemoglobin ?? undefined,
          glucose: row.glucose ?? undefined,
          urea: row.bun ?? undefined,
          tc: row.tc ?? undefined,
          neutrophil: row.neutrophil ?? undefined,
          lymphocyte: row.lymphocyte ?? undefined,
          platelets: row.platelets ?? undefined,
          ipth: row.ipth ?? undefined,
          uricAcid: row.uric_acid ?? undefined,
          rbs: row.rbs ?? undefined,
          fbs: row.fbs ?? undefined,
          pp: row.pp ?? undefined,
          hba1c: row.hba1c ?? undefined,
          peritonealFluidReport: row.peritoneal_fluid_report_url ?? undefined,
          petTestReport: row.pet_test_report_url ?? undefined,
          notes: row.notes ?? undefined,
          reportedBy: 'lab',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        setLabData(mapped);
      } catch (err) {
        console.error('Failed to load lab data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, [targetPatientId]);

  const handleSaveLabData = async (newLabData: Partial<LabTest>) => {
    if (!targetPatientId || !user) return;
    
    try {
      if (editingLab) {
        const updatePayload: Record<string, any> = {
            test_date: newLabData.testDate || editingLab.testDate,
            creatinine: newLabData.creatinine ?? null,
            potassium: newLabData.potassium ?? null,
            sodium: newLabData.sodium ?? null,
            calcium: newLabData.calcium ?? null,
            phosphorus: newLabData.phosphorus ?? null,
            albumin: newLabData.albumin ?? null,
            hemoglobin: newLabData.hemoglobin ?? null,
            glucose: (newLabData as any).glucose ?? null,
            bun: newLabData.urea ?? null,
            notes: newLabData.notes ?? null,
          };
        const { error } = await supabase
          .from('lab_results')
          .update(updatePayload)
          .eq('id', editingLab.id);
        if (error) throw error;
        toast({ title: t('success'), description: t('labDataUpdated') });
      } else {
        const { error } = await supabase
          .from('lab_results')
          .insert({
            patient_id: targetPatientId,
            entered_by: user.id,
            test_date: newLabData.testDate || new Date().toISOString().split('T')[0],
            test_type: newLabData.category || 'blood_chemistry',
            creatinine: newLabData.creatinine ?? null,
            potassium: newLabData.potassium ?? null,
            sodium: newLabData.sodium ?? null,
            calcium: newLabData.calcium ?? null,
            phosphorus: newLabData.phosphorus ?? null,
            albumin: newLabData.albumin ?? null,
            hemoglobin: newLabData.hemoglobin ?? null,
            glucose: (newLabData as any).glucose ?? null,
            bun: newLabData.urea ?? null,
            notes: newLabData.notes ?? null,
          });
        if (error) throw error;
        toast({ title: t('success'), description: t('labDataAdded') });
      }

      const { data } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', targetPatientId)
        .order('test_date', { ascending: false })
        .limit(50);
      
      if (data) {
        setLabData(data.map(row => ({
          id: row.id,
          patientId: row.patient_id,
          testDate: row.test_date,
          category: (row.test_type as any) || 'blood_chemistry',
          creatinine: row.creatinine ?? undefined,
          potassium: row.potassium ?? undefined,
          sodium: row.sodium ?? undefined,
          calcium: row.calcium ?? undefined,
          phosphorus: row.phosphorus ?? undefined,
          albumin: row.albumin ?? undefined,
          hemoglobin: row.hemoglobin ?? undefined,
          glucose: row.glucose ?? undefined,
          urea: row.bun ?? undefined,
          notes: row.notes ?? undefined,
          reportedBy: 'lab',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })));
      }
    } catch (err: any) {
      toast({ title: t('error'), description: err.message, variant: "destructive" });
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
          <h1 className="text-2xl font-bold text-foreground">{t('labDataManagement')}</h1>
          <p className="text-muted-foreground">{t('trackManageLabResults')}</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addLabData')}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" /><span>{t('labHistory')}</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" /><span>{t('trends')}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <LabHistory labData={labData} onEdit={handleEditLab} />
          </TabsContent>
          <TabsContent value="trends">
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('trendAnalysisComingSoon')}</p>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLab ? t('editLabData') : t('addNewLabData')}</DialogTitle>
          </DialogHeader>
          <LabDataEntry onSave={handleSaveLabData} existingData={editingLab} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabDataManagement;
