
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  Award, 
  Settings,
  MessageSquare
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage your learning platform</p>
        </div>

        {/* Navigation */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => navigate('/admin/users')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Users className="h-4 w-4 mr-2" />
                User Management
              </Button>
              <Button 
                onClick={() => navigate('/admin/courses')}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Course Management
              </Button>
              <Button 
                onClick={() => navigate('/admin/payments')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Management
              </Button>
              <Button 
                onClick={() => navigate('/admin/certificates')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                <Award className="h-4 w-4 mr-2" />
                Certificate Management
              </Button>
              <Button 
                onClick={() => navigate('/admin/inquiries')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Inquiries
              </Button>
              <Button 
                onClick={() => navigate('/admin/settings')}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Create AdminLayout component
export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-8">
        {children}
      </div>
    </div>
  );
};

// Create AdminSettings component
export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">System Settings</h2>
          <p className="text-gray-600">Configure your platform settings here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
