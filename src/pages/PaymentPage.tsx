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
  Headphones,
  CreditCard,
  Lock,
  Zap,
  Trophy
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
        {/* Enhanced Header */}
        <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto py-6">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/courses')}
                className="hover:bg-white/50 p-3 rounded-xl"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Courses
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Complete Your Enrollment
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Secure payment powered by Stripe</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span>Instant Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Course Information Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course Details */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
                <div className="relative">
                  {course.thumbnail_url && (
                    <div className="relative">
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-white/95 text-gray-900 mb-2 shadow-lg">
                          <Trophy className="h-3 w-3 mr-1" />
                          Premium Course
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className="text-white text-sm font-medium">4.9 (1,234 reviews)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-2xl leading-tight text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-2">by {course.profiles?.full_name}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Users className="h-3 w-3 mr-1" />
                          2,456 students
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Clock className="h-3 w-3 mr-1" />
                          12 hours
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div 
                    className="text-sm text-gray-700 line-clamp-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                  
                  {/* Enhanced Course Features */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                    <div className="space-y-3">
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
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-gray-700">Downloadable resources</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Price Display */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Course Price</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-4xl font-bold text-green-800">₹{course.price}</p>
                          <p className="text-lg text-green-600 line-through">₹{Math.round(course.price * 1.5)}</p>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Limited time offer - 33% off!</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-red-500 text-white mb-2">
                          SAVE ₹{Math.round(course.price * 0.5)}
                        </Badge>
                        <p className="text-xs text-green-600">One-time payment</p>
                        <p className="text-xs text-green-600">No hidden fees</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Security Features */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
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
                      <p className="font-medium">30-Day Money-back Guarantee</p>
                      <p className="text-green-600">Full refund if you're not satisfied</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Trusted by 10,000+ Students</p>
                      <p className="text-green-600">Join our community of successful learners</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Institution Info */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-xl">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <BookOpen className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 text-xl">AlphaFly Computer Education</h3>
                      <p className="text-sm text-blue-700 leading-relaxed mt-2">
                        No 10, K S Complex, Old Bus Stand<br />
                        Subban Chetty Street, Suppan Ragavan Colony<br />
                        NRT Nagar, Theni, Tamil Nadu 625531<br />
                        📞 080158 01689
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-3 border-t border-blue-200">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-blue-700 ml-2">Trusted by 10,000+ students</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-900">15+</p>
                        <p className="text-xs text-blue-700">Years Experience</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-900">95%</p>
                        <p className="text-xs text-blue-700">Success Rate</p>
                      </div>
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