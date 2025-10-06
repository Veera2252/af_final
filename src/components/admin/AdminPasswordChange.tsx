import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Lock, Shield, CheckCircle } from 'lucide-react';

export const AdminPasswordChange: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
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
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast({
        title: "Same Password",
        description: "New password must be different from current password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First verify the current password by attempting to sign in with it
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        throw new Error('User not found');
      }

      // Re-authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: "Password Updated",
        description: "Your admin password has been successfully changed.",
      });

    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <Lock className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Change Admin Password</h3>
          <p className="text-sm text-gray-600">Update your admin account password for security</p>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-4">
        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor="current-password" className="text-gray-900 font-medium">
            Current Password
          </Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showPasswords.current ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="pr-10 bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-gray-900 font-medium">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPasswords.new ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              className="pr-10 bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
              required
              minLength={6}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500">Minimum 6 characters required</p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-gray-900 font-medium">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showPasswords.confirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="pr-10 bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
              required
              minLength={6}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Password Strength Indicator */}
        {newPassword.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Password strength:</span>
              {newPassword.length >= 6 ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Good</span>
                </div>
              ) : (
                <span className="text-red-500">Too short</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  newPassword.length >= 8 
                    ? 'bg-green-500 w-full' 
                    : newPassword.length >= 6 
                    ? 'bg-yellow-500 w-2/3' 
                    : 'bg-red-500 w-1/3'
                }`}
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={loading}
        >
          {loading ? (
            <>
              <Shield className="mr-2 h-4 w-4 animate-spin" />
              Updating Password...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Update Admin Password
            </>
          )}
        </Button>
      </form>

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-blue-900 mb-2">Security Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use a password that's at least 8 characters long</li>
          <li>• Include uppercase and lowercase letters, numbers, and symbols</li>
          <li>• Don't use personal information or common words</li>
          <li>• Consider using a password manager</li>
          <li>• Change your password regularly</li>
        </ul>
      </div>
    </div>
  );
};