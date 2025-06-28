import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  BookOpen, 
  DollarSign, 
  Users, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Globe,
  Lock,
  Calendar,
  Star
} from 'lucide-react';

type Course = Tables<'courses'> & {
  profiles: { full_name: string } | null;
  enrollments: { count: number }[];
};

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, [profile]);

  const fetchCourses = async () => {
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          profiles:created_by(full_name),
          enrollments(count)
        `)
        .order('created_at', { ascending: false });

      // If user is staff, only show their courses
      if (profile?.role === 'staff') {
        query = query.eq('created_by', profile.id);
      }

      // If user is student, only show published courses
      if (profile?.role === 'student') {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCourses(data as Course[]);
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

  const handleEnrollment = async (courseId: string, price: number) => {
    if (!profile) return;

    if (price > 0) {
      // Redirect to payment page
      navigate(`/payment/${courseId}`);
    } else {
      // Free enrollment
      try {
        const { error } = await supabase
          .from('enrollments')
          .insert({
            student_id: profile.id,
            course_id: courseId
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Enrolled successfully!",
        });
        
        navigate(`/course/${courseId}`);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course deleted successfully!",
      });
      
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isInstructor = profile?.role === 'admin' || profile?.role === 'staff';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isInstructor ? 'Manage Courses' : 'Available Courses'}
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              {isInstructor 
                ? 'Create and manage your courses' 
                : 'Discover amazing courses to boost your skills'
              }
            </p>
          </div>
          {isInstructor && (
            <Link to="/admin/courses/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          )}
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isInstructor ? 'No Courses Created Yet' : 'No Courses Available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {isInstructor 
                  ? 'Start creating your first course to share knowledge with students.'
                  : 'Check back later for new courses.'
                }
              </p>
              {isInstructor && (
                <Link to="/admin/courses/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="p-0">
                  {course.thumbnail_url && (
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant={course.is_published ? "default" : "secondary"} className="shadow-lg">
                          {course.is_published ? (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Draft
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant={course.price > 0 ? "destructive" : "secondary"} className="shadow-lg">
                          {course.price > 0 ? `$${course.price}` : 'Free'}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="p-6 pb-4">
                    <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-3">
                      by {course.profiles?.full_name || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollments?.[0]?.count || 0} enrolled</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(course.created_at!).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 pb-6">
                  <div 
                    className="text-gray-700 text-sm mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: course.description || 'No description available.' }}
                  />

                  <div className="flex gap-2">
                    {isInstructor ? (
                      <>
                        <Link to={`/admin/courses/${course.id}`} className="flex-1">
                          <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/course/${course.id}/preview`}>
                          <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteCourse(course.id)}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to={`/course/${course.id}/preview`} className="flex-1">
                          <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </Link>
                        {profile?.role === 'student' && (
                          <Button
                            onClick={() => handleEnrollment(course.id, course.price)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            {course.price > 0 ? (
                              <>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Buy Now
                              </>
                            ) : (
                              'Enroll Free'
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};