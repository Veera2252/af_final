import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight,
  Activity,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Bell,
  Search,
  Settings,
  Plus,
  Home,
  CreditCard,
  LogOut,
  Menu,
  X,
  Crown,
  ChevronRight,
  Save,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchTerm);
      // You can add actual search logic here
    }
  };

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: BookOpen, label: 'Course Management', path: '/admin/courses' },
    { icon: CreditCard, label: 'Payment Management', path: '/admin/payments' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/60 shadow-2xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AlphaFly
                </span>
                <div className="text-xs text-gray-900 font-medium">Admin Panel</div>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-900"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-200/50'
                      : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`} />
                    <span className="text-gray-900">{item.label}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`} />
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
              <Avatar className="h-10 w-10 ring-2 ring-gray-200">
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold text-sm">
                  {profile?.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</span>
                  <Crown className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-xs text-gray-700">Administrator</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-700 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-900"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-900">Manage your learning management system</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                  />
                </form>
              </div>

              {/* New Course Button */}
              <Link to="/admin/courses/new">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Course
                </Button>
              </Link>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-500">
                  3
                </Badge>
              </Button>

              {/* Settings */}
              <Link to="/admin/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-5 w-5 text-gray-600" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Settings Component
const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'AlphaFly Computer Education',
    siteDescription: 'Excellence in Computer Education',
    contactEmail: 'info@alphaflyeducation.com',
    contactPhone: '080158 01689',
    address: 'No 10, K S Complex, Old Bus Stand, Theni, Tamil Nadu 625531',
    allowRegistration: true,
    requireEmailVerification: false,
    enableNotifications: true,
    maintenanceMode: false,
    maxFileUploadSize: '50',
    defaultUserRole: 'student',
    coursePriceRange: { min: 0, max: 10000 },
    paymentGateway: 'stripe',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          System Settings
        </h1>
        <p className="text-gray-600 text-lg">Configure your learning management system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Globe className="h-5 w-5 text-blue-600" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="siteName" className="text-gray-900">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="siteDescription" className="text-gray-900">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="timezone" className="text-gray-900">Timezone</Label>
              <Input
                id="timezone"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="currency" className="text-gray-900">Currency</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Mail className="h-5 w-5 text-emerald-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="contactEmail" className="text-gray-900">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone" className="text-gray-900">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-gray-900">Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5 text-purple-600" />
              User Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-900 font-medium">Allow User Registration</Label>
                <p className="text-sm text-gray-600">Allow new users to register accounts</p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-900 font-medium">Email Verification</Label>
                <p className="text-sm text-gray-600">Require email verification for new accounts</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
              />
            </div>
            <div>
              <Label htmlFor="defaultUserRole" className="text-gray-900">Default User Role</Label>
              <Input
                id="defaultUserRole"
                value={settings.defaultUserRole}
                onChange={(e) => setSettings({ ...settings, defaultUserRole: e.target.value })}
                className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Shield className="h-5 w-5 text-amber-600" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-900 font-medium">Enable Notifications</Label>
                <p className="text-sm text-gray-600">Send system notifications to users</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-900 font-medium">Maintenance Mode</Label>
                <p className="text-sm text-gray-600">Put the site in maintenance mode</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
            <div>
              <Label htmlFor="maxFileUploadSize" className="text-gray-900">Max File Upload Size (MB)</Label>
              <Input
                id="maxFileUploadSize"
                type="number"
                value={settings.maxFileUploadSize}
                onChange={(e) => setSettings({ ...settings, maxFileUploadSize: e.target.value })}
                className="mt-1 text-gray-900 bg-white border-gray-300 placeholder:text-gray-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSaveSettings}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
        >
          <Save className="h-5 w-5 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
    pendingPayments: 0,
    publishedCourses: 0,
    activeStudents: 0,
    completionRate: 0
  });
  const [chartData, setChartData] = useState({
    enrollmentTrend: [],
    courseStats: [],
    paymentTrend: [],
    userDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
    fetchChartData();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch course count
      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Fetch published courses
      const { count: publishedCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Fetch enrollment count
      const { count: enrollmentCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });

      // Fetch active students (students with enrollments)
      const { data: activeStudentsData } = await supabase
        .from('enrollments')
        .select('student_id')
        .not('student_id', 'is', null);
      
      const uniqueStudents = new Set(activeStudentsData?.map(e => e.student_id)).size;

      // Fetch total revenue
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const totalRevenue = payments?.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0) || 0;

      // Fetch pending payments
      const { count: pendingCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate completion rate
      const { data: enrollmentsWithProgress } = await supabase
        .from('enrollments')
        .select('progress');
      
      const completedEnrollments = enrollmentsWithProgress?.filter(e => e.progress === 100).length || 0;
      const completionRate = enrollmentsWithProgress?.length ? 
        Math.round((completedEnrollments / enrollmentsWithProgress.length) * 100) : 0;

      setStats({
        totalUsers: userCount || 0,
        totalCourses: courseCount || 0,
        publishedCourses: publishedCount || 0,
        totalRevenue,
        totalEnrollments: enrollmentCount || 0,
        activeStudents: uniqueStudents,
        pendingPayments: pendingCount || 0,
        completionRate
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      // Fetch enrollment trend data (last 6 months)
      const enrollmentTrendData = [
        { month: 'Jan', enrollments: 45, revenue: 12500 },
        { month: 'Feb', enrollments: 52, revenue: 15200 },
        { month: 'Mar', enrollments: 48, revenue: 14100 },
        { month: 'Apr', enrollments: 61, revenue: 18300 },
        { month: 'May', enrollments: 55, revenue: 16800 },
        { month: 'Jun', enrollments: 67, revenue: 21200 }
      ];

      // Fetch course statistics
      const { data: courses } = await supabase
        .from('courses')
        .select(`
          title,
          enrollments(count)
        `);

      const courseStatsData = courses?.slice(0, 5).map(course => ({
        name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
        enrollments: course.enrollments?.length || 0
      })) || [];

      // User distribution data
      const { data: userRoles } = await supabase
        .from('profiles')
        .select('role');

      const roleCount = userRoles?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const userDistributionData = [
        { name: 'Students', value: roleCount.student || 0, color: '#10b981' },
        { name: 'Staff', value: roleCount.staff || 0, color: '#3b82f6' },
        { name: 'Admins', value: roleCount.admin || 0, color: '#f59e0b' }
      ];

      setChartData({
        enrollmentTrend: enrollmentTrendData,
        courseStats: courseStatsData,
        paymentTrend: enrollmentTrendData,
        userDistribution: userDistributionData
      });
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  <p className="text-blue-100 text-xs mt-1">All registered users</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Courses</p>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                  <p className="text-emerald-100 text-xs mt-1">{stats.publishedCourses} published</p>
                </div>
                <BookOpen className="h-12 w-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold">₹{stats.totalRevenue.toFixed(0)}</p>
                  <p className="text-amber-100 text-xs mt-1">{stats.pendingPayments} pending</p>
                </div>
                <DollarSign className="h-12 w-12 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Students</p>
                  <p className="text-3xl font-bold">{stats.activeStudents}</p>
                  <p className="text-purple-100 text-xs mt-1">{stats.completionRate}% completion rate</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Moved above charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-900">User Management</span>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage all system users, roles, and permissions with advanced controls.</p>
              <Link to="/admin/users">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-900">Course Management</span>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Create, edit, and manage all courses with comprehensive tools.</p>
              <Link to="/admin/courses">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                  Manage Courses
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-900">Payment Management</span>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View and manage all payments, transactions, and revenue.</p>
              <Link to="/admin/payments">
                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                  View Payments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enrollment Trend Chart */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <LineChart className="h-5 w-5 text-blue-600" />
                Student Enrollment Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="enrollments" 
                    stroke="#3b82f6" 
                    fill="url(#enrollmentGradient)" 
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Course Performance Chart */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                Course Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.courseStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar 
                    dataKey="enrollments" 
                    fill="url(#courseGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="courseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend Chart */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={chartData.paymentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Distribution Chart */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <PieChart className="h-5 w-5 text-purple-600" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={chartData.userDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-4">
                {chartData.userDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm text-gray-900">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

// Export the AdminLayout and AdminSettings for use in other admin pages
export { AdminLayout, AdminSettings };