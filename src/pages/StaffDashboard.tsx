import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { InquiryManagement } from '@/components/admin/InquiryManagement';
import { CourseEditor } from '@/components/courses/CourseEditor';
import { AssignmentManager } from '@/components/courses/AssignmentManager';
import { QuizManager } from '@/components/staff/QuizManager';
import { 
  BookOpen, 
  Users, 
  Award,
  FileText,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Target,
  BarChart3,
  MessageCircle,
  Edit,
  Eye
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    myCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
    publishedCourses: 0,
    draftCourses: 0,
    avgCompletionRate: 0,
    recentEnrollments: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCourseEditor, setShowCourseEditor] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showAssignments, setShowAssignments] = useState(false);
  const [showQuizzes, setShowQuizzes] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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
      const { data: courses, count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .eq('instructor_id', profile.id);

      const publishedCourses = courses?.filter(c => c.is_published).length || 0;
      const draftCourses = (courseCount || 0) - publishedCourses;

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          progress,
          courses!inner(instructor_id)
        `)
        .eq('courses.instructor_id', profile.id);

      const uniqueStudents = new Set(enrollments?.map(e => e.course_id)).size;
      const avgProgress = enrollments?.length ? 
        enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length : 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentEnrollmentCount } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses!inner(instructor_id)
        `, { count: 'exact', head: true })
        .eq('courses.instructor_id', profile.id)
        .gte('enrolled_at', thirtyDaysAgo.toISOString());

      const { count: assignmentCount } = await supabase
        .from('assignments')
        .select(`
          *,
          courses!inner(instructor_id)
        `, { count: 'exact', head: true })
        .eq('courses.instructor_id', profile.id);

      const { count: quizCount } = await supabase
        .from('quizzes')
        .select(`
          *,
          courses!inner(instructor_id)
        `, { count: 'exact', head: true })
        .eq('courses.instructor_id', profile.id);

      setStats({
        myCourses: courseCount || 0,
        publishedCourses,
        draftCourses,
        totalStudents: uniqueStudents,
        totalAssignments: assignmentCount || 0,
        totalQuizzes: quizCount || 0,
        avgCompletionRate: Math.round(avgProgress),
        recentEnrollments: recentEnrollmentCount || 0
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

  const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = '/login'; // redirect to login
};

  const fetchRecentCourses = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching recent courses:', error);
    }
  };

  const handleCreateCourse = () => {
    setSelectedCourseId(null);
    setShowCourseEditor(true);
  };

  const handleEditCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setShowCourseEditor(true);
  };

const handlePreviewCourse = (courseId: string) => {
  window.open(`/courses/${courseId}`, '_blank');
};


  const handleManageAssignments = (courseId: string) => {
    setSelectedCourseId(courseId);
    setShowAssignments(true);
  };

  const handleManageQuizzes = (courseId: string) => {
    setSelectedCourseId(courseId);
    setShowQuizzes(true);
  };

  const handleBackToDashboard = () => {
    setShowCourseEditor(false);
    setShowAssignments(false);
    setShowQuizzes(false);
    setShowPreview(false);
    setSelectedCourseId(null);
    fetchStaffStats();
    fetchRecentCourses();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (showCourseEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={handleBackToDashboard}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              Back to Dashboard
            </Button>
          </div>
          <CourseEditor courseId={selectedCourseId || 'new'} onSave={handleBackToDashboard} />
        </div>
      </div>
    );
  }

  if (showAssignments && selectedCourseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={handleBackToDashboard}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              Back to Dashboard
            </Button>
          </div>
          <AssignmentManager courseId={selectedCourseId} />
        </div>
      </div>
    );
  }

  if (showQuizzes && selectedCourseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={handleBackToDashboard}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              Back to Dashboard
            </Button>
          </div>
          <QuizManager courseId={selectedCourseId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
  <div>
    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
      Staff Dashboard
    </h1>
    <p className="text-gray-600 text-lg">Manage your courses and track student progress</p>
  </div>
  <Button 
    onClick={handleLogout}
    className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
  >
    Logout
  </Button>
</div>

        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="bg-white rounded-xl p-2 shadow-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'inquiries'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Course Inquiries
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">My Courses</p>
                      <p className="text-3xl font-bold">{stats.myCourses}</p>
                      <p className="text-purple-100 text-xs mt-1">{stats.publishedCourses} published</p>
                    </div>
                    <BookOpen className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Students</p>
                      <p className="text-3xl font-bold">{stats.totalStudents}</p>
                      <p className="text-blue-100 text-xs mt-1">{stats.recentEnrollments} new this month</p>
                    </div>
                    <Users className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Assignments</p>
                      <p className="text-3xl font-bold">{stats.totalAssignments}</p>
                      <p className="text-emerald-100 text-xs mt-1">Across all courses</p>
                    </div>
                    <FileText className="h-12 w-12 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm font-medium">Quizzes</p>
                      <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
                      <p className="text-amber-100 text-xs mt-1">Assessment tools</p>
                    </div>
                    <Award className="h-12 w-12 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Avg. Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.avgCompletionRate}%</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Draft Courses</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.draftCourses}</p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Recent Enrollments</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.recentEnrollments}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="space-y-6">
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg">
                        <Plus className="h-6 w-6 text-white" />
                      </div>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleCreateCourse}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Course
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => setActiveTab('inquiries')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      View Course Inquiries
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Courses */}
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      Recent Courses
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No courses created yet.</p>
                      <Button 
                        onClick={handleCreateCourse}
                        className="bg-gradient-to-r from-blue-600 to-blue-700"
                      >
                        Create Your First Course
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentCourses.map((course: any) => (
                        <div key={course.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{course.title}</h4>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                course.is_published 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {course.is_published ? 'Published' : 'Draft'}
                              </span>
                              <span className="text-sm text-gray-600">₹{course.price}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              onClick={() => handleEditCourse(course.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-200 text-green-700 hover:bg-green-50"
                              onClick={() => handlePreviewCourse(course.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-purple-200 text-purple-700 hover:bg-purple-50"
                              onClick={() => handleManageQuizzes(course.id)}
                            >
                              Quiz
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-orange-200 text-orange-700 hover:bg-orange-50"
                              onClick={() => handleManageAssignments(course.id)}
                            >
                              Assignment
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <InquiryManagement />
          </div>
        )}
      </div>
    </div>
  );
};
