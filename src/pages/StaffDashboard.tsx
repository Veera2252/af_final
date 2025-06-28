
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Users, 
  Award,
  FileText,
  TrendingUp,
  Plus
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    myCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    totalQuizzes: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      fetchStaffStats();
      fetchRecentCourses();
    }
  }, [profile]);

  const fetchStaffStats = async () => {
    if (!profile) return;

    try {
      // Fetch courses created by this staff member
      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', profile.id);

      // Fetch total students enrolled in staff's courses
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          courses!inner(created_by)
        `)
        .eq('courses.created_by', profile.id);

      // Fetch assignments for staff's courses
      const { count: assignmentCount } = await supabase
        .from('assignments')
        .select(`
          *,
          courses!inner(created_by)
        `, { count: 'exact', head: true })
        .eq('courses.created_by', profile.id);

      // Fetch quizzes for staff's courses
      const { count: quizCount } = await supabase
        .from('quizzes')
        .select(`
          *,
          courses!inner(created_by)
        `, { count: 'exact', head: true })
        .eq('courses.created_by', profile.id);

      setStats({
        myCourses: courseCount || 0,
        totalStudents: enrollments?.length || 0,
        totalAssignments: assignmentCount || 0,
        totalQuizzes: quizCount || 0
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

  const fetchRecentCourses = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('created_by', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching recent courses:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
        <p className="text-gray-600">Manage your courses and students</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/admin/courses/new">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Course
                </Button>
              </Link>
              
              <Link to="/admin/courses">
                <Button variant="outline" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage My Courses
                </Button>
              </Link>
              
              <Link to="/staff/students">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  View My Students
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Assessment Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 mb-4">Create and manage assessments for your courses.</p>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/staff/quizzes">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Quizzes
                  </Button>
                </Link>
                <Link to="/staff/assignments">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Assignments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCourses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No courses created yet.</p>
            ) : (
              <div className="space-y-3">
                {recentCourses.map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-gray-600">
                        {course.is_published ? 'Published' : 'Draft'} • ${course.price}
                      </p>
                    </div>
                    <Link to={`/admin/courses/${course.id}`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
