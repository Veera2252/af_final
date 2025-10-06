
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, CreditCard, Award } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalPayments: number;
  totalCertificates: number;
  usersByRole: Array<{ name: string; value: number }>;
  courseEnrollments: Array<{ name: string; enrollments: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

export const DashboardCharts: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalPayments: 0,
    totalCertificates: 0,
    usersByRole: [],
    courseEnrollments: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total courses
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Fetch total payments
      const { count: paymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });

      // Fetch total certificates
      const { count: certificatesCount } = await supabase
        .from('student_certificates')
        .select('*', { count: 'exact', head: true });

      // Fetch users by role
      const { data: roleData } = await supabase
        .from('profiles')
        .select('role');

      const roleCounts = roleData?.reduce((acc: any, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}) || {};

      const usersByRole = Object.entries(roleCounts).map(([role, count]) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        value: count as number
      }));

      // Fetch course enrollments
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          courses (title)
        `);

      const enrollmentCounts = enrollmentData?.reduce((acc: any, enrollment) => {
        const courseTitle = enrollment.courses?.title || 'Unknown';
        acc[courseTitle] = (acc[courseTitle] || 0) + 1;
        return acc;
      }, {}) || {};

      const courseEnrollments = Object.entries(enrollmentCounts).map(([title, count]) => ({
        name: title,
        enrollments: count as number
      }));

      // Mock monthly revenue data (you can replace with actual data)
      const monthlyRevenue = [
        { month: 'Jan', revenue: 1200 },
        { month: 'Feb', revenue: 1900 },
        { month: 'Mar', revenue: 3000 },
        { month: 'Apr', revenue: 2500 },
        { month: 'May', revenue: 3200 },
        { month: 'Jun', revenue: 2800 }
      ];

      setStats({
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        totalPayments: paymentsCount || 0,
        totalCertificates: certificatesCount || 0,
        usersByRole,
        courseEnrollments: courseEnrollments.slice(0, 5), // Top 5 courses
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Enrollments Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Course Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.courseEnrollments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
