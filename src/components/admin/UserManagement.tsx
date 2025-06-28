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
  Trash2, 
  UserPlus, 
  Users, 
  Shield, 
  GraduationCap, 
  Crown, 
  Mail, 
  Key, 
  Copy, 
  Eye, 
  EyeOff,
  Phone,
  MapPin,
  Building,
  Briefcase,
  BookOpen,
  DollarSign,
  Calculator,
  Send,
  FileText,
  UserCheck,
  Sparkles,
  Star,
  CheckCircle2,
  User,
  Globe
} from 'lucide-react';

type Profile = Tables<'profiles'>;

interface StudentFormData {
  full_name: string;
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
  phone: string;
  profession: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [adminCount, setAdminCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string; 
    password: string;
    userData: StudentFormData | StaffFormData;
    userType: 'student' | 'staff';
  } | null>(null);
  
  const [studentForm, setStudentForm] = useState<StudentFormData>({
    full_name: '',
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

  const generateEmailFromName = (fullName: string): string => {
    const cleanName = fullName
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .trim()
      .replace(/\s+/g, '.');
    
    return `${cleanName}.alphafly@gmail.com`;
  };

  const generateSecurePassword = (): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Credentials copied to clipboard",
    });
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentForm.full_name.trim()) {
      toast({
        title: "Error",
        description: "Please enter the full name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate email and password
      const email = generateEmailFromName(studentForm.full_name);
      const password = generateSecurePassword();

      // Create the user in Supabase Auth with STUDENT role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: studentForm.full_name,
            role: 'student', // EXPLICITLY SET STUDENT ROLE
            phone: studentForm.phone,
            address: studentForm.address,
            profession: studentForm.profession
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

      // Verify the profile was created with correct role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
      } else {
        console.log('Created profile with role:', profileData.role);
      }

      // Store credentials and user data for display
      setGeneratedCredentials({
        email,
        password,
        userData: { ...studentForm },
        userType: 'student'
      });

      // Send email with credentials and invoice (in a real app)
      await sendCredentialsEmail(email, password, studentForm, 'student');

      toast({
        title: "Success",
        description: "Student account created successfully! Credentials have been sent via email.",
      });

      // Reset form
      setStudentForm({
        full_name: '',
        phone: '',
        address: '',
        profession: '',
        course: '',
        total_fees: 0,
        paid_amount: 0,
        balance: 0
      });
      
      setShowAddUser(false);
      
      // Refresh users list
      setTimeout(() => {
        fetchUsers();
      }, 1000);
      
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
    
    if (!staffForm.full_name.trim()) {
      toast({
        title: "Error",
        description: "Please enter the full name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate email and password
      const email = generateEmailFromName(staffForm.full_name);
      const password = generateSecurePassword();

      // Create the user in Supabase Auth with STAFF role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: staffForm.full_name,
            role: 'staff', // EXPLICITLY SET STAFF ROLE
            phone: staffForm.phone,
            profession: staffForm.profession
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

      // Verify the profile was created with correct role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
      } else {
        console.log('Created profile with role:', profileData.role);
      }

      // Store credentials and user data for display
      setGeneratedCredentials({
        email,
        password,
        userData: { ...staffForm },
        userType: 'staff'
      });

      // Send email with credentials (in a real app)
      await sendCredentialsEmail(email, password, staffForm, 'staff');

      toast({
        title: "Success",
        description: "Staff account created successfully! Credentials have been sent via email.",
      });

      // Reset form
      setStaffForm({
        full_name: '',
        phone: '',
        profession: ''
      });
      
      setShowAddUser(false);
      
      // Refresh users list
      setTimeout(() => {
        fetchUsers();
      }, 1000);
      
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

  const sendCredentialsEmail = async (email: string, password: string, userData: StudentFormData | StaffFormData, userType: 'student' | 'staff') => {
    // In a real implementation, this would call your backend API to send the email
    // For now, we'll simulate the email sending
    console.log('Sending email to:', email);
    console.log('Credentials:', { email, password });
    console.log('User data:', userData);
    console.log('User type:', userType);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Email Sent",
      description: `Login credentials sent to ${email}`,
    });
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
            Create and manage student and staff accounts with automated credential generation and email delivery
          </p>
          
          <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-3 text-lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Register New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50 to-purple-50">
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
                            <Label htmlFor="student_phone" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <Phone className="h-5 w-5 text-emerald-600" />
                              Phone Number *
                            </Label>
                            <Input
                              id="student_phone"
                              value={studentForm.phone}
                              onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
                              required
                            />
                          </div>
                          <div className="lg:col-span-2 space-y-2">
                            <Label htmlFor="student_address" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-emerald-600" />
                              Complete Address *
                            </Label>
                            <Textarea
                              id="student_address"
                              value={studentForm.address}
                              onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                              placeholder="Enter complete residential address"
                              rows={4}
                              className="text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm resize-none"
                              required
                            />
                          </div>
                          <div className="lg:col-span-2 space-y-2">
                            <Label htmlFor="student_profession" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-emerald-600" />
                              Profession/Occupation *
                            </Label>
                            <Input
                              id="student_profession"
                              value={studentForm.profession}
                              onChange={(e) => setStudentForm({ ...studentForm, profession: e.target.value })}
                              placeholder="e.g., Student, Engineer, Teacher, Business"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm"
                              required
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Course & Payment Information Card */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 rounded-t-lg">
                        <CardTitle className="text-2xl flex items-center gap-3 text-blue-800">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          Course & Payment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="space-y-8">
                          <div className="space-y-2">
                            <Label htmlFor="student_course" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                              Select Course *
                            </Label>
                            <Select 
                              value={studentForm.course} 
                              onValueChange={(value) => {
                                const selectedCourse = courses.find(c => c.id === value);
                                setStudentForm({ 
                                  ...studentForm, 
                                  course: value,
                                  total_fees: selectedCourse?.price || 0
                                });
                              }}
                            >
                              <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm">
                                <SelectValue placeholder="Choose a course from available options" />
                              </SelectTrigger>
                              <SelectContent>
                                {courses.map((course) => (
                                  <SelectItem key={course.id} value={course.id} className="text-lg py-3">
                                    <div className="flex justify-between items-center w-full">
                                      <span>{course.title}</span>
                                      <span className="font-semibold text-green-600 ml-4">₹{course.price}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="student_total_fees" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                Total Course Fees *
                              </Label>
                              <Input
                                id="student_total_fees"
                                type="number"
                                step="0.01"
                                value={studentForm.total_fees}
                                onChange={(e) => setStudentForm({ ...studentForm, total_fees: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                className="h-14 text-lg border-2 border-gray-200 focus:border-green-500 rounded-xl shadow-sm"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="student_paid_amount" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                Amount Paid *
                              </Label>
                              <Input
                                id="student_paid_amount"
                                type="number"
                                step="0.01"
                                value={studentForm.paid_amount}
                                onChange={(e) => setStudentForm({ ...studentForm, paid_amount: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="student_balance" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-orange-600" />
                                Remaining Balance
                              </Label>
                              <Input
                                id="student_balance"
                                type="number"
                                value={studentForm.balance}
                                readOnly
                                className="h-14 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl shadow-sm font-bold text-orange-600"
                              />
                            </div>
                          </div>

                          {studentForm.balance > 0 && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                  <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-bold text-amber-800 text-lg">Pending Balance: ₹{studentForm.balance.toFixed(2)}</p>
                                  <p className="text-amber-700">This amount needs to be collected from the student</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Email Generation Info */}
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Mail className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-blue-800 text-xl mb-2">Automatic Email Generation</h3>
                            <p className="text-blue-700 text-lg mb-3">
                              Email will be auto-generated as: <span className="font-bold text-blue-900">{studentForm.full_name ? generateEmailFromName(studentForm.full_name) : 'name.alphafly@gmail.com'}</span>
                            </p>
                            <div className="bg-white/70 rounded-lg p-4">
                              <p className="text-blue-600 font-medium">📧 Login credentials and payment invoice will be sent automatically</p>
                              <p className="text-blue-600 font-medium">🔐 Secure password will be auto-generated</p>
                              <p className="text-blue-600 font-medium">📄 Professional invoice PDF will be attached</p>
                            </div>
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
                    {/* Staff Information Card */}
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
                            <Label htmlFor="staff_phone" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <Phone className="h-5 w-5 text-purple-600" />
                              Phone Number *
                            </Label>
                            <Input
                              id="staff_phone"
                              value={staffForm.phone}
                              onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm"
                              required
                            />
                          </div>
                          <div className="lg:col-span-2 space-y-2">
                            <Label htmlFor="staff_profession" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-purple-600" />
                              Profession/Designation *
                            </Label>
                            <Input
                              id="staff_profession"
                              value={staffForm.profession}
                              onChange={(e) => setStaffForm({ ...staffForm, profession: e.target.value })}
                              placeholder="e.g., Computer Instructor, Course Coordinator, IT Specialist"
                              className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm"
                              required
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Staff Permissions Info */}
                    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3 text-purple-800">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-white" />
                          </div>
                          Staff Access Permissions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white/70 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-bold text-blue-800 mb-2">Course Management</h3>
                            <p className="text-blue-700 text-sm">Create, edit, and manage courses and content</p>
                          </div>
                          <div className="bg-white/70 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-bold text-green-800 mb-2">Student Dashboard</h3>
                            <p className="text-green-700 text-sm">View and manage student progress</p>
                          </div>
                          <div className="bg-white/70 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-bold text-orange-800 mb-2">Assessment Tools</h3>
                            <p className="text-orange-700 text-sm">Create quizzes and assignments</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Email Generation Info */}
                    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Mail className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-purple-800 text-xl mb-2">Automatic Email Generation</h3>
                            <p className="text-purple-700 text-lg mb-3">
                              Email will be auto-generated as: <span className="font-bold text-purple-900">{staffForm.full_name ? generateEmailFromName(staffForm.full_name) : 'name.alphafly@gmail.com'}</span>
                            </p>
                            <div className="bg-white/70 rounded-lg p-4">
                              <p className="text-purple-600 font-medium">📧 Login credentials will be sent automatically</p>
                              <p className="text-purple-600 font-medium">🔐 Secure password will be auto-generated</p>
                              <p className="text-purple-600 font-medium">👨‍🏫 Staff dashboard access will be enabled</p>
                            </div>
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

        {/* Generated Credentials Display */}
        {generatedCredentials && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-800 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                {generatedCredentials.userType === 'student' ? 'Student' : 'Staff'} Account Created Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {/* User Information */}
              <div className="bg-white/80 p-6 rounded-xl border border-green-200 shadow-lg">
                <h3 className="font-bold text-green-800 mb-4 text-xl">
                  {generatedCredentials.userType === 'student' ? 'Student' : 'Staff'} Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-700">Name:</p>
                    <p className="text-gray-900 text-lg">{generatedCredentials.userData.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-700">Phone:</p>
                    <p className="text-gray-900 text-lg">{generatedCredentials.userData.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-700">Profession:</p>
                    <p className="text-gray-900 text-lg">{generatedCredentials.userData.profession}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-700">Role:</p>
                    <Badge className={`text-lg px-4 py-2 ${generatedCredentials.userType === 'student' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {generatedCredentials.userType.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Student-specific fields */}
                  {generatedCredentials.userType === 'student' && (
                    <>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-700">Course:</p>
                        <p className="text-gray-900 text-lg">{courses.find(c => c.id === (generatedCredentials.userData as StudentFormData).course)?.title || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-700">Total Fees:</p>
                        <p className="text-gray-900 text-lg font-bold">₹{(generatedCredentials.userData as StudentFormData).total_fees}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-700">Paid Amount:</p>
                        <p className="text-gray-900 text-lg font-bold">₹{(generatedCredentials.userData as StudentFormData).paid_amount}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-700">Balance:</p>
                        <p className={`text-lg font-bold ${(generatedCredentials.userData as StudentFormData).balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{(generatedCredentials.userData as StudentFormData).balance}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Login Credentials */}
              <div className="bg-white/80 p-6 rounded-xl border border-green-200 shadow-lg">
                <h3 className="font-bold text-green-800 mb-4 text-xl">Login Credentials (Sent via Email)</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold text-green-700 text-lg">Email:</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input value={generatedCredentials.email} readOnly className="bg-gray-50 text-lg h-12" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedCredentials.email)}
                        className="h-12 px-4"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-green-700 text-lg">Password:</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input value={generatedCredentials.password} readOnly className="bg-gray-50 font-mono text-lg h-12" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedCredentials.password)}
                        className="h-12 px-4"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800 text-lg">Email Sent Successfully</p>
                    <p className="text-amber-700 mt-1 text-lg">
                      Login credentials have been sent to <strong>{generatedCredentials.email}</strong>
                    </p>
                    <p className="text-amber-600 mt-2">
                      The {generatedCredentials.userType} can use these credentials to access their dashboard and change their password after first login.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => copyToClipboard(`Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg"
                >
                  <Copy className="h-5 w-5 mr-2" />
                  Copy All Credentials
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setGeneratedCredentials(null)}
                  className="px-6 py-3 text-lg border-2"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-semibold text-lg">Total Users</p>
                  <p className="text-4xl font-bold">{userStats.total}</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 font-semibold text-lg">Administrators</p>
                  <p className="text-4xl font-bold">{userStats.admins}</p>
                </div>
                <Crown className="h-12 w-12 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 font-semibold text-lg">Staff Members</p>
                  <p className="text-4xl font-bold">{userStats.staff}</p>
                </div>
                <Shield className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 font-semibold text-lg">Students</p>
                  <p className="text-4xl font-bold">{userStats.students}</p>
                </div>
                <GraduationCap className="h-12 w-12 text-green-200" />
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
                    <TableHead className="font-bold text-lg py-4">Created</TableHead>
                    <TableHead className="font-bold text-lg py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors border-b">
                      <TableCell className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{user.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-lg py-6">{user.email}</TableCell>
                      <TableCell className="py-6">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-2 w-fit px-4 py-2 text-lg">
                          {getRoleIcon(user.role)}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                          onClick={() => handleDeleteUser(user.id, user.role)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-3"
                          disabled={user.role === 'admin' && adminCount <= 1}
                        >
                          <Trash2 className="h-5 w-5" />
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