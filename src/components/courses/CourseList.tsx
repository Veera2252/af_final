
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, DollarSign, Users } from 'lucide-react';

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
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:created_by(full_name),
          enrollments(count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

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

  if (loading) {
    return <div className="flex justify-center py-8">Loading courses...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Available Courses</h1>
      
      {courses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <p className="text-sm text-gray-600">
                  by {course.profiles?.full_name || 'Unknown'}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{course.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={course.price > 0 ? "default" : "secondary"}>
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.enrollments?.[0]?.count || 0} enrolled</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/course/${course.id}/preview`)}
                    className="flex-1"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  {profile?.role === 'student' && (
                    <Button
                      onClick={() => handleEnrollment(course.id, course.price)}
                      className="flex-1"
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
