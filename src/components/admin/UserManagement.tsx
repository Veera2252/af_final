
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserX, 
  UserPlus, 
  Users, 
  Shield, 
  GraduationCap, 
  Crown, 
  Mail, 
  UserCheck,
  Sparkles,
  Star,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Building,
  Briefcase,
  BookOpen,
  DollarSign,
  Calculator,
  UserMinus
} from 'lucide-react';

type Profile = Tables<'profiles'>;

interface StudentFormData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  profession: string;
  course: string;
  total_fees: number;
  paid_amount: number;
  balance: number;
}

interface StaffFormData {
  full_name: string;
  email: string;
  phone: string;
  profession: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [adminCount, setAdminCount] = useState(0);
  const [activeTab, setActiveTab] = useState('student');
  
  const [studentForm, setStudentForm] = useState<StudentFormData>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    profession: '',
    course: '',
    total_fees: 0,
    paid_amount: 0,
    balance: 0
  });

  const [staffForm, setStaffForm] = useState<StaffFormData>({
    full_name: '',
    email: '',
    phone: '',
    profession: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  useEffect(() => {
    // Auto-calculate balance when fees or paid amount changes
    const balance = studentForm.total_fees - studentForm.paid_amount;
    setStudentForm(prev => ({ ...prev, balance }));
  }, [studentForm.total_fees, studentForm.paid_amount]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      
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

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, price')
        .eq('is_published', true)
        .order('title');

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentForm.full_name.trim() || !studentForm.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter the full name and email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentForm.email,
        password: 'tempPassword123!', // Temporary password - user will need to reset
        options: {
          data: {
            full_name: studentForm.full_name,
            role: 'student',
            phone: studentForm.phone,
            address: studentForm.address,
            profession: studentForm.profession
          },
          emailRedirectTo: undefined
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Wait for the database trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update the profile to ensure all data is saved
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'student',
          full_name: studentForm.full_name,
          phone: studentForm.phone,
          address: studentForm.address,
          profession: studentForm.profession
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
      }

      toast({
        title: "Success",
        description: `Student account created successfully! Email: ${studentForm.email}`,
      });

      // Reset form
      setStudentForm({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        profession: '',
        course: '',
        total_fees: 0,
        paid_amount: 0,
        balance: 0
      });
      
      setShowAddUser(false);
      fetchUsers();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staffForm.full_name.trim() || !staffForm.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter the full name and email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create the user in Supabase Auth with STAFF role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: staffForm.email,
        password: 'tempPassword123!', // Temporary password - user will need to reset
        options: {
          data: {
            full_name: staffForm.full_name,
            role: 'staff',
            phone: staffForm.phone,
            profession: staffForm.profession
          },
          emailRedirectTo: undefined
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Wait for the database trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update the profile to ensure correct role is set as staff
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'staff',
          full_name: staffForm.full_name,
          phone: staffForm.phone,
          profession: staffForm.profession
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
      }

      toast({
        title: "Success",
        description: `Staff account created successfully! Email: ${staffForm.email}`,
      });

      // Reset form
      setStaffForm({
        full_name: '',
        email: '',
        phone: '',
        profession: ''
      });
      
      setShowAddUser(false);
      fetchUsers();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, userRole: string) => {
    if (userRole === 'admin' && adminCount <= 1 && currentStatus) {
      toast({
        title: "Error",
        description: "Cannot deactivate the last admin user",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchUsers();
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
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    students: users.filter(u => u.role === 'student').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            User Registration & Management
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Create and manage student and staff accounts with email addresses
          </p>
          
          <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-3 text-lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Register New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-purple-50">
              <DialogHeader className="text-center pb-6">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
                  <Star className="h-8 w-8 text-yellow-500" />
                  User Registration Portal
                  <Star className="h-8 w-8 text-yellow-500" />
                </DialogTitle>
                <p className="text-gray-600 text-lg">Choose registration type and fill in the details</p>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/50 backdrop-blur-sm p-1 rounded-xl shadow-lg">
                  <TabsTrigger 
                    value="student" 
                    className="flex items-center gap-3 px-6 py-4 text-lg font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                  >
                    <GraduationCap className="h-6 w-6" />
                    Student Registration
                  </TabsTrigger>
                  <TabsTrigger 
                    value="staff" 
                    className="flex items-center gap-3 px-6 py-4 text-lg font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                  >
                    <Shield className="h-6 w-6" />
                    Staff Registration
                  </TabsTrigger>
                </TabsList>

                {/* Student Registration */}
                <TabsContent value="student" className="space-y-8">
                  <form onSubmit={handleCreateStudent} className="space-y-8">
                    {/* Personal Information Card */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 rounded-t-lg">
                        <CardTitle className="text-2xl flex items-center gap-3 text-emerald-800">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label htmlFor="student_full_name" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <User className="h-5 w-5 text-emerald-600" />
                              Full Name *
                            </Label>
                            <Input
                              id="student_full_name"
                              value={studentForm.full_name}
                              onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                              placeholder="Enter student's complete name"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student_email" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <Mail className="h-5 w-5 text-emerald-600" />
                              Email Address *
                            </Label>
                            <Input
                              id="student_email"
                              type="email"
                              value={studentForm.email}
                              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                              placeholder="student@example.com"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student_phone" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <Phone className="h-5 w-5 text-emerald-600" />
                              Phone Number
                            </Label>
                            <Input
                              id="student_phone"
                              value={studentForm.phone}
                              onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="student_profession" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-emerald-600" />
                              Profession/Occupation
                            </Label>
                            <Input
                              id="student_profession"
                              value={studentForm.profession}
                              onChange={(e) => setStudentForm({ ...studentForm, profession: e.target.value })}
                              placeholder="e.g., Student, Engineer, Teacher, Business"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
                            />
                          </div>
                          <div className="lg:col-span-2 space-y-2">
                            <Label htmlFor="student_address" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-emerald-600" />
                              Complete Address
                            </Label>
                            <Textarea
                              id="student_address"
                              value={studentForm.address}
                              onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                              placeholder="Enter complete residential address"
                              rows={4}
                              className="text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm resize-none"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-4 pt-6">
                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="flex-1 h-16 text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            Creating Student Account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-6 w-6 mr-3" />
                            Register Student
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddUser(false)}
                        className="px-8 h-16 text-lg border-2 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Staff Registration */}
                <TabsContent value="staff" className="space-y-8">
                  <form onSubmit={handleCreateStaff} className="space-y-8">
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100 rounded-t-lg">
                        <CardTitle className="text-2xl flex items-center gap-3 text-purple-800">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          Staff Member Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label htmlFor="staff_full_name" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <User className="h-5 w-5 text-purple-600" />
                              Full Name *
                            </Label>
                            <Input
                              id="staff_full_name"
                              value={staffForm.full_name}
                              onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                              placeholder="Enter staff member's complete name"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="staff_email" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <Mail className="h-5 w-5 text-purple-600" />
                              Email Address *
                            </Label>
                            <Input
                              id="staff_email"
                              type="email"
                              value={staffForm.email}
                              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                              placeholder="staff@example.com"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="staff_phone" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <Phone className="h-5 w-5 text-purple-600" />
                              Phone Number
                            </Label>
                            <Input
                              id="staff_phone"
                              value={staffForm.phone}
                              onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="staff_profession" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-purple-600" />
                              Profession/Designation
                            </Label>
                            <Input
                              id="staff_profession"
                              value={staffForm.profession}
                              onChange={(e) => setStaffForm({ ...staffForm, profession: e.target.value })}
                              placeholder="e.g., Computer Instructor, Course Coordinator, IT Specialist"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-4 pt-6">
                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="flex-1 h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            Creating Staff Account...
                          </>
                        ) : (
                          <>
                            <Shield className="h-6 w-6 mr-3" />
                            Register Staff Member
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddUser(false)}
                        className="px-8 h-16 text-lg border-2 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-semibold">Total Users</p>
                  <p className="text-3xl font-bold">{userStats.total}</p>
                </div>
                <Users className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 font-semibold">Active</p>
                  <p className="text-3xl font-bold">{userStats.active}</p>
                </div>
                <UserCheck className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 font-semibold">Inactive</p>
                  <p className="text-3xl font-bold">{userStats.inactive}</p>
                </div>
                <UserMinus className="h-10 w-10 text-gray-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 font-semibold">Admins</p>
                  <p className="text-3xl font-bold">{userStats.admins}</p>
                </div>
                <Crown className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 font-semibold">Staff</p>
                  <p className="text-3xl font-bold">{userStats.staff}</p>
                </div>
                <Shield className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 font-semibold">Students</p>
                  <p className="text-3xl font-bold">{userStats.students}</p>
                </div>
                <GraduationCap className="h-10 w-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Users className="h-7 w-7" />
              All Registered Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b-2">
                    <TableHead className="font-bold text-lg py-4">User</TableHead>
                    <TableHead className="font-bold text-lg py-4">Email</TableHead>
                    <TableHead className="font-bold text-lg py-4">Role</TableHead>
                    <TableHead className="font-bold text-lg py-4">Status</TableHead>
                    <TableHead className="font-bold text-lg py-4">Created</TableHead>
                    <TableHead className="font-bold text-lg py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors border-b">
                      <TableCell className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{user.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-lg py-6">{user.email}</TableCell>
                      <TableCell className="py-6">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-2 w-fit px-3 py-1 text-sm">
                          {getRoleIcon(user.role)}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-6">
                        <Badge variant={user.is_active ? "default" : "secondary"} className="px-3 py-1">
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 text-lg py-6">
                        {new Date(user.created_at!).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right py-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, user.is_active!, user.role)}
                          className={`${user.is_active ? 'text-red-600 hover:text-red-800 hover:bg-red-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'} p-3`}
                          disabled={user.role === 'admin' && adminCount <= 1 && user.is_active}
                        >
                          {user.is_active ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
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
    </div>
  );
};
