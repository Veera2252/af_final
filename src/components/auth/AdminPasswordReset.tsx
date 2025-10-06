import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield, Key, CheckCircle, AlertTriangle } from 'lucide-react';

export const AdminPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('veeralakshmi.alphafly@gmail.com');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const { toast } = useToast();

  const handleVerifyAdmin = async () => {
    if (!email) {
      toast({
        title: "Missing Email",
        description: "Please enter the admin email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if this email exists and is an admin
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', email)
        .eq('role', 'admin')
        .single();

      if (error || !profile) {
        toast({
          title: "Admin Not Found",
          description: "No admin account found with this email address.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Admin Verified",
        description: "Admin account found. You can now reset the password.",
      });
      setStep('reset');
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify admin account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First, sign in as admin using the service role to update password
      const { data: adminProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .eq('role', 'admin')
        .single();

      if (profileError || !adminProfile) {
        throw new Error('Admin profile not found');
      }

      // Use the admin service to update password directly
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        adminProfile.id,
        { password: newPassword }
      );

      if (updateError) {
        // If admin API fails, try regular password reset
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });

        if (resetError) {
          throw resetError;
        }

        toast({
          title: "Reset Email Sent",
          description: "Password reset email sent. Check your inbox and follow the instructions.",
        });
        return;
      }

      toast({
        title: "Password Updated Successfully",
        description: "Admin password has been reset. You can now login with the new password.",
      });

      // Clear form
      setNewPassword('');
      setConfirmPassword('');
      setStep('verify');

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password. Please try the email reset option.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailReset = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Email Reset Failed",
        description: error.message || "Failed to send reset email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-red-50 to-orange-50 border-b">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Password Reset
          </CardTitle>
          <p className="text-gray-600">Emergency admin access recovery</p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {step === 'verify' ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800">Admin Access Recovery</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      This tool allows emergency password reset for admin accounts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-gray-900 font-medium">
                  Admin Email Address
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleVerifyAdmin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3"
                >
                  {loading ? (
                    <>
                      <Shield className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Verify Admin Account
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Or try email reset:</p>
                  <Button
                    variant="outline"
                    onClick={handleEmailReset}
                    disabled={loading}
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Send Password Reset Email
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Admin Verified</h3>
                    <p className="text-sm text-green-700">Set a new password for: {email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-gray-900 font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pr-10 bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-900 font-medium">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
                    minLength={6}
                  />
                </div>

                {newPassword.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Password strength:</span>
                      {newPassword.length >= 8 ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Strong</span>
                        </div>
                      ) : newPassword.length >= 6 ? (
                        <span className="text-yellow-600">Good</span>
                      ) : (
                        <span className="text-red-500">Too short</span>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3"
                >
                  {loading ? (
                    <>
                      <Shield className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Update Admin Password
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setStep('verify')}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back to Verification
                </Button>
              </div>
            </>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-blue-900 mb-2">Default Admin Credentials:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Email: veeralakshmi.alphafly@gmail.com</p>
              <p>• Default Password: admin123</p>
              <p className="text-xs text-blue-600 mt-2">
                If you can't access with these credentials, use the reset tool above.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};