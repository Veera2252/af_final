import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { StripeProvider } from '@/components/payment/StripeProvider';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  BookOpen, 
  Shield, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  Award,
  Globe,
  Headphones
} from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or is no longer available.</p>
            <Button onClick={() => navigate('/courses')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <StripeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
          <div className="container mx-auto py-4">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Complete Your Enrollment
                </h1>
                <p className="text-gray-600">Secure payment powered by Stripe • SSL Encrypted</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Information Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course Details */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                <div className="relative">
                  {course.thumbnail_url && (
                    <div className="relative">
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-white/90 text-gray-900 mb-2">
                          Featured Course
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-xl leading-tight">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">by {course.profiles?.full_name}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="text-sm text-gray-700 line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                  
                  {/* Course Features */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">Lifetime Access</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Globe className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">Access on all devices</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-gray-700">Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Headphones className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-gray-700">24/7 Support</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Course Price</p>
                        <p className="text-3xl font-bold text-green-800">₹{course.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600">One-time payment</p>
                        <p className="text-xs text-green-600">No hidden fees</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Features */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Shield className="h-5 w-5" />
                    Secure Payment Guarantee
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-green-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">256-bit SSL Encryption</p>
                      <p className="text-green-600">Your payment data is fully encrypted and secure</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Instant Course Access</p>
                      <p className="text-green-600">Start learning immediately after payment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Money-back Guarantee</p>
                      <p className="text-green-600">30-day refund policy for your peace of mind</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Institution Info */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 text-lg">AlphaFly Computer Education</h3>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        No 10, K S Complex, Old Bus Stand<br />
                        Subban Chetty Street, Suppan Ragavan Colony<br />
                        NRT Nagar, Theni, Tamil Nadu 625531<br />
                        📞 080158 01689
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-xs text-blue-700 ml-1">Trusted by 1000+ students</span>
                    </div>
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
                    title: "🎉 Enrollment Successful!",
                    description: "Welcome to your new course! You can start learning immediately.",
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