
import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Users, BarChart3, CreditCard, Home } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user || !profile) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                CourseHive LMS
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              CourseHive LMS
            </Link>
            
            {/* Dashboard Link */}
            <Link 
              to={
                profile.role === 'admin' ? '/admin/dashboard' :
                profile.role === 'staff' ? '/staff/dashboard' :
                '/student/dashboard'
              } 
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            {profile.role === 'student' && (
              <>
                <Link to="/courses" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
                  <BookOpen className="h-4 w-4" />
                  <span>Browse Courses</span>
                </Link>
                <Link to="/student/dashboard" className="text-gray-700 hover:text-gray-900">
                  My Learning
                </Link>
              </>
            )}
            
            {(profile.role === 'admin' || profile.role === 'staff') && (
              <>
                <Link to="/admin/courses" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
                  <BookOpen className="h-4 w-4" />
                  <span>Manage Courses</span>
                </Link>
                {profile.role === 'admin' && (
                  <>
                    <Link to="/admin/users" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </Link>
                    <Link to="/admin/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
                      <BarChart3 className="h-4 w-4" />
                      <span>Analytics</span>
                    </Link>
                    <Link to="/admin/payments" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
                      <CreditCard className="h-4 w-4" />
                      <span>Payments</span>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {profile.full_name} ({profile.role})
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
