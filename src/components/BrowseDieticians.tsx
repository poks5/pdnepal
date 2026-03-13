import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Apple, MapPin } from 'lucide-react';

interface DieticianProfile {
  user_id: string;
  full_name: string;
  hospital: string | null;
  specialization: string[] | null;
}

interface BrowseDieticiansProps {
  onSelectDietician: (dieticianId: string) => void;
  currentDieticianId?: string;
  submitting?: boolean;
}

const BrowseDieticians: React.FC<BrowseDieticiansProps> = ({ onSelectDietician, currentDieticianId, submitting }) => {
  const [dieticians, setDieticians] = useState<DieticianProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDieticians = async () => {
      setLoading(true);
      try {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'dietician');

        if (!roles?.length) { setDieticians([]); setLoading(false); return; }

        const ids = roles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, hospital, specialization')
          .in('user_id', ids);

        setDieticians(profiles || []);
      } catch {
        setDieticians([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDieticians();
  }, []);

  const filtered = dieticians.filter(d => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return d.full_name.toLowerCase().includes(term) || (d.hospital?.toLowerCase().includes(term));
  }).filter(d => d.user_id !== currentDieticianId);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or hospital..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No dieticians found</p>
          <p className="text-xs text-muted-foreground">Dieticians need to register first</p>
        </div>
      ) : (
        <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.map(d => (
            <Card
              key={d.user_id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedId === d.user_id ? 'ring-2 ring-primary border-primary' : ''}`}
              onClick={() => setSelectedId(d.user_id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="text-lg">🥗</span> {d.full_name}
                    </h3>
                    {d.hospital && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{d.hospital}
                      </p>
                    )}
                  </div>
                  {selectedId === d.user_id && <Badge className="bg-primary text-primary-foreground">Selected</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2 border-t">
        <Button onClick={() => selectedId && onSelectDietician(selectedId)} disabled={!selectedId || submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {selectedId ? 'Request This Dietician' : 'Select a Dietician'}
        </Button>
      </div>
    </div>
  );
};

export default BrowseDieticians;
