import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, FileText, UserPlus, Save, Loader2, Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { adToBS, bsToAD, formatBSDate, parseBSDate, calculateAge, ageToADDate } from '@/utils/nepaliDateConverter';

interface ProfileFormData {
  full_name: string;
  phone: string;
  date_of_birth: string;
  language: string;
  hospital: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  nagrita_number: string;
  nagrita_district: string;
}

const NEPAL_DISTRICTS = [
  'Achham', 'Arghakhanchi', 'Baglung', 'Baitadi', 'Bajhang', 'Bajura', 'Banke', 'Bara',
  'Bardiya', 'Bhaktapur', 'Bhojpur', 'Chitwan', 'Dadeldhura', 'Dailekh', 'Dang', 'Darchula',
  'Dhading', 'Dhankuta', 'Dhanusa', 'Dolakha', 'Dolpa', 'Doti', 'Eastern Rukum', 'Gorkha',
  'Gulmi', 'Humla', 'Ilam', 'Jajarkot', 'Jhapa', 'Jumla', 'Kailali', 'Kalikot', 'Kanchanpur',
  'Kapilvastu', 'Kaski', 'Kathmandu', 'Kavrepalanchok', 'Khotang', 'Lalitpur', 'Lamjung',
  'Mahottari', 'Makwanpur', 'Manang', 'Morang', 'Mugu', 'Mustang', 'Myagdi', 'Nawalparasi East',
  'Nawalparasi West', 'Nuwakot', 'Okhaldhunga', 'Palpa', 'Panchthar', 'Parbat', 'Parsa',
  'Pyuthan', 'Ramechhap', 'Rasuwa', 'Rautahat', 'Rolpa', 'Rupandehi', 'Salyan', 'Sankhuwasabha',
  'Saptari', 'Sarlahi', 'Sindhuli', 'Sindhupalchok', 'Siraha', 'Solukhumbu', 'Sunsari',
  'Surkhet', 'Syangja', 'Tanahu', 'Taplejung', 'Terhathum', 'Udayapur', 'Western Rukum',
];

