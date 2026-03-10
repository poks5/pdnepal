import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck, UserX, Search, Loader2, Shield, MoreVertical, UserCog, Ban, CheckCircle2, Building2, Stethoscope, Heart, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface DBUser {
  user_id: string;
  full_name: string;
  phone: string | null;
  hospital: string | null;
  language: string;
  role: AppRole;
  created_at: string;
  center_name: string | null;
  email: string | null;
}

const ROLE_OPTIONS: { value: AppRole; label: string; icon: React.ReactNode }[] = [
  { value: 'patient', label: 'Patient', icon: <Heart className="w-4 h-4" /> },
  { value: 'doctor', label: 'Doctor', icon: <Stethoscope className="w-4 h-4" /> },
  { value: 'caregiver', label: 'Caregiver', icon: <Users className="w-4 h-4" /> },
  { value: 'coordinator', label: 'Coordinator', icon: <Building2 className="w-4 h-4" /> },
  { value: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
];

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [roleChangeDialog, setRoleChangeDialog] = useState(false);
  const [newRole, setNewRole] = useState<AppRole>('patient');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, hospital, language, created_at, center_id');
      if (profileErr) throw profileErr;

      const { data: roles, error: roleErr } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (roleErr) throw roleErr;

      const { data: centers } = await supabase
        .from('centers')
        .select('id, name');

      const roleMap = new Map<string, AppRole>();
      (roles || []).forEach(r => roleMap.set(r.user_id, r.role));

      const centerMap = new Map<string, string>();
      (centers || []).forEach(c => centerMap.set(c.id, c.name));

      const mapped: DBUser[] = (profiles || []).map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        phone: p.phone,
        hospital: p.hospital,
        language: p.language,
        role: roleMap.get(p.user_id) || 'patient',
        created_at: p.created_at,
        center_name: p.center_id ? centerMap.get(p.center_id) || null : null,
        email: null,
      }));

      setUsers(mapped);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', selectedUser.user_id);
      if (error) throw error;

      toast({ title: 'Role updated', description: `${selectedUser.full_name} is now a ${newRole}.` });
      setRoleChangeDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update role', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.hospital || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      patient: 'bg-primary/10 text-primary border-primary/20',
      doctor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      caregiver: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      admin: 'bg-destructive/10 text-destructive border-destructive/20',
      coordinator: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };
    return (
      <Badge variant="outline" className={`text-[11px] font-medium ${styles[role] || 'bg-muted text-muted-foreground'}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const roleCounts = {
    total: users.length,
    patient: users.filter(u => u.role === 'patient').length,
    doctor: users.filter(u => u.role === 'doctor').length,
    caregiver: users.filter(u => u.role === 'caregiver').length,
    coordinator: users.filter(u => u.role === 'coordinator').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">User Management</h2>
          <p className="text-xs text-muted-foreground">Manage users, roles, and access control</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-1.5 rounded-xl">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Total', count: roleCounts.total, icon: <Users className="w-4 h-4" />, color: 'text-foreground' },
          { label: 'Patients', count: roleCounts.patient, icon: <Heart className="w-4 h-4" />, color: 'text-primary' },
          { label: 'Doctors', count: roleCounts.doctor, icon: <Stethoscope className="w-4 h-4" />, color: 'text-emerald-600' },
          { label: 'Caregivers', count: roleCounts.caregiver, icon: <UserCheck className="w-4 h-4" />, color: 'text-purple-600' },
          { label: 'Coordinators', count: roleCounts.coordinator, icon: <Building2 className="w-4 h-4" />, color: 'text-orange-600' },
          { label: 'Admins', count: roleCounts.admin, icon: <Shield className="w-4 h-4" />, color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label} className="border-border/40 rounded-xl">
            <CardContent className="p-2.5 text-center">
              <div className={`${s.color} flex justify-center mb-1`}>{s.icon}</div>
              <p className="text-lg font-bold text-foreground">{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <Card className="border-border/40 rounded-xl">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, hospital, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="caregiver">Caregiver</SelectItem>
                <SelectItem value="coordinator">Coordinator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border/40 rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription className="text-xs">Click actions to manage individual users</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Hospital</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.user_id} className="border-border/20">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.full_name}</p>
                          {u.center_name && (
                            <p className="text-[10px] text-muted-foreground">{u.center_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(u.role)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                        {u.hospital || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                        {u.phone || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.user_id !== currentUser?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setNewRole(u.role);
                                  setRoleChangeDialog(true);
                                }}
                                className="gap-2"
                              >
                                <UserCog className="w-4 h-4" /> Change Role
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={roleChangeDialog} onOpenChange={setRoleChangeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-primary" />
              Change User Role
            </DialogTitle>
            <DialogDescription>
              Changing the role for <strong>{selectedUser?.full_name}</strong>. This affects their access and permissions immediately.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">{selectedUser?.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  Current role: {selectedUser?.role}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">New Role</Label>
              <div className="grid grid-cols-1 gap-2">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setNewRole(opt.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      newRole === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border/40 hover:border-border'
                    }`}
                  >
                    <div className={`${newRole === opt.value ? 'text-primary' : 'text-muted-foreground'}`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {opt.value === 'admin' && 'Full system access — assign with caution'}
                        {opt.value === 'coordinator' && 'Hospital staff management access'}
                        {opt.value === 'doctor' && 'Clinical access to assigned patients'}
                        {opt.value === 'patient' && 'Personal PD management only'}
                        {opt.value === 'caregiver' && 'Support access for a patient'}
                      </p>
                    </div>
                    {newRole === opt.value && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {(newRole === 'admin' || newRole === 'coordinator') && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <Shield className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-xs text-destructive">
                  {newRole === 'admin'
                    ? 'Admin role grants full system access including user management, data, and security settings.'
                    : 'Coordinator role grants access to hospital-level staff management features.'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRoleChangeDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={actionLoading || newRole === selectedUser?.role}
              className="rounded-xl"
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                </span>
              ) : (
                'Confirm Role Change'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
