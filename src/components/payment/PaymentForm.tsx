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
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

      // In a real implementation, you would call your backend to create a payment intent
      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

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
        title: "Payment Successful!",
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
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Course Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Course Enrollment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Course:</span>
              <span className="text-gray-700">{courseTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount:</span>
              <span className="text-2xl font-bold text-green-600">₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Student:</span>
              <span className="text-gray-700">{profile?.full_name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Billing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={billingDetails.name}
                  onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={billingDetails.email}
                  onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={billingDetails.phone}
                  onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={billingDetails.address}
                  onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={billingDetails.city}
                  onChange={(e) => setBillingDetails({ ...billingDetails, city: e.target.value })}
                  placeholder="Theni"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={billingDetails.state}
                  onChange={(e) => setBillingDetails({ ...billingDetails, state: e.target.value })}
                  placeholder="Tamil Nadu"
                />
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-4">
              <Label>Card Details *</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Secure Payment</p>
                <p className="text-green-700">Your payment information is encrypted and secure. We use industry-standard SSL encryption.</p>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              type="submit"
              disabled={!stripe || loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Pay ₹{amount.toFixed(2)}
                </>
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-gray-600 text-center">
              By completing this payment, you agree to our Terms of Service and Privacy Policy.
              You will receive an invoice via email after successful payment.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">We accept</p>
            <div className="flex justify-center items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">Visa</Badge>
              <Badge variant="outline" className="px-3 py-1">Mastercard</Badge>
              <Badge variant="outline" className="px-3 py-1">RuPay</Badge>
              <Badge variant="outline" className="px-3 py-1">UPI</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};