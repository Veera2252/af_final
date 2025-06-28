import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { StripeProvider } from '@/components/payment/StripeProvider';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, Shield, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const PaymentPage: React.FC = () => {
  const { courseId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:created_by(full_name)
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Course not found or unavailable",
        variant: "destructive",
      });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
        <Button onClick={() => navigate('/courses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <StripeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/courses')}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Complete Your Enrollment
              </h1>
              <p className="text-gray-600">Secure payment powered by Stripe</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.thumbnail_url && (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-sm text-gray-600">by {course.profiles?.full_name}</p>
                  </div>
                  <div 
                    className="text-sm text-gray-700 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-600">Course Price:</span>
                    <span className="text-2xl font-bold text-green-600">₹{course.price}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Features */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Shield className="h-5 w-5" />
                    Secure Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Instant course access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Lifetime access</span>
                  </div>
                </CardContent>
              </Card>

              {/* Institution Info */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-blue-900">AlphaFly Computer Education</h3>
                    <p className="text-xs text-blue-700">
                      No 10, K S Complex, Old Bus Stand<br />
                      Subban Chetty Street, Suppan Ragavan Colony<br />
                      NRT Nagar, Theni, Tamil Nadu 625531<br />
                      Phone: 080158 01689
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2">
              <PaymentForm
                courseId={course.id}
                courseTitle={course.title}
                amount={course.price}
                onSuccess={() => {
                  toast({
                    title: "Enrollment Successful!",
                    description: "Welcome to your new course!",
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </StripeProvider>
  );
};