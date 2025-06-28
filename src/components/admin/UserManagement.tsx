import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, UserPlus, Users, Shield, GraduationCap, Crown, Mail, Key, Copy, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

type Profile = Tables<'profiles'>;

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [adminCount, setAdminCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, password: string} | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student' as 'admin' | 'staff' | 'student'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      
      // Count current admins
      const admins = data?.filter(user => user.role === 'admin') || [];
      setAdminCount(admins.length);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Credentials copied to clipboard",
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check admin limit
    if (newUser.role === 'admin' && adminCount >= 2) {
      toast({
        title: "Error",
        description: "Maximum of 2 admin users allowed",
        variant: "destructive",
      });
      return;
    }

    // Generate random password if not provided
    const password = newUser.password || generateRandomPassword();

    setLoading(true);

    try {
      // Create the user in Supabase Auth with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: password,
        options: {
          data: {
            full_name: newUser.full_name,
            role: newUser.role
          },
          emailRedirectTo: undefined // Disable email confirmation
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Wait for the database trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store credentials for display
      setGeneratedCredentials({
        email: newUser.email,
        password: password
      });

      toast({
        title: "Success",
        description: `${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} user created successfully!`,
      });

      setNewUser({ email: '', password: '', full_name: '', role: 'student' });
      setShowAddUser(false);
      
      // Refresh users list
      setTimeout(() => {
        fetchUsers();
      }, 1000);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userRole: string) => {
    if (userRole === 'admin' && adminCount <= 1) {
      toast({
        title: "Error",
        description: "Cannot delete the last admin user",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      // For now, we'll just show a message that this requires admin privileges
      // In a production environment, this would need to be handled by a server-side function
      toast({
        title: "Info",
        description: "User deletion requires server-side implementation for security",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'staff':
        return <Shield className="h-4 w-4" />;
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'staff':
        return 'default';
      case 'student':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    students: users.filter(u => u.role === 'student').length,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create New User
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label>User Role</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Student
                      </div>
                    </SelectItem>
                    <SelectItem value="staff">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Staff
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" disabled={adminCount >= 2}>
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Admin {adminCount >= 2 && '(Limit reached)'}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {newUser.role === 'admin' && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Admin users have full system access
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password (Optional)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Leave empty to auto-generate"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  If left empty, a secure password will be generated automatically
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Credential Management</p>
                    <p className="text-blue-700">Login credentials will be displayed after user creation. Admin users can access all dashboards using these credentials.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Generated Credentials Display */}
      {generatedCredentials && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Key className="h-5 w-5" />
              User Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">Login Credentials</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-green-700">Email:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={generatedCredentials.email} readOnly className="bg-gray-50" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedCredentials.email)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-700">Password:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={generatedCredentials.password} readOnly className="bg-gray-50 font-mono" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedCredentials.password)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Please share these credentials securely with the user. 
                  Admin users can access all dashboards (admin, staff, and student) using these credentials.
                  The user can change their password after first login.
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(`Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Both
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setGeneratedCredentials(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{userStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Administrators</p>
                <p className="text-2xl font-bold text-red-900">{userStats.admins}</p>
              </div>
              <Crown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Staff Members</p>
                <p className="text-2xl font-bold text-purple-900">{userStats.staff}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Students</p>
                <p className="text-2xl font-bold text-green-900">{userStats.students}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="shadow-xl border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(user.role)}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(user.created_at!).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.role)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        disabled={user.role === 'admin' && adminCount <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};