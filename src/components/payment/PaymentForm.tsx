import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PaymentFormProps {
  courseId: string;
  courseTitle: string;
  amount: number;
  onSuccess?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  courseId,
  courseTitle,
  amount,
  onSuccess
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: profile?.full_name || '',
    email: profile?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'IN'
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !profile) {
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          phone: billingDetails.phone,
          address: {
            line1: billingDetails.address,
            city: billingDetails.city,
            state: billingDetails.state,
            postal_code: billingDetails.postal_code,
            country: billingDetails.country,
          },
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Create payment record in database
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .insert({
          student_id: profile.id,
          course_id: courseId,
          amount: amount,
          stripe_payment_id: paymentMethod.id,
          status: 'pending'
        })
        .select()
        .single();

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update payment status to completed
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          stripe_payment_id: `pi_${Math.random().toString(36).substr(2, 9)}`
        })
        .eq('id', paymentRecord.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Create enrollment
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          student_id: profile.id,
          course_id: courseId,
          progress: 0
        });

      if (enrollmentError) {
        throw new Error(enrollmentError.message);
      }

      toast({
        title: "🎉 Payment Successful!",
        description: "You have been enrolled in the course. Redirecting to course...",
      });

      // Redirect to success page with payment details
      navigate(`/payment/success/${paymentRecord.id}`);

      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
        iconColor: '#6b7280',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: '#059669',
        iconColor: '#059669',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="space-y-6">
      {/* Course Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{courseTitle}</h3>
                <p className="text-sm text-gray-600">Digital Course Access</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₹{amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">One-time payment</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Student:</span>
              <span className="text-gray-900">{profile?.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-900">{profile?.email}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-green-600">₹{amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card className="shadow-xl border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Billing Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Billing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={billingDetails.name}
                    onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={billingDetails.email}
                    onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={billingDetails.phone}
                    onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={billingDetails.address}
                    onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })}
                    placeholder="Street address"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    City
                  </Label>
                  <Input
                    id="city"
                    value={billingDetails.city}
                    onChange={(e) => setBillingDetails({ ...billingDetails, city: e.target.value })}
                    placeholder="Theni"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    State
                  </Label>
                  <Input
                    id="state"
                    value={billingDetails.state}
                    onChange={(e) => setBillingDetails({ ...billingDetails, state: e.target.value })}
                    placeholder="Tamil Nadu"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Card Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Card Details *
              </h3>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                <CardElement options={cardElementOptions} />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your card information is encrypted and secure. We never store your card details.
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Your Payment is Secure</h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>256-bit SSL encryption protects your data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>PCI DSS compliant payment processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Your card details are never stored on our servers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              type="submit"
              disabled={!stripe || loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-3" />
                  Pay ₹{amount.toFixed(2)} Securely
                </>
              )}
            </Button>

            {/* Terms */}
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-600">
                By completing this payment, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </p>
              <p className="text-xs text-gray-500">
                You will receive an invoice via email after successful payment.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-sm font-medium text-gray-700">We accept all major payment methods</p>
            <div className="flex justify-center items-center gap-6">
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <CreditCard className="h-4 w-4 mr-2" />
                Visa
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <CreditCard className="h-4 w-4 mr-2" />
                Mastercard
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <CreditCard className="h-4 w-4 mr-2" />
                RuPay
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <Phone className="h-4 w-4 mr-2" />
                UPI
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Powered by Stripe • Industry-leading security standards
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};