const PatientProfile: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ageInput, setAgeInput] = useState('');
  const [bsDateInput, setBsDateInput] = useState('');

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    date_of_birth: '',
    language: 'en',
    hospital: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    nagrita_number: '',
    nagrita_district: '',
  });

  // Derived BS date and age from AD date
  const derivedValues = useMemo(() => {
    if (!formData.date_of_birth) return { bsDate: '', age: '' };
    const adDate = new Date(formData.date_of_birth);
    if (isNaN(adDate.getTime())) return { bsDate: '', age: '' };
    const bs = adToBS(adDate);
    const age = calculateAge(adDate);
    return {
      bsDate: bs ? formatBSDate(bs) : '',
      age: age >= 0 ? String(age) : '',
    };
  }, [formData.date_of_birth]);

  // Sync derived values to display inputs
  useEffect(() => {
    if (derivedValues.bsDate) setBsDateInput(derivedValues.bsDate);
    if (derivedValues.age) setAgeInput(derivedValues.age);
  }, [derivedValues]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            date_of_birth: data.date_of_birth || '',
            language: data.language || 'en',
            hospital: data.hospital || '',
            address: data.address || '',
            emergency_contact_name: data.emergency_contact_name || '',
            emergency_contact_phone: data.emergency_contact_phone || '',
            nagrita_number: (data as any).nagrita_number || '',
            nagrita_district: (data as any).nagrita_district || '',
          });
        }
      } catch (err: any) {
        toast({ title: 'Error loading profile', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // When user types age → compute AD and BS dates
  const handleAgeChange = (value: string) => {
    setAgeInput(value);
    const age = parseInt(value);
    if (!isNaN(age) && age >= 0 && age <= 150) {
      const adDate = ageToADDate(age);
      const adStr = adDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date_of_birth: adStr }));
    }
  };

  // When user types BS date → compute AD date and age
  const handleBSDateChange = (value: string) => {
    setBsDateInput(value);
    const bs = parseBSDate(value);
    if (bs) {
      const adDate = bsToAD(bs);
      if (adDate) {
        const adStr = adDate.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, date_of_birth: adStr }));
      }
    }
  };

  // When user picks AD date → BS and age auto-update via derivedValues
  const handleADDateChange = (value: string) => {
    setFormData(prev => ({ ...prev, date_of_birth: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.full_name.trim()) {
      toast({ title: 'Missing Required Fields', description: 'Please enter your full name.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          date_of_birth: formData.date_of_birth || null,
          language: formData.language,
          hospital: formData.hospital || null,
          address: formData.address || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          nagrita_number: formData.nagrita_number || null,
          nagrita_district: formData.nagrita_district || null,
        } as any)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Profile Saved', description: 'Your profile has been updated successfully.' });
    } catch (err: any) {
      toast({ title: 'Error saving profile', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Profile</h2>
          <p className="text-muted-foreground">Manage your personal and medical information</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
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
              <Input id="name" value={formData.full_name} onChange={(e) => handleChange('full_name', e.target.value)} placeholder="Enter your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Your phone number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={formData.language} onValueChange={(v) => handleChange('language', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ne">Nepali</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Age & Date of Birth - AD/BS Auto-conversion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Age & Date of Birth</span>
            </CardTitle>
            <CardDescription>Enter any one field — the others auto-convert</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age (Years)</Label>
              <Input
                id="age"
                type="number"
                min={0}
                max={150}
                value={ageInput}
                onChange={(e) => handleAgeChange(e.target.value)}
                placeholder="Enter age"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob-ad">Date of Birth (AD)</Label>
              <Input
                id="dob-ad"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleADDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob-bs">Date of Birth (BS - बि.सं.)</Label>
              <Input
                id="dob-bs"
                value={bsDateInput}
                onChange={(e) => handleBSDateChange(e.target.value)}
                placeholder="YYYY/MM/DD (e.g. 2045/03/15)"
              />
              <p className="text-xs text-muted-foreground">Format: YYYY/MM/DD (e.g. 2045/03/15)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nagrita (Citizenship) Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Nagrita (Citizenship) Details</span>
            </CardTitle>
            <CardDescription>Nepali citizenship certificate information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nagritaNumber">Nagrita Number (नागरिकता नं.)</Label>
              <Input
                id="nagritaNumber"
                value={formData.nagrita_number}
                onChange={(e) => handleChange('nagrita_number', e.target.value)}
                placeholder="Enter citizenship number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nagritaDistrict">District of Nagrita Taken (जारी जिल्ला)</Label>
              <Select value={formData.nagrita_district} onValueChange={(v) => handleChange('nagrita_district', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {NEPAL_DISTRICTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
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
            <CardDescription>Hospital and address details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital</Label>
              <Input id="hospital" value={formData.hospital} onChange={(e) => handleChange('hospital', e.target.value)} placeholder="Your hospital" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Your address" rows={3} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Name</Label>
              <Input id="emergencyName" value={formData.emergency_contact_name} onChange={(e) => handleChange('emergency_contact_name', e.target.value)} placeholder="Emergency contact name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Phone Number</Label>
              <Input id="emergencyPhone" value={formData.emergency_contact_phone} onChange={(e) => handleChange('emergency_contact_phone', e.target.value)} placeholder="Emergency contact phone" />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* App Version & Update */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span>PDsathi </span>
              <span className="font-mono">v1.0.0</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const registration = await navigator.serviceWorker?.getRegistration();
                  if (registration) {
                    await registration.update();
                    toast({ title: 'Update check complete', description: 'If a new version is available, the app will update automatically.' });
                  } else {
                    toast({ title: 'No service worker', description: 'App is not installed as a PWA.', variant: 'destructive' });
                  }
                } catch {
                  toast({ title: 'Update failed', description: 'Could not check for updates.', variant: 'destructive' });
                }
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Check for Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfile;
