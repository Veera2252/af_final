import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { 
  PlayCircle, 
  FileText, 
  Image, 
  Video, 
  ArrowLeft, 
  BookOpen,
  Home,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Shield,
  GraduationCap,
  ChevronDown
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

type Course = Tables<'courses'>;
type CourseSection = Tables<'course_sections'>;
type CourseContent = Tables<'course_content'>;

export const CourseViewer: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile, signOut, canAccessAdminDashboard, canAccessStaffDashboard } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [contents, setContents] = useState<Record<string, CourseContent[]>>({});
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

      // Fetch content for each section
      const contentPromises = sectionsData?.map(async (section) => {
        const { data: contentData, error: contentError } = await supabase
          .from('course_content')
          .select('*')
          .eq('section_id', section.id)
          .order('order_index');

        if (contentError) throw contentError;
        return { sectionId: section.id, content: contentData || [] };
      }) || [];

      const contentResults = await Promise.all(contentPromises);
      const contentMap: Record<string, CourseContent[]> = {};
      contentResults.forEach(({ sectionId, content }) => {
        contentMap[sectionId] = content;
      });
      setContents(contentMap);

      // Set first content as selected
      const firstContent = contentResults[0]?.content[0];
      if (firstContent) {
        setSelectedContent(firstContent);
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const renderContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderContent = () => {
    if (!selectedContent) return <div className="text-gray-600">Select content to view</div>;

    const contentData = selectedContent.content_data as any;

    switch (selectedContent.content_type) {
      case 'video':
        return (
          <div className="space-y-4">
            <video controls className="w-full rounded-lg">
              <source src={contentData.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {contentData.description && (
              <p className="text-gray-600">{contentData.description}</p>
            )}
          </div>
        );
      case 'text':
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: contentData.html || contentData.text }} />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            <img src={contentData.url} alt={selectedContent.title} className="max-w-full rounded-lg" />
            {contentData.description && (
              <p className="text-gray-600">{contentData.description}</p>
            )}
          </div>
        );
      default:
        return <div className="text-gray-600">Unsupported content type</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
        <Button onClick={() => navigate('/courses')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white/98 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    AlphaFly
                  </span>
                  <div className="text-xs text-gray-500 font-medium -mt-1">Computer Education</div>
                </div>
              </div>
            </div>

            {/* Center - Course Title */}
            <div className="hidden md:flex items-center">
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {course.title}
              </h1>
            </div>

            {/* Right Side - User Menu */}
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {/* User Menu */}
              {profile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-3 p-2 hover:bg-gray-50/80 rounded-xl">
                      <Avatar className="h-8 w-8 ring-2 ring-gray-200">
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
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <div className="px-3 py-2">
                  <h2 className="text-lg font-semibold text-gray-900">{course.title}</h2>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          {/* Course Content Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">{course.title}</CardTitle>
                <Progress value={progress} className="w-full" />
                <span className="text-sm text-gray-500">{progress}% Complete</span>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">{section.title}</h4>
                    <div className="space-y-1 ml-4">
                      {contents[section.id]?.map((content) => (
                        <Button
                          key={content.id}
                          variant={selectedContent?.id === content.id ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => setSelectedContent(content)}
                        >
                          <div className="flex items-center space-x-2">
                            {renderContentIcon(content.content_type)}
                            <span className="text-sm">{content.title}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900">{selectedContent?.title || 'Course Content'}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};