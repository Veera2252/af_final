
import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, profile } = useAuth();

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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-600">
          {profile?.role === 'admin' && 'Manage your learning platform from the admin dashboard.'}
          {profile?.role === 'staff' && 'Create and manage courses for your students.'}
          {profile?.role === 'student' && 'Continue your learning journey with our courses.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profile?.role === 'student' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Browse Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Discover new courses and expand your knowledge.</p>
                <Link to="/courses">
                  <Button className="w-full">View All Courses</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  My Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Continue with your enrolled courses.</p>
                <Link to="/my-courses">
                  <Button variant="outline" className="w-full">My Learning</Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {(profile?.role === 'admin' || profile?.role === 'staff') && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Manage Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Create and edit courses for your students.</p>
                <Link to="/admin/courses">
                  <Button className="w-full">Course Management</Button>
                </Link>
              </CardContent>
            </Card>

            {profile?.role === 'admin' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Add and manage system users.</p>
                    <Link to="/admin/users">
                      <Button variant="outline" className="w-full">Manage Users</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">View system statistics and analytics.</p>
                    <Link to="/admin/dashboard">
                      <Button variant="outline" className="w-full">View Dashboard</Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
