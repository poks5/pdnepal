import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Stethoscope, MapPin, Award } from 'lucide-react';

interface DoctorProfile {
  user_id: string;
  full_name: string;
  hospital: string | null;
  specialization: string[] | null;
}

interface BrowseDoctorsProps {
  onSelectDoctor: (doctorId: string) => void;
  currentDoctorId?: string;
  submitting?: boolean;
}

const BrowseDoctors: React.FC<BrowseDoctorsProps> = ({ onSelectDoctor, currentDoctorId, submitting }) => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        // Get all doctor user_ids from user_roles
        const { data: doctorRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'doctor');

        if (!doctorRoles?.length) { setDoctors([]); setLoading(false); return; }

        const doctorIds = doctorRoles.map(r => r.user_id);

        // Fetch profiles for doctors
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('user_id, full_name, hospital, specialization')
          .in('user_id', doctorIds);

        if (error) throw error;
        setDoctors(profiles || []);
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filtered = doctors.filter(d => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return d.full_name.toLowerCase().includes(term) ||
      (d.hospital?.toLowerCase().includes(term)) ||
      (d.specialization?.some(s => s.toLowerCase().includes(term)));
  }).filter(d => d.user_id !== currentDoctorId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, hospital, or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No doctors found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.map(doctor => (
            <Card
              key={doctor.user_id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedId === doctor.user_id ? 'ring-2 ring-primary border-primary' : ''}`}
              onClick={() => setSelectedId(doctor.user_id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{doctor.full_name}</h3>
                    {doctor.hospital && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{doctor.hospital}
                      </p>
                    )}
                    {doctor.specialization && doctor.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doctor.specialization.map(spec => (
                          <Badge key={spec} variant="outline" className="text-xs flex items-center gap-1">
                            <Award className="w-2.5 h-2.5" />{spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedId === doctor.user_id && (
                    <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2 border-t">
        <Button
          onClick={() => selectedId && onSelectDoctor(selectedId)}
          disabled={!selectedId || submitting}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {selectedId ? 'Request This Doctor' : 'Select a Doctor'}
        </Button>
      </div>
    </div>
  );
};

export default BrowseDoctors;
