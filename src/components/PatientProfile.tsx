import React, { useState } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, Mail, Calendar, FileText, UserPlus, Save } from 'lucide-react';
import { PatientProfile as PatientProfileType } from '@/types/patient';

const PatientProfile: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { patientProfile, updatePatientProfile } = usePatient();
  
  const [formData, setFormData] = useState<Partial<PatientProfileType>>(
    patientProfile || {
      name: '',
      dateOfBirth: '',
      diagnosis: '',
      contactPhone: '',
      contactEmail: '',
      language: 'en'
    }
  );

  const handleInputChange = (field: keyof PatientProfileType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      } as any
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'dateOfBirth', 'diagnosis', 'contactPhone'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof PatientProfileType]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    // Email validation if provided
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const profileData: PatientProfileType = {
      id: patientProfile?.id || Date.now().toString(),
      name: formData.name || '',
      dateOfBirth: formData.dateOfBirth || '',
      diagnosis: formData.diagnosis || '',
      contactPhone: formData.contactPhone || '',
      contactEmail: formData.contactEmail || '',
      language: formData.language || 'en',
      emergencyContact: formData.emergencyContact,
      nephrologist: formData.nephrologist,
      treatmentStartDate: formData.treatmentStartDate,
      insuranceDetails: formData.insuranceDetails,
      profilePhoto: formData.profilePhoto
    };
    
    updatePatientProfile(profileData);
    toast({
      title: "Profile Saved",
      description: "Your patient profile has been saved successfully.",
    });
    console.log('Patient profile saved:', profileData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Profile</h2>
          <p className="text-gray-600">Manage your personal and medical information</p>
        </div>
        <Button onClick={handleSave} className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Profile</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription>Basic personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone *</Label>
              <Input
                id="phone"
                value={formData.contactPhone || ''}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="Your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="Your email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleInputChange('language', value as 'en' | 'ne')}
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
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Medical Information</span>
            </CardTitle>
            <CardDescription>Treatment details and medical history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Primary Diagnosis *</Label>
              <Input
                id="diagnosis"
                value={formData.diagnosis || ''}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                placeholder="e.g., End Stage Renal Disease"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nephrologist">Nephrologist</Label>
              <Input
                id="nephrologist"
                value={formData.nephrologist || ''}
                onChange={(e) => handleInputChange('nephrologist', e.target.value)}
                placeholder="Dr. Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentStart">Treatment Start Date</Label>
              <Input
                id="treatmentStart"
                type="date"
                value={formData.treatmentStartDate || ''}
                onChange={(e) => handleInputChange('treatmentStartDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance">Insurance Details</Label>
              <Textarea
                id="insurance"
                value={formData.insuranceDetails || ''}
                onChange={(e) => handleInputChange('insuranceDetails', e.target.value)}
                placeholder="Insurance provider and policy information"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Emergency Contact</span>
          </CardTitle>
          <CardDescription>Person to contact in case of emergency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Name</Label>
              <Input
                id="emergencyName"
                value={formData.emergencyContact?.name || ''}
                onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                placeholder="Emergency contact name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyRelation">Relationship</Label>
              <Input
                id="emergencyRelation"
                value={formData.emergencyContact?.relationship || ''}
                onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Phone Number</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyContact?.phone || ''}
                onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                placeholder="Emergency contact phone"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfile;
