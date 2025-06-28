import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Award, 
  TrendingUp,
  Clock,
  CheckCircle,
  PlayCircle,
  ArrowUpRight,
  Target,
  Calendar,
  Star,
  Trophy
} from 'lucide-react';

interface EnrolledCourse {
  id: string;
  progress: number;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    price: number;
  };
}

export const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalQuizzesTaken: 0,
    totalHoursLearned: 0,
    averageScore: 0,
    streak: 0,
    certificates: 0
  });
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      fetchStudentStats();
      fetchEnrolledCourses();
    }
  }, [profile]);

  const fetchStudentStats = async () => {
    if (!profile) return;

    try {
      // Fetch enrolled courses count
      const { count: enrolledCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', profile.id);

      // Fetch completed courses (100% progress)
      const { count: completedCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', profile.id)
        .eq('progress', 100);

      // Fetch in-progress courses (0-99% progress)
      const { count: inProgressCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', profile.id)
        .gt('progress', 0)
        .lt('progress', 100);

      // Fetch total quiz attempts and calculate average score
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('score, total_points')
        .eq('student_id', profile.id);

      const totalQuizzes = quizAttempts?.length || 0;
      const averageScore = quizAttempts?.length ? 
        Math.round(quizAttempts.reduce((sum, attempt) => {
          return sum + (attempt.total_points > 0 ? (attempt.score / attempt.total_points) * 100 : 0);
        }, 0) / quizAttempts.length) : 0;

      setStats({
        enrolledCourses: enrolledCount || 0,
        completedCourses: completedCount || 0,
        inProgressCourses: inProgressCount || 0,
        totalQuizzesTaken: totalQuizzes,
        totalHoursLearned: Math.floor(Math.random() * 50) + 10, // Mock data
        averageScore,
        streak: Math.floor(Math.random() * 15) + 1, // Mock data
        certificates: completedCount || 0
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

  const fetchEnrolledCourses = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            price
          )
        `)
        .eq('student_id', profile.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrolledCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const getProgressStatus = (progress: number) => {
    if (progress === 0) return 'Not started';
    if (progress === 100) return 'Completed';
    return 'In progress';
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 50) return 'bg-red-500';
    if (progress < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-teal-100">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Continue your learning journey and achieve your goals</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Enrolled Courses</p>
                  <p className="text-3xl font-bold">{stats.enrolledCourses}</p>
                  <p className="text-emerald-100 text-xs mt-1">Active learning</p>
                </div>
                <BookOpen className="h-12 w-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{stats.completedCourses}</p>
                  <p className="text-blue-100 text-xs mt-1">{stats.certificates} certificates</p>
                </div>
                <CheckCircle className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{stats.inProgressCourses}</p>
                  <p className="text-amber-100 text-xs mt-1">Keep going!</p>
                </div>
                <Clock className="h-12 w-12 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg. Score</p>
                  <p className="text-3xl font-bold">{stats.averageScore}%</p>
                  <p className="text-purple-100 text-xs mt-1">{stats.totalQuizzesTaken} quizzes taken</p>
                </div>
                <Award className="h-12 w-12 text-purple-200" />
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
                  <p className="text-gray-600 text-sm font-medium">Learning Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Hours Learned</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHoursLearned}h</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Certificates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.certificates}</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full">
                  <Trophy className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    My Courses
                  </CardTitle>
                  <Link to="/courses">
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                      Browse More
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
                    <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet. Discover amazing courses to boost your skills!</p>
                    <Link to="/courses">
                      <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {enrolledCourses.map((enrollment) => (
                      <div key={enrollment.id} className="border rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-bold text-xl text-gray-900">{enrollment.courses.title}</h3>
                              <Badge variant={enrollment.progress === 100 ? "default" : "secondary"} className="px-3 py-1">
                                {getProgressStatus(enrollment.progress)}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {enrollment.courses.description}
                            </p>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-700">Progress</span>
                                <span className="text-gray-900">{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} className="h-3" />
                            </div>
                          </div>
                          <div className="ml-6 flex flex-col gap-3">
                            <Link to={`/course/${enrollment.courses.id}`}>
                              <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                                {enrollment.progress === 0 ? (
                                  <>
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Start Learning
                                  </>
                                ) : (
                                  <>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Continue
                                  </>
                                )}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Tips */}
          <div className="space-y-6">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/courses">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse All Courses
                  </Button>
                </Link>
                
                <Link to="/student/progress">
                  <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Progress Report
                  </Button>
                </Link>
                
                <Link to="/student/certificates">
                  <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                    <Award className="h-4 w-4 mr-2" />
                    My Certificates
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-emerald-800">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  Learning Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Set aside dedicated time for learning each day</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Take notes while watching course videos</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Practice with quizzes to reinforce learning</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Complete assignments on time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};