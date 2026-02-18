import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for tokens in query params
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    // Also check URL hash (Supabase sometimes returns tokens in the fragment)
    const hash = window.location.hash || '';
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    const hashAccessToken = hashParams.get('access_token');
    const hashRefreshToken = hashParams.get('refresh_token');

    console.log('Reset password page loaded with params:', {
      queryAccess: !!accessToken,
      hashAccess: !!hashAccessToken,
      type,
    });

    // Helper to set session if we have tokens
    const setTokens = async (aToken?: string | null, rToken?: string | null) => {
      if (aToken && rToken) {
        try {
          await supabase.auth.setSession({ access_token: aToken, refresh_token: rToken });
          console.log('Session set from tokens');
          return true;
        } catch (err) {
          console.error('Failed to set session from tokens:', err);
          return false;
        }
      }
      return false;
    };

    (async () => {
      // Try query params first
      if (type === 'recovery' && accessToken) {
        const ok = await setTokens(accessToken, refreshToken);
        if (ok) return;
      }

      // If tokens are in hash fragment (common), try those
      if (hashAccessToken) {
        const ok = await setTokens(hashAccessToken, hashRefreshToken);
        if (ok) return;
      }

      // Finally, fallback to checking current supabase session (SDK may have already parsed URL)
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          console.log('Existing session found', !!data.session);
          return;
        }
      } catch (err) {
        console.error('Error checking existing session:', err);
      }

      // If we reach here, we couldn't find a usable recovery session/token
      toast({
        title: 'Invalid Reset Link',
        description: 'This password reset link is invalid or has expired.',
        variant: 'destructive',
      });
      setTimeout(() => navigate('/login'), 3000);
    })();
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully! You can now log in with your new password.",
      });
      
      // Redirect to login page after successful password reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Glassmorphism Card */}
      <Card className="w-full max-w-md mx-auto relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-black/10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-lg" />
        <CardHeader className="text-center pb-6 relative">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-primary/60 rounded-2xl text-primary-foreground px-4 py-2 font-bold text-2xl shadow-lg">
              <Lock className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <p className="text-foreground/80 font-medium">Create your new password</p>
        </CardHeader>
        
        <CardContent className="relative">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-foreground placeholder:text-foreground/50 focus:bg-white/20 transition-all pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/20 text-foreground/70 hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-foreground/60 mt-1">Minimum 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-foreground font-medium">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-foreground placeholder:text-foreground/50 focus:bg-white/20 transition-all"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 animate-spin" />
                  Updating password...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Update Password
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-sm text-foreground/70 hover:text-foreground hover:bg-white/10"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};