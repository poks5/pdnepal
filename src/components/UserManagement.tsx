import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck, UserX, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DBUser {
  user_id: string;
  full_name: string;
  phone: string | null;
  hospital: string | null;
  language: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Fetch all profiles
        const { data: profiles, error: profileErr } = await supabase
          .from('profiles')
          .select('user_id, full_name, phone, hospital, language');
        if (profileErr) throw profileErr;

        // Fetch all roles
        const { data: roles, error: roleErr } = await supabase
          .from('user_roles')
          .select('user_id, role');
        if (roleErr) throw roleErr;

        const roleMap = new Map<string, string>();
        (roles || []).forEach(r => roleMap.set(r.user_id, r.role));

        const mapped: DBUser[] = (profiles || []).map(p => ({
          user_id: p.user_id,
          full_name: p.full_name,
          phone: p.phone,
          hospital: p.hospital,
          language: p.language,
          role: roleMap.get(p.user_id) || 'patient',
        }));

        setUsers(mapped);
      } catch (err) {
        console.error('Failed to load users:', err);
        toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-primary/10 text-primary';
      case 'doctor': return 'bg-emerald-500/10 text-emerald-600';
      case 'caregiver': return 'bg-purple-500/10 text-purple-600';
      case 'admin': return 'bg-destructive/10 text-destructive';
      case 'coordinator': return 'bg-orange-500/10 text-orange-600';
      default: return 'bg-muted text-muted-foreground';
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
      <div>
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
        <p className="text-muted-foreground">View registered users and their roles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Users className="w-5 h-5 text-primary" /><div><p className="text-sm text-muted-foreground">Total Users</p><p className="text-xl font-bold text-foreground">{users.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><UserCheck className="w-5 h-5 text-emerald-600" /><div><p className="text-sm text-muted-foreground">Doctors</p><p className="text-xl font-bold text-foreground">{users.filter(u => u.role === 'doctor').length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Users className="w-5 h-5 text-primary" /><div><p className="text-sm text-muted-foreground">Patients</p><p className="text-xl font-bold text-foreground">{users.filter(u => u.role === 'patient').length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><UserX className="w-5 h-5 text-purple-600" /><div><p className="text-sm text-muted-foreground">Caregivers</p><p className="text-xl font-bold text-foreground">{users.filter(u => u.role === 'caregiver').length}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="caregiver">Caregiver</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Language</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell><p className="font-medium text-foreground">{user.full_name}</p></TableCell>
                  <TableCell><Badge className={getRoleColor(user.role)}>{user.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{user.phone || 'N/A'}</TableCell>
                  <TableCell className="text-muted-foreground">{user.hospital || 'N/A'}</TableCell>
                  <TableCell><Badge variant="outline">{user.language === 'en' ? 'English' : 'नेपाली'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
