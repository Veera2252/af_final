import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { InvoiceGenerator } from '@/components/payment/InvoiceGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  BookOpen, 
  Home, 
  Download,
  Mail,
  Star,
  Trophy,
  Gift
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const PaymentSuccessPage: React.FC = () => {
  const { paymentId } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentData();
    }
  }, [paymentId]);

  const fetchPaymentData = async () => {
    try {
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            thumbnail_url
          )
        `)
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;
      setPaymentData(payment);
      setCourseData(payment.courses);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Payment information not found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!paymentData || !courseData) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Found</h1>
        <Link to="/student/dashboard">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const invoiceData = {
    id: paymentData.id,
    studentName: profile?.full_name || '',
    studentEmail: profile?.email || '',
    courseTitle: courseData.title,
    amount: paymentData.amount,
    paymentDate: paymentData.created_at,
    transactionId: paymentData.stripe_payment_id || 'N/A',
    paymentMethod: 'Credit/Debit Card'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
      <div className="container mx-auto py-8 space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600">
            Welcome to your new course! You're all set to start learning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Course Access Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-600" />
                Course Enrollment Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {courseData.thumbnail_url && (
                <img 
                  src={courseData.thumbnail_url} 
                  alt={courseData.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{courseData.title}</h3>
                <div 
                  className="text-gray-600 text-sm line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: courseData.description }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-800">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">₹{paymentData.amount}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-800">Access</p>
                  <p className="text-lg font-bold text-blue-600">Lifetime</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link to={`/course/${courseData.id}`}>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Start Learning Now
                  </Button>
                </Link>
                <Link to="/student/dashboard">
                  <Button variant="outline" className="w-full">
                    <Home className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Invoice & Receipt */}
          <div className="space-y-6">
            <InvoiceGenerator 
              invoiceData={invoiceData}
              className="bg-white/90 backdrop-blur-sm border-0 shadow-xl"
            />

            {/* What's Next */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Gift className="h-5 w-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-blue-700">
                <div className="flex items-start gap-3">
                  <Star className="h-4 w-4 mt-0.5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Start Learning</p>
                    <p>Access your course content immediately and begin your learning journey.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div>
                    <p className="font-medium">Check Your Email</p>
                    <p>You'll receive a confirmation email with your invoice and course details.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="h-4 w-4 mt-0.5 text-green-500" />
                  <div>
                    <p className="font-medium">Download Resources</p>
                    <p>Access downloadable materials and resources from your course dashboard.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="pt-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our support team is here to help you succeed in your learning journey.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>📧 Email: info@alphaflyeducation.com</p>
                  <p>📞 Phone: 080158 01689</p>
                  <p>🕒 Support Hours: Mon-Sat, 9 AM - 6 PM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};