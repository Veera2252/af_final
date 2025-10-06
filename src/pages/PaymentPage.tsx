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
  Trophy,
  Play,
  Download,
  Infinity,
  Smartphone
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Modern Header */}
        <div className="bg-white/98 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40 shadow-lg">
          <div className="container mx-auto py-6">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/courses')}
                className="hover:bg-white/60 p-3 rounded-2xl border border-gray-200/50"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Courses
              </Button>
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Complete Your Enrollment
                </h1>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Secure payment powered by Stripe</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="font-medium">256-bit SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Instant Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-10">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
            {/* Course Information Sidebar */}
            <div className="xl:col-span-2 space-y-8">
              {/* Main Course Card */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
                <div className="relative">
                  {course.thumbnail_url && (
                    <div className="relative">
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      {/* Course Preview Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300">
                          <Play className="h-5 w-5 mr-2" />
                          Preview Course
                        </Button>
                      </div>
                      
                      {/* Course Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between">
                        <Badge className="bg-white/95 text-gray-900 shadow-lg">
                          <Trophy className="h-3 w-3 mr-1" />
                          Bestseller
                        </Badge>
                        <Badge className="bg-red-500 text-white shadow-lg">
                          33% OFF
                        </Badge>
                      </div>
                      
                      {/* Rating */}
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className="text-white text-sm font-medium">4.9 (2,456)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-2xl leading-tight text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600">by {course.profiles?.full_name}</p>
                    </div>
                    
                    {/* Course Stats */}
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                        <Users className="h-3 w-3 mr-1" />
                        2,456 students
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                        <Clock className="h-3 w-3 mr-1" />
                        12 hours content
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                        <Globe className="h-3 w-3 mr-1" />
                        English
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Course Description */}
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                  
                  {/* What You'll Learn */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-bold text-lg text-gray-900">What you'll learn:</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Master the fundamentals and advanced concepts</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Build real-world projects from scratch</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Get industry-ready skills and certification</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Access to exclusive resources and community</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Course Includes */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-bold text-lg text-gray-900">This course includes:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Play className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">12 hours video</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Download className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">Downloadable resources</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Infinity className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-700">Lifetime access</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Smartphone className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="text-sm text-gray-700">Mobile & TV access</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Award className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm text-gray-700">Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Headphones className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-sm text-gray-700">24/7 support</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Card */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div>
                      <p className="text-sm text-green-700 font-medium mb-2">Limited Time Offer</p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-5xl font-bold text-green-800">₹{course.price}</span>
                        <div className="text-right">
                          <p className="text-xl text-green-600 line-through">₹{Math.round(course.price * 1.5)}</p>
                          <p className="text-sm text-green-700 font-medium">33% off</p>
                        </div>
                      </div>
                      <p className="text-sm text-green-600 mt-2">One-time payment • No subscription</p>
                    </div>
                    
                    <div className="bg-white/80 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Offer expires in 2 days!</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Signals */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-xl">
                <CardContent className="p-6">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                      <BookOpen className="h-10 w-10 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-blue-900 text-xl mb-2">AlphaFly Computer Education</h3>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        No 10, K S Complex, Old Bus Stand<br />
                        Subban Chetty Street, Suppan Ragavan Colony<br />
                        NRT Nagar, Theni, Tamil Nadu 625531<br />
                        📞 080158 01689
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-200">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-900">15+</p>
                        <p className="text-xs text-blue-700">Years Experience</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-900">10K+</p>
                        <p className="text-xs text-blue-700">Students Trained</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-900">95%</p>
                        <p className="text-xs text-blue-700">Success Rate</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-blue-700 font-medium">Trusted by thousands</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form Section */}
            <div className="xl:col-span-3">
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