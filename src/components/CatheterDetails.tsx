import React, { useState } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Settings, Hospital, User, Package, Save } from 'lucide-react';
import { CatheterDetails as CatheterDetailsType } from '@/types/patient';

const CatheterDetails: React.FC = () => {
  const { toast } = useToast();
  const { catheterDetails, updateCatheterDetails, patientProfile } = usePatient();
  
  const [formData, setFormData] = useState<Partial<CatheterDetailsType>>(
    catheterDetails || {
      placementDate: '',
      type: 'straight',
      brand: '',
      batchNumber: '',
      placementMethod: 'surgical',
      hospital: '',
      surgeonNephrologist: ''
    }
  );

  const handleInputChange = (field: keyof CatheterDetailsType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['placementDate', 'type', 'brand', 'placementMethod'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof CatheterDetailsType]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!patientProfile?.id) {
      toast({
        title: "Error",
        description: "Please complete your patient profile first before saving catheter details.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    const catheterData: CatheterDetailsType = {
      id: catheterDetails?.id || Date.now().toString(),
      patientId: patientProfile.id,
      placementDate: formData.placementDate || '',
      type: formData.type || 'straight',
      brand: formData.brand || '',
      batchNumber: formData.batchNumber || '',
      placementMethod: formData.placementMethod || 'surgical',
      hospital: formData.hospital || '',
      surgeonNephrologist: formData.surgeonNephrologist || '',
      maintenanceSchedule: formData.maintenanceSchedule || [],
      replacementHistory: formData.replacementHistory || []
    };
    
    updateCatheterDetails(catheterData);
    toast({
      title: "Catheter Details Saved",
      description: "Your catheter information has been saved successfully.",
    });
    console.log('Catheter details saved:', catheterData);
  };

  const catheterTypes = [
    { value: 'straight', label: 'Straight Tenckhoff' },
    { value: 'coiled', label: 'Coiled Tenckhoff' },
    { value: 'swan-neck', label: 'Swan-neck Catheter' },
    { value: 'double-cuff', label: 'Double Cuff' },
    { value: 'single-cuff', label: 'Single Cuff' }
  ];

  const placementMethods = [
    { value: 'surgical', label: 'Surgical Placement' },
    { value: 'percutaneous', label: 'Percutaneous' },
    { value: 'laparoscopic', label: 'Laparoscopic' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catheter Details</h2>
          <p className="text-gray-600">Manage your peritoneal dialysis catheter information</p>
        </div>
        <Button onClick={handleSave} className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Details</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catheter Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Catheter Information</span>
            </CardTitle>
            <CardDescription>Technical details about your catheter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="placementDate">Placement Date *</Label>
              <Input
                id="placementDate"
                type="date"
                value={formData.placementDate || ''}
                onChange={(e) => handleInputChange('placementDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Catheter Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {catheterTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand || ''}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="e.g., Baxter, Fresenius"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber || ''}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                placeholder="Catheter batch/lot number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Placement Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hospital className="w-5 h-5" />
              <span>Placement Information</span>
            </CardTitle>
            <CardDescription>Details about the catheter placement procedure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="placementMethod">Placement Method *</Label>
              <Select
                value={formData.placementMethod}
                onValueChange={(value) => handleInputChange('placementMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {placementMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital/Clinic</Label>
              <Input
                id="hospital"
                value={formData.hospital || ''}
                onChange={(e) => handleInputChange('hospital', e.target.value)}
                placeholder="Where the catheter was placed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surgeon">Surgeon/Nephrologist</Label>
              <Input
                id="surgeon"
                value={formData.surgeonNephrologist || ''}
                onChange={(e) => handleInputChange('surgeonNephrologist', e.target.value)}
                placeholder="Doctor who performed the procedure"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Current Status</span>
          </CardTitle>
          <CardDescription>Current catheter status and maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge variant="default" className="bg-green-100 text-green-800">
              Active
            </Badge>
            {formData.placementDate && (
              <span className="text-sm text-gray-600">
                Placed {new Date(formData.placementDate).toLocaleDateString()}
                {' '}({Math.floor((Date.now() - new Date(formData.placementDate).getTime()) / (1000 * 60 * 60 * 24))} days ago)
              </span>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Maintenance Reminders</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Daily exit site care and inspection</li>
              <li>• Weekly dressing change</li>
              <li>• Monitor for signs of infection</li>
              <li>• Keep exit site dry and clean</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatheterDetails;
