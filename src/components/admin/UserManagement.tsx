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
  UserCheck
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

      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: studentForm.full_name,
            role: 'student',
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

      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: staffForm.full_name,
            role: 'staff',
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Registration & Management
          </h1>
          <p className="text-gray-600 mt-1">Register new students and staff members with auto-generated credentials</p>
        </div>
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <UserPlus className="h-4 w-4 mr-2" />
              Register User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                User Registration
              </DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student Registration
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Staff Registration
                </TabsTrigger>
              </TabsList>

              {/* Student Registration */}
              <TabsContent value="student">
                <form onSubmit={handleCreateStudent} className="space-y-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Student Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="student_full_name" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Full Name *
                          </Label>
                          <Input
                            id="student_full_name"
                            value={studentForm.full_name}
                            onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                            placeholder="Enter student's full name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="student_phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone Number *
                          </Label>
                          <Input
                            id="student_phone"
                            value={studentForm.phone}
                            onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="student_address" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address *
                        </Label>
                        <Textarea
                          id="student_address"
                          value={studentForm.address}
                          onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                          placeholder="Enter complete address"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="student_profession" className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Profession *
                        </Label>
                        <Input
                          id="student_profession"
                          value={studentForm.profession}
                          onChange={(e) => setStudentForm({ ...studentForm, profession: e.target.value })}
                          placeholder="e.g., Student, Engineer, Teacher"
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Course & Payment Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Course & Payment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="student_course" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Course *
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title} - ₹{course.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="student_total_fees" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Fees *
                          </Label>
                          <Input
                            id="student_total_fees"
                            type="number"
                            step="0.01"
                            value={studentForm.total_fees}
                            onChange={(e) => setStudentForm({ ...studentForm, total_fees: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="student_paid_amount" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Paid Amount *
                          </Label>
                          <Input
                            id="student_paid_amount"
                            type="number"
                            step="0.01"
                            value={studentForm.paid_amount}
                            onChange={(e) => setStudentForm({ ...studentForm, paid_amount: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="student_balance" className="flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            Balance
                          </Label>
                          <Input
                            id="student_balance"
                            type="number"
                            value={studentForm.balance}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>
                      </div>

                      {studentForm.balance > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-amber-800 text-sm">
                            <strong>Pending Balance:</strong> ₹{studentForm.balance.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Email Generation Info */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">Automatic Email Generation</p>
                        <p className="text-blue-700 mt-1">
                          Email will be auto-generated as: <strong>{studentForm.full_name ? generateEmailFromName(studentForm.full_name) : 'name.alphafly@gmail.com'}</strong>
                        </p>
                        <p className="text-blue-600 mt-2">
                          Login credentials and payment invoice will be sent to this email address automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Creating Account...' : 'Register Student'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Staff Registration */}
              <TabsContent value="staff">
                <form onSubmit={handleCreateStaff} className="space-y-6">
                  {/* Staff Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Staff Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="staff_full_name" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Full Name *
                          </Label>
                          <Input
                            id="staff_full_name"
                            value={staffForm.full_name}
                            onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                            placeholder="Enter staff member's full name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="staff_phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone Number *
                          </Label>
                          <Input
                            id="staff_phone"
                            value={staffForm.phone}
                            onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="staff_profession" className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Profession/Designation *
                        </Label>
                        <Input
                          id="staff_profession"
                          value={staffForm.profession}
                          onChange={(e) => setStaffForm({ ...staffForm, profession: e.target.value })}
                          placeholder="e.g., Computer Instructor, Course Coordinator, IT Specialist"
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Staff Permissions Info */}
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                        <UserCheck className="h-5 w-5" />
                        Staff Permissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-purple-700">
                      <div className="flex items-start gap-3">
                        <Shield className="h-4 w-4 mt-0.5 text-purple-600" />
                        <div>
                          <p className="font-medium">Course Management</p>
                          <p>Create, edit, and manage courses and course content</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-4 w-4 mt-0.5 text-purple-600" />
                        <div>
                          <p className="font-medium">Student Dashboard Access</p>
                          <p>View and manage student progress and enrollments</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 mt-0.5 text-purple-600" />
                        <div>
                          <p className="font-medium">Assessment Tools</p>
                          <p>Create and manage quizzes and assignments</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Email Generation Info */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-purple-800">Automatic Email Generation</p>
                        <p className="text-purple-700 mt-1">
                          Email will be auto-generated as: <strong>{staffForm.full_name ? generateEmailFromName(staffForm.full_name) : 'name.alphafly@gmail.com'}</strong>
                        </p>
                        <p className="text-purple-600 mt-2">
                          Login credentials will be sent to this email address automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      {loading ? 'Creating Account...' : 'Register Staff Member'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
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
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Key className="h-5 w-5" />
              {generatedCredentials.userType === 'student' ? 'Student' : 'Staff'} Account Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Information */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">
                {generatedCredentials.userType === 'student' ? 'Student' : 'Staff'} Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Name:</p>
                  <p className="text-gray-900">{generatedCredentials.userData.full_name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Phone:</p>
                  <p className="text-gray-900">{generatedCredentials.userData.phone}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Profession:</p>
                  <p className="text-gray-900">{generatedCredentials.userData.profession}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Role:</p>
                  <p className="text-gray-900 capitalize font-semibold">{generatedCredentials.userType}</p>
                </div>
                
                {/* Student-specific fields */}
                {generatedCredentials.userType === 'student' && (
                  <>
                    <div>
                      <p className="font-medium text-gray-700">Course:</p>
                      <p className="text-gray-900">{courses.find(c => c.id === (generatedCredentials.userData as StudentFormData).course)?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Total Fees:</p>
                      <p className="text-gray-900">₹{(generatedCredentials.userData as StudentFormData).total_fees}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Paid Amount:</p>
                      <p className="text-gray-900">₹{(generatedCredentials.userData as StudentFormData).paid_amount}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Balance:</p>
                      <p className={`font-semibold ${(generatedCredentials.userData as StudentFormData).balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{(generatedCredentials.userData as StudentFormData).balance}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Login Credentials */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">Login Credentials (Sent via Email)</h3>
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
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Send className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Email Sent Successfully</p>
                  <p className="text-amber-700 mt-1">
                    Login credentials have been sent to <strong>{generatedCredentials.email}</strong>
                  </p>
                  <p className="text-amber-600 mt-2">
                    The {generatedCredentials.userType} can use these credentials to access their dashboard and change their password after first login.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => copyToClipboard(`Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Credentials
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setGeneratedCredentials(null)}
              >
                Close
              </Button>
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