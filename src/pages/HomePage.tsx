
import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect authenticated users to their appropriate dashboard
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (profile.role === 'staff') {
        navigate('/staff/dashboard');
      } else if (profile.role === 'student') {
        navigate('/student/dashboard');
      }
    }
  }, [user, profile, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to CourseHive LMS
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your complete learning management solution
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="flex items-center p-6">
                    <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold">Course Management</h3>
                      <p className="text-sm text-gray-600">Create & manage courses</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-6">
                    <Users className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="font-semibold">User Management</h3>
                      <p className="text-sm text-gray-600">Manage students & staff</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-6">
                    <Award className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <h3 className="font-semibold">Assessments</h3>
                      <p className="text-sm text-gray-600">Quizzes & assignments</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-6">
                    <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
                    <div>
                      <h3 className="font-semibold">Analytics</h3>
                      <p className="text-sm text-gray-600">Track progress & performance</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-center">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This will only render briefly before redirect
  return (
    <div className="container mx-auto py-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to your dashboard...</h1>
      </div>
    </div>
  );
};
