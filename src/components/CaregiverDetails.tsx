
import React, { useState } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Edit, Trash2, Phone, Mail, Users } from 'lucide-react';
import { CaregiverDetails as CaregiverDetailsType } from '@/types/patient';

const CaregiverDetails: React.FC = () => {
  const { toast } = useToast();
  const { caregivers, addCaregiver, updateCaregiver, removeCaregiver, patientProfile } = usePatient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<CaregiverDetailsType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    language: 'en' as 'en' | 'ne',
    careNotes: '',
    accessPermissions: [] as string[],
    notifyDoctorOnChange: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      primaryPhone: '',
      secondaryPhone: '',
      email: '',
      language: 'en',
      careNotes: '',
      accessPermissions: [],
      notifyDoctorOnChange: false
    });
    setEditingCaregiver(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.relationship || !formData.primaryPhone) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in name, relationship, and primary phone.",
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
        description: "Please complete your patient profile first.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    const caregiverData: CaregiverDetailsType = {
      id: editingCaregiver?.id || Date.now().toString(),
      patientId: patientProfile.id,
      name: formData.name,
      relationship: formData.relationship,
      primaryPhone: formData.primaryPhone,
      secondaryPhone: formData.secondaryPhone || undefined,
      email: formData.email,
      language: formData.language,
      careNotes: formData.careNotes || undefined,
      accessPermissions: formData.accessPermissions,
      notifyDoctorOnChange: formData.notifyDoctorOnChange
    };

    if (editingCaregiver) {
      updateCaregiver(editingCaregiver.id, caregiverData);
      toast({
        title: "Caregiver Updated",
        description: "Caregiver information has been updated successfully.",
      });
    } else {
      addCaregiver(caregiverData);
      toast({
        title: "Caregiver Added",
        description: "New caregiver has been added successfully.",
      });
    }

    resetForm();
    setShowAddDialog(false);
  };

  const handleEdit = (caregiver: CaregiverDetailsType) => {
    setFormData({
      name: caregiver.name,
      relationship: caregiver.relationship,
      primaryPhone: caregiver.primaryPhone,
      secondaryPhone: caregiver.secondaryPhone || '',
      email: caregiver.email,
      language: caregiver.language,
      careNotes: caregiver.careNotes || '',
      accessPermissions: caregiver.accessPermissions,
      notifyDoctorOnChange: caregiver.notifyDoctorOnChange
    });
    setEditingCaregiver(caregiver);
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    removeCaregiver(id);
    toast({
      title: "Caregiver Removed",
      description: "Caregiver has been removed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Caregiver Details</h2>
          <p className="text-gray-600">Manage your caregiver information and contacts</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Add Caregiver</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCaregiver ? 'Edit Caregiver' : 'Add New Caregiver'}</DialogTitle>
              <DialogDescription>
                Enter the caregiver's information and contact details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Caregiver's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryPhone">Primary Phone *</Label>
                  <Input
                    id="primaryPhone"
                    value={formData.primaryPhone}
                    onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                    placeholder="Primary contact number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                  <Input
                    id="secondaryPhone"
                    value={formData.secondaryPhone}
                    onChange={(e) => handleInputChange('secondaryPhone', e.target.value)}
                    placeholder="Alternative contact number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => handleInputChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ne">Nepali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="careNotes">Care Notes</Label>
                <Textarea
                  id="careNotes"
                  value={formData.careNotes}
                  onChange={(e) => handleInputChange('careNotes', e.target.value)}
                  placeholder="Additional notes about care arrangements or availability"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingCaregiver ? 'Update Caregiver' : 'Add Caregiver'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Caregivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {caregivers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Caregivers Added</h3>
              <p className="text-gray-500 text-center mb-4">
                Add caregivers who help with your peritoneal dialysis care.
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Add First Caregiver</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          caregivers.map((caregiver) => (
            <Card key={caregiver.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{caregiver.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(caregiver)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(caregiver.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{caregiver.relationship}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{caregiver.primaryPhone}</span>
                </div>
                {caregiver.secondaryPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{caregiver.secondaryPhone}</span>
                  </div>
                )}
                {caregiver.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{caregiver.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {caregiver.language === 'en' ? 'English' : 'Nepali'}
                  </Badge>
                </div>
                {caregiver.careNotes && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {caregiver.careNotes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CaregiverDetails;
