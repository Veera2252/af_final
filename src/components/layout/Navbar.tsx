import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  BookOpen, 
  Users, 
  BarChart3, 
  CreditCard, 
  Home,
  Crown,
  Shield,
  GraduationCap,
  Menu,
  X,
  Bell,
  Search,
  Settings,
  ChevronDown,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar: React.FC = () => {
  const { user, profile, signOut, canAccessAdminDashboard, canAccessStaffDashboard, canAccessStudentDashboard } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'staff':
        return <Shield className="h-4 w-4" />;
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-red-500 to-red-600';
      case 'staff':
        return 'from-blue-500 to-blue-600';
      case 'student':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user || !profile) {
    return (
      <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    AlphaFly
                  </span>
                  <div className="text-xs text-gray-500 font-medium">Computer Education</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navigationItems = [
    // Dashboard links based on user permissions
    {
      label: 'Dashboard',
      path: profile.role === 'admin' ? '/admin/dashboard' : 
            profile.role === 'staff' ? '/staff/dashboard' : '/student/dashboard',
      icon: Home,
      show: true
    },
    {
      label: 'Courses',
      path: canAccessAdminDashboard || canAccessStaffDashboard ? '/admin/courses' : '/courses',
      icon: BookOpen,
      show: true
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: Users,
      show: canAccessAdminDashboard
    },
    {
      label: 'Payments',
      path: '/admin/payments',
      icon: CreditCard,
      show: canAccessAdminDashboard
    },
    {
      label: 'Analytics',
      path: '/admin/analytics',
      icon: BarChart3,
      show: canAccessAdminDashboard
    }
  ];

  const visibleNavItems = navigationItems.filter(item => item.show);

  return (
    <nav className="bg-white/98 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AlphaFly
                </span>
                <div className="text-sm text-gray-500 font-medium -mt-1">Computer Education</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-200/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Search, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search courses, users..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Quick Actions */}
            {(canAccessAdminDashboard || canAccessStaffDashboard) && (
              <Link to="/admin/courses/new">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  New Course
                </Button>
              </Link>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover:bg-gray-50/80 rounded-xl">
              <Bell className="h-5 w-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-500 border-2 border-white">
                3
              </Badge>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm" className="hover:bg-gray-50/80 rounded-xl">
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2 hover:bg-gray-50/80 rounded-xl">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-200">
                    <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(profile.role)} text-white font-semibold text-sm`}>
                      {profile.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{profile.full_name}</span>
                      {getRoleIcon(profile.role)}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{profile.role}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-xl rounded-xl">
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(profile.role)} text-white font-semibold`}>
                          {profile.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">{profile.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(profile.role)}
                        <span className="capitalize">{profile.role}</span>
                      </div>
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Dashboard Access */}
                <DropdownMenuItem className="cursor-pointer p-3" onClick={() => navigate(
                  profile.role === 'admin' ? '/admin/dashboard' : 
                  profile.role === 'staff' ? '/staff/dashboard' : '/student/dashboard'
                )}>
                  <Home className="mr-3 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer p-3">
                  <Users className="mr-3 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                
                {(profile.role === 'student' || canAccessStudentDashboard) && (
                  <DropdownMenuItem className="cursor-pointer p-3" onClick={() => navigate('/student/payments')}>
                    <CreditCard className="mr-3 h-4 w-4" />
                    <span>Payment History</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem className="cursor-pointer p-3">
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600 p-3">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};