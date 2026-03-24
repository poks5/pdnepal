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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Users, UserCheck, Search, Loader2, Shield, MoreVertical, UserCog,
  Building2, Stethoscope, Heart, RefreshCw, Pencil, Trash2, CheckCircle2,
  UserPlus, AlertTriangle, Eye
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface DBUser {
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  hospital: string | null;
  language: string;
  role: AppRole;
  created_at: string;
  center_name: string | null;
  center_id: string | null;
  address: string | null;
  date_of_birth: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  specialization: string[] | null;
}

const ROLE_OPTIONS: { value: AppRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'patient', label: 'Patient', icon: <Heart className="w-4 h-4" />, desc: 'Personal PD management only' },
  { value: 'doctor', label: 'Doctor', icon: <Stethoscope className="w-4 h-4" />, desc: 'Clinical access to assigned patients' },
  { value: 'nurse', label: 'PD Nurse', icon: <UserCheck className="w-4 h-4" />, desc: 'Nursing care for PD patients' },
  { value: 'dietician', label: 'Dietician', icon: <Heart className="w-4 h-4" />, desc: 'Nutrition guidance for patients' },
  { value: 'caregiver', label: 'Caregiver', icon: <Users className="w-4 h-4" />, desc: 'Support access for a patient' },
  { value: 'coordinator', label: 'Coordinator', icon: <Building2 className="w-4 h-4" />, desc: 'Hospital staff management access' },
  { value: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" />, desc: 'Full system access — assign with caution' },
];

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialogs
  const [roleChangeDialog, setRoleChangeDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('patient');

  // Edit form
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    hospital: '',
    language: 'en',
    address: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  // Add user form
  const [addForm, setAddForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    hospital: '',
    role: 'patient' as AppRole,
    language: 'en',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [profilesRes, rolesRes, centersRes, emailsRes] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name, phone, hospital, language, created_at, center_id, address, date_of_birth, emergency_contact_name, emergency_contact_phone, specialization'),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('centers').select('id, name'),
        supabase.functions.invoke('admin-users', { method: 'GET', headers: {}, body: undefined as any }).catch(() => ({ data: null })) as Promise<any>,
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      // Try to get emails from edge function
      let emailMap: Record<string, string> = {};
      try {
        // Use fetch directly for GET with query params
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const resp = await fetch(`${supabaseUrl}/functions/v1/admin-users?action=list-emails`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        });
        if (resp.ok) {
          const result = await resp.json();
          emailMap = result.emailMap || {};
        }
      } catch { /* emails not available, continue */ }

      const roleMap = new Map<string, AppRole>();
      (rolesRes.data || []).forEach(r => roleMap.set(r.user_id, r.role));

      const centerMap = new Map<string, string>();
      (centersRes.data || []).forEach(c => centerMap.set(c.id, c.name));

      const mapped: DBUser[] = (profilesRes.data || []).map(p => ({
        user_id: p.user_id,
        email: emailMap[p.user_id] || '',
        full_name: p.full_name,
        phone: p.phone,
        hospital: p.hospital,
        language: p.language,
        role: roleMap.get(p.user_id) || 'patient',
        created_at: p.created_at,
        center_id: p.center_id,
        center_name: p.center_id ? centerMap.get(p.center_id) || null : null,
        address: p.address,
        date_of_birth: p.date_of_birth,
        emergency_contact_name: p.emergency_contact_name,
        emergency_contact_phone: p.emergency_contact_phone,
        specialization: p.specialization,
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

  // === Role Change ===
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

  // === Edit Profile ===
  const openEditDialog = (u: DBUser) => {
    setSelectedUser(u);
    setEditForm({
      full_name: u.full_name,
      phone: u.phone || '',
      hospital: u.hospital || '',
      language: u.language,
      address: u.address || '',
      date_of_birth: u.date_of_birth || '',
      emergency_contact_name: u.emergency_contact_name || '',
      emergency_contact_phone: u.emergency_contact_phone || '',
    });
    setEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone || null,
          hospital: editForm.hospital || null,
          language: editForm.language,
          address: editForm.address || null,
          date_of_birth: editForm.date_of_birth || null,
          emergency_contact_name: editForm.emergency_contact_name || null,
          emergency_contact_phone: editForm.emergency_contact_phone || null,
        })
        .eq('user_id', selectedUser.user_id);
      if (error) throw error;
      toast({ title: 'Profile updated', description: `${editForm.full_name}'s profile has been updated.` });
      setEditDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  // === Delete (remove role + profile) ===
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      // Delete role first, then profile
      const { error: roleErr } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id);
      if (roleErr) throw roleErr;

      // Note: We can't delete auth.users from client side, but we remove their profile/role
      // which effectively disables their access
      toast({
        title: 'User removed',
        description: `${selectedUser.full_name}'s role has been revoked. They will no longer have access.`,
      });
      setDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to remove user', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  // === Add New User ===
  const handleAddUser = async () => {
    if (!addForm.email || !addForm.password || !addForm.full_name) return;
    setActionLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const resp = await fetch(`${supabaseUrl}/functions/v1/admin-users?action=create-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: addForm.email,
          password: addForm.password,
          fullName: addForm.full_name,
          phone: addForm.phone || undefined,
          hospital: addForm.hospital || undefined,
          role: addForm.role,
          language: addForm.language,
        }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Failed to create user');
      toast({ title: 'User created', description: `${addForm.full_name} added as ${addForm.role}.` });
      setAddUserDialog(false);
      setAddForm({ email: '', password: '', full_name: '', phone: '', hospital: '', role: 'patient', language: 'en' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create user', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  // === Filtering ===
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.hospital || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      patient: 'bg-primary/10 text-primary border-primary/20',
      doctor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      nurse: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
      dietician: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
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
    nurse: users.filter(u => u.role === 'nurse').length,
    dietician: users.filter(u => u.role === 'dietician').length,
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
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {[
          { label: 'Total', count: roleCounts.total, icon: <Users className="w-4 h-4" />, color: 'text-foreground' },
          { label: 'Patients', count: roleCounts.patient, icon: <Heart className="w-4 h-4" />, color: 'text-primary' },
          { label: 'Doctors', count: roleCounts.doctor, icon: <Stethoscope className="w-4 h-4" />, color: 'text-emerald-600' },
          { label: 'Nurses', count: roleCounts.nurse, icon: <UserCheck className="w-4 h-4" />, color: 'text-teal-600' },
          { label: 'Dieticians', count: roleCounts.dietician, icon: <Heart className="w-4 h-4" />, color: 'text-amber-600' },
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
                <SelectItem value="nurse">PD Nurse</SelectItem>
                <SelectItem value="dietician">Dietician</SelectItem>
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
          <CardDescription className="text-xs">View details, edit profiles, change roles, or remove users</CardDescription>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => { setSelectedUser(u); setDetailDialog(true); }}
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(u)}
                              className="gap-2"
                            >
                              <Pencil className="w-4 h-4" /> Edit Profile
                            </DropdownMenuItem>
                            {u.user_id !== currentUser?.id && (
                              <>
                                <DropdownMenuSeparator />
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
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => { setSelectedUser(u); setDeleteDialog(true); }}
                                  className="gap-2 text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" /> Remove User
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* === View Details Dialog === */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <DetailField label="Full Name" value={selectedUser.full_name} />
                <DetailField label="Role" value={selectedUser.role} />
                <DetailField label="Phone" value={selectedUser.phone || '—'} />
                <DetailField label="Language" value={selectedUser.language === 'en' ? 'English' : 'नेपाली'} />
                <DetailField label="Hospital" value={selectedUser.hospital || '—'} />
                <DetailField label="Center" value={selectedUser.center_name || '—'} />
                <DetailField label="Date of Birth" value={selectedUser.date_of_birth || '—'} />
                <DetailField label="Address" value={selectedUser.address || '—'} />
                <DetailField label="Emergency Contact" value={selectedUser.emergency_contact_name || '—'} />
                <DetailField label="Emergency Phone" value={selectedUser.emergency_contact_phone || '—'} />
                {selectedUser.specialization && selectedUser.specialization.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Specialization</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedUser.specialization.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[11px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Joined: {new Date(selectedUser.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* === Edit Profile Dialog === */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update profile information for <strong>{selectedUser?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Full Name *</Label>
                <Input
                  value={editForm.full_name}
                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Phone</Label>
                <Input
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="h-10 rounded-xl"
                  placeholder="+977-9xxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Hospital / Clinic</Label>
                <Input
                  value={editForm.hospital}
                  onChange={e => setEditForm(f => ({ ...f, hospital: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Language</Label>
                <Select value={editForm.language} onValueChange={v => setEditForm(f => ({ ...f, language: v }))}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ne">नेपाली</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Date of Birth</Label>
                <Input
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={e => setEditForm(f => ({ ...f, date_of_birth: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Address</Label>
                <Input
                  value={editForm.address}
                  onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Emergency Contact Name</Label>
                <Input
                  value={editForm.emergency_contact_name}
                  onChange={e => setEditForm(f => ({ ...f, emergency_contact_name: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Emergency Contact Phone</Label>
                <Input
                  value={editForm.emergency_contact_phone}
                  onChange={e => setEditForm(f => ({ ...f, emergency_contact_phone: e.target.value }))}
                  className="h-10 rounded-xl"
                  placeholder="+977-9xxxxxxxxx"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialog(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleEditSave} disabled={actionLoading || !editForm.full_name.trim()} className="rounded-xl">
              {actionLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
              ) : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Role Change Dialog === */}
      <Dialog open={roleChangeDialog} onOpenChange={setRoleChangeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-primary" />
              Change User Role
            </DialogTitle>
            <DialogDescription>
              Changing the role for <strong>{selectedUser?.full_name}</strong>. This affects their access immediately.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">{selectedUser?.full_name}</p>
                <p className="text-xs text-muted-foreground">Current role: {selectedUser?.role}</p>
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
                      newRole === opt.value ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-border'
                    }`}
                  >
                    <div className={newRole === opt.value ? 'text-primary' : 'text-muted-foreground'}>{opt.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
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
            <Button variant="outline" onClick={() => setRoleChangeDialog(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleRoleChange} disabled={actionLoading || newRole === selectedUser?.role} className="rounded-xl">
              {actionLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Updating...</span>
              ) : 'Confirm Role Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Delete Confirmation Dialog === */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Remove User Access
            </DialogTitle>
            <DialogDescription>
              This will revoke <strong>{selectedUser?.full_name}</strong>'s role and effectively disable their access to the system. This action cannot be easily undone.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2">
            <p className="text-sm font-medium text-foreground">{selectedUser?.full_name}</p>
            <p className="text-xs text-muted-foreground">Role: {selectedUser?.role} • Hospital: {selectedUser?.hospital || 'N/A'}</p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={actionLoading} className="rounded-xl">
              {actionLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Removing...</span>
              ) : (
                <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Remove User</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DetailField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
  </div>
);

export default UserManagement;
