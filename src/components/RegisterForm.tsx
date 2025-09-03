import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Mail, Lock, Phone, Building2, Stethoscope } from 'lucide-react';
import { UserRole, RegistrationData } from '@/types/user';
import { Doctor } from '@/types/doctor';
import DoctorSelection from './DoctorSelection';

interface RegisterFormProps {
  onRegister: (data: RegistrationData) => Promise<void>;
  onBack: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onBack }) => {
  const { language, t } = useLanguage();
  const [step, setStep] = useState<'role' | 'details' | 'doctor-selection'>('role');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState<Partial<RegistrationData>>({
    language: language,
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
    setStep('details');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRole === 'patient' && !formData.referralCode && !formData.selectedDoctorId) {
      setStep('doctor-selection');
      return;
    }

    setLoading(true);
    try {
      await onRegister(formData as RegistrationData);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setFormData(prev => ({ ...prev, selectedDoctorId: doctor.id }));
    handleFormSubmit(new Event('submit') as any);
  };

  const renderRoleSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'en' ? 'Join as' : 'यसरी सामेल हुनुहोस्'}
        </h2>
        <p className="text-gray-600">
          {language === 'en' ? 'Select your role to get started' : 'सुरु गर्न आफ्नो भूमिका छान्नुहोस्'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleRoleSelect('patient')}>
          <CardContent className="p-6 text-center">
            <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">
              {language === 'en' ? 'Patient' : 'बिरामी'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'en' ? 'Manage your dialysis care' : 'आफ्नो डायलाइसिस हेरचाह व्यवस्थापन गर्नुहोस्'}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleRoleSelect('doctor')}>
          <CardContent className="p-6 text-center">
            <Stethoscope className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">
              {language === 'en' ? 'Doctor' : 'डाक्टर'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'en' ? 'Care for your patients' : 'आफ्ना बिरामीहरूको हेरचाह गर्नुहोस्'}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleRoleSelect('caregiver')}>
          <CardContent className="p-6 text-center">
            <UserPlus className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">
              {language === 'en' ? 'Caregiver' : 'हेरचाहकर्ता'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'en' ? 'Support a patient' : 'बिरामीलाई सहयोग गर्नुहोस्'}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleRoleSelect('coordinator')}>
          <CardContent className="p-6 text-center">
            <Building2 className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">
              {language === 'en' ? 'Coordinator' : 'संयोजक'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'en' ? 'Hospital staff member' : 'अस्पताल कर्मचारी सदस्य'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" onClick={onBack} className="w-full">
        {language === 'en' ? 'Back to Login' : 'लगइनमा फर्कनुहोस्'}
      </Button>
    </div>
  );

  const renderDetailsForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'en' ? `Register as ${selectedRole}` : `${selectedRole} को रूपमा दर्ता गर्नुहोस्`}
        </h2>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center space-x-2">
          <UserPlus className="w-4 h-4" />
          <span>{language === 'en' ? 'Full Name' : 'पूरा नाम'}</span>
        </Label>
        <Input
          id="name"
          required
          value={formData.name || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={language === 'en' ? 'Enter your full name' : 'आफ्नो पूरा नाम प्रविष्ट गर्नुहोस्'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center space-x-2">
          <Mail className="w-4 h-4" />
          <span>{t('email')}</span>
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder={language === 'en' ? 'Enter your email' : 'आफ्नो इमेल प्रविष्ट गर्नुहोस्'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center space-x-2">
          <Phone className="w-4 h-4" />
          <span>{language === 'en' ? 'Phone Number' : 'फोन नम्बर'}</span>
        </Label>
        <Input
          id="phone"
          value={formData.phone || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder={language === 'en' ? '+977-9xxxxxxxxx' : '+977-9xxxxxxxxx'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center space-x-2">
          <Lock className="w-4 h-4" />
          <span>{t('password')}</span>
        </Label>
        <Input
          id="password"
          type="password"
          required
          value={formData.password || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          placeholder={language === 'en' ? 'Create a password' : 'पासवर्ड बनाउनुहोस्'}
        />
      </div>

      {/* Role-specific fields */}
      {selectedRole === 'doctor' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="hospital">
              {language === 'en' ? 'Hospital/Clinic' : 'अस्पताल/क्लिनिक'}
            </Label>
            <Input
              id="hospital"
              value={formData.hospital || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
              placeholder={language === 'en' ? 'Your workplace' : 'तपाईंको कार्यस्थल'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialization">
              {language === 'en' ? 'Specialization' : 'विशेषज्ञता'}
            </Label>
            <Textarea
              id="specialization"
              value={formData.specialization?.join(', ') || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                specialization: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              }))}
              placeholder={language === 'en' ? 'Nephrology, Peritoneal Dialysis...' : 'नेफ्रोलोजी, पेरिटोनियल डायलाइसिस...'}
            />
          </div>
        </>
      )}

      {selectedRole === 'patient' && (
        <div className="space-y-2">
          <Label htmlFor="referralCode">
            {language === 'en' ? 'Doctor Referral Code (Optional)' : 'डाक्टर रेफरल कोड (वैकल्पिक)'}
          </Label>
          <Input
            id="referralCode"
            value={formData.referralCode || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, referralCode: e.target.value }))}
            placeholder={language === 'en' ? 'Enter referral code' : 'रेफरल कोड प्रविष्ट गर्नुहोस्'}
          />
          <p className="text-sm text-gray-600">
            {language === 'en' 
              ? 'If you don\'t have a referral code, you can choose a doctor from our list.' 
              : 'यदि तपाईंसँग रेफरल कोड छैन भने, तपाईं हाम्रो सूचीबाट डाक्टर छान्न सक्नुहुन्छ।'}
          </p>
        </div>
      )}

      {(selectedRole === 'coordinator' || selectedRole === 'caregiver') && (
        <div className="space-y-2">
          <Label htmlFor="hospital">
            {language === 'en' ? 'Hospital/Organization' : 'अस्पताल/संस्था'}
          </Label>
          <Input
            id="hospital"
            value={formData.hospital || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
            placeholder={language === 'en' ? 'Your affiliated organization' : 'तपाईंको सम्बद्ध संस्था'}
          />
        </div>
      )}

      <div className="flex space-x-3">
        <Button type="button" variant="outline" onClick={() => setStep('role')} className="flex-1">
          {language === 'en' ? 'Back' : 'पछाडि'}
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{language === 'en' ? 'Registering...' : 'दर्ता गर्दै...'}</span>
            </div>
          ) : (
            language === 'en' ? 'Continue' : 'जारी राख्नुहोस्'
          )}
        </Button>
      </div>
    </form>
  );

  if (step === 'doctor-selection') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Choose Your Doctor' : 'आफ्नो डाक्टर छान्नुहोस्'}
          </h2>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Select a nephrologist to manage your dialysis care'
              : 'आफ्नो डायलाइसिस हेरचाह व्यवस्थापन गर्न नेफ्रोलोजिस्ट छान्नुहोस्'}
          </p>
        </div>
        <DoctorSelection 
          onDoctorSelect={handleDoctorSelect}
          selectedDoctorId={formData.selectedDoctorId}
        />
        <Button variant="outline" onClick={() => setStep('details')} className="w-full">
          {language === 'en' ? 'Back to Registration' : 'दर्तामा फर्कनुहोस्'}
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">PD</span>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Dialyze Buddy</CardTitle>
        <CardDescription className="text-gray-600">
          {language === 'en' 
            ? 'Peritoneal Dialysis Companion' 
            : 'पेरिटोनियल डायलाइसिस साथी'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {step === 'role' ? renderRoleSelection() : renderDetailsForm()}
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
