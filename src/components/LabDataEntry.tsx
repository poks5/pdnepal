
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Save, Loader2 } from 'lucide-react';
import { LabTest, labRanges } from '@/types/labData';

interface LabDataEntryProps {
  onSave: (labData: Partial<LabTest>) => void;
  existingData?: LabTest;
}

const LabDataEntry: React.FC<LabDataEntryProps> = ({ onSave, existingData }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<LabTest>>(
    existingData || {
      testDate: new Date().toISOString().split('T')[0],
      reportedBy: 'patient'
    }
  );

  const handleInputChange = (field: keyof LabTest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getParameterStatus = (parameter: string, value: number) => {
    const range = labRanges.find(r => r.parameter === parameter);
    if (!range || !value) return 'normal';
    
    if (value < range.min) return 'low';
    if (value > range.max) return 'high';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const handleSave = async () => {
    if (!formData.testDate) {
      toast({ title: "Error", description: "Please select a test date", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      onSave({
        ...formData,
        id: existingData?.id || `lab_${Date.now()}`,
        patientId: existingData?.patientId || 'current_patient',
        createdAt: existingData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Success", description: "Lab data saved successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const renderParameterInput = (
    parameter: keyof LabTest,
    label: string,
    unit: string
  ) => {
    const value = formData[parameter] as number;
    const status = value ? getParameterStatus(parameter as string, value) : 'normal';
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={parameter as string}>{label}</Label>
          {value && (
            <Badge className={getStatusColor(status)}>
              {status}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            id={parameter as string}
            type="number"
            step="0.1"
            value={value || ''}
            onChange={(e) => handleInputChange(parameter, parseFloat(e.target.value))}
            placeholder="Enter value"
            className="flex-1"
          />
          <span className="text-sm text-gray-500 min-w-[60px]">{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Lab Data Entry</span>
          </CardTitle>
          <CardDescription>
            Enter monthly lab test results and upload reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testDate">Test Date *</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={formData.testDate || ''}
                  onChange={(e) => handleInputChange('testDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reportedBy">Reported By</Label>
                <select
                  id="reportedBy"
                  value={formData.reportedBy || 'patient'}
                  onChange={(e) => handleInputChange('reportedBy', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="lab">Lab</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="blood-chemistry" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blood-chemistry">Blood Chemistry</TabsTrigger>
          <TabsTrigger value="hematology">Hematology</TabsTrigger>
          <TabsTrigger value="hormones">Hormones</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="blood-chemistry">
          <Card>
            <CardHeader>
              <CardTitle>Blood Chemistry Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Blood Sugar</h4>
                  {renderParameterInput('rbs', 'RBS', 'mg/dL')}
                  {renderParameterInput('fbs', 'FBS', 'mg/dL')}
                  {renderParameterInput('pp', 'Post Prandial', 'mg/dL')}
                  {renderParameterInput('hba1c', 'HbA1c', '%')}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Kidney Function</h4>
                  {renderParameterInput('urea', 'Urea', 'mg/dL')}
                  {renderParameterInput('creatinine', 'Creatinine', 'mg/dL')}
                  {renderParameterInput('uricAcid', 'Uric Acid', 'mg/dL')}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Electrolytes & Proteins</h4>
                  {renderParameterInput('sodium', 'Sodium', 'mEq/L')}
                  {renderParameterInput('potassium', 'Potassium', 'mEq/L')}
                  {renderParameterInput('calcium', 'Calcium', 'mg/dL')}
                  {renderParameterInput('phosphorus', 'Phosphorus', 'mg/dL')}
                  {renderParameterInput('albumin', 'S. Albumin', 'g/dL')}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hematology">
          <Card>
            <CardHeader>
              <CardTitle>Hematology Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderParameterInput('tc', 'Total Count (Tc)', 'cells/μL')}
                {renderParameterInput('neutrophil', 'Neutrophil', '%')}
                {renderParameterInput('lymphocyte', 'Lymphocyte', '%')}
                {renderParameterInput('hemoglobin', 'Hemoglobin (Hb)', 'g/dL')}
                {renderParameterInput('platelets', 'Platelets', 'lakhs/μL')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hormones">
          <Card>
            <CardHeader>
              <CardTitle>Hormone Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderParameterInput('ipth', 'iPTH (Intact Parathyroid Hormone)', 'pg/mL')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Uploads</CardTitle>
              <CardDescription>
                Upload peritoneal fluid reports and PET test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="peritonealFluidReport">Peritoneal Fluid Report</Label>
                  <Input
                    id="peritonealFluidReport"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // In a real app, you'd upload the file and get a URL
                        handleInputChange('peritonealFluidReport', `uploaded_${file.name}`);
                      }
                    }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="petTestReport">PET Test Report</Label>
                  <Input
                    id="petTestReport"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // In a real app, you'd upload the file and get a URL
                        handleInputChange('petTestReport', `uploaded_${file.name}`);
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any additional notes about the lab results..."
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Lab Data'}
        </Button>
      </div>
    </div>
  );
};

export default LabDataEntry;
