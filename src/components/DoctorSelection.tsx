import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Stethoscope, MapPin, Award, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DoctorProfile {
  user_id: string;
  full_name: string;
  hospital: string | null;
  specialization: string[] | null;
}

interface DoctorSelectionProps {
  onDoctorSelect: (doctor: any) => void;
  onCancel?: () => void;
  selectedDoctorId?: string;
}

const DoctorSelection: React.FC<DoctorSelectionProps> = ({ onDoctorSelect, onCancel, selectedDoctorId }) => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const { data: doctorRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'doctor');

        if (!doctorRoles?.length) { setDoctors([]); setLoading(false); return; }

        const doctorIds = doctorRoles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, hospital, specialization')
          .in('user_id', doctorIds);

        setDoctors(profiles || []);
        if (selectedDoctorId) {
          setSelectedDoctor((profiles || []).find(d => d.user_id === selectedDoctorId) || null);
        }
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [selectedDoctorId]);

  const filtered = doctors.filter(d => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return d.full_name.toLowerCase().includes(term) ||
      (d.hospital?.toLowerCase().includes(term)) ||
      (d.specialization?.some(s => s.toLowerCase().includes(term)));
  });

  const handleConfirmSelection = () => {
    if (selectedDoctor) {
      onDoctorSelect({
        id: selectedDoctor.user_id,
        name: selectedDoctor.full_name,
        hospital: selectedDoctor.hospital || '',
        specialization: selectedDoctor.specialization || [],
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5" /><span>Choose Your Nephrologist</span>
          </CardTitle>
          <CardDescription>Select a doctor to manage your treatment.</CardDescription>
        </CardHeader>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or hospital..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(doctor => (
          <Card
            key={doctor.user_id}
            className={`cursor-pointer transition-all hover:shadow-md ${selectedDoctor?.user_id === doctor.user_id ? 'ring-2 ring-primary border-primary' : ''}`}
            onClick={() => setSelectedDoctor(doctor)}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground">{doctor.full_name}</h3>
              {doctor.hospital && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{doctor.hospital}</p>}
              {doctor.specialization && doctor.specialization.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doctor.specialization.map(spec => (
                    <Badge key={spec} variant="outline" className="text-xs"><Award className="w-2.5 h-2.5 mr-1" />{spec}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No doctors found. They need to register first.</p>
      )}

      <div className="flex justify-between space-x-4">
        {onCancel && <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>}
        <Button onClick={handleConfirmSelection} disabled={!selectedDoctor} className="flex-1">
          {selectedDoctor ? `Confirm: ${selectedDoctor.full_name}` : 'Select a Doctor'}
        </Button>
      </div>
    </div>
  );
};

export default DoctorSelection;
