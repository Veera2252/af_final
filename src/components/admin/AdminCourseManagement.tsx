
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CourseEditor } from '@/components/courses/CourseEditor';
import { QuizManager } from '@/components/staff/QuizManager';
import { AssignmentManager } from '@/components/staff/AssignmentManager';
import { 
  Plus, 
  Edit, 
  Eye, 
  Settings,
  BookOpen,
  DollarSign,
  Users,
  HelpCircle,
  FileText,
  ArrowLeft
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
  is_published: boolean;
  thumbnail_url?: string;
  created_at: string;
}

export const AdminCourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setCourses(data || []);
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

  const handleCreateNewCourse = () => {
    setShowCreateCourse(true);
    setActiveTab('create-course');
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowCreateCourse(true);
    setActiveTab('create-course');
  };

  const handleBackToCourses = () => {
    setShowCreateCourse(false);
    setSelectedCourse(null);
    setActiveTab('courses');
    fetchCourses();
  };

  const togglePublishStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !currentStatus })
        .eq('id', courseId);

      if (error) throw error;

      setCourses(courses.map(course => 
        course.id === courseId 
          ? { ...course, is_published: !currentStatus }
          : course
      ));

      toast({
        title: "Success",
        description: `Course ${!currentStatus ? 'published' : 'unpublished'} successfully!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Course Management
              </h1>
            </div>
            <div className="flex gap-2">
              {activeTab !== 'courses' && (
                <Button variant="outline" onClick={handleBackToCourses}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Courses
                </Button>
              )}
              {activeTab === 'courses' && (
                <Button 
                  onClick={handleCreateNewCourse}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Course
                </Button>
              )}
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="create-course" className="flex items-center gap-2" disabled={!showCreateCourse}>
              <Plus className="h-4 w-4" />
              {selectedCourse ? 'Edit Course' : 'Create Course'}
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {/* Recent Courses Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BookOpen className="h-5 w-5" />
                  Recent Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first course to get started with your learning platform.
                    </p>
                    <Button onClick={handleCreateNewCourse}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Course
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <Card key={course.id} className="hover:shadow-lg transition-shadow bg-white">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                            <div className="flex gap-1">
                              <Badge variant={course.is_published ? "default" : "secondary"}>
                                {course.is_published ? 'Published' : 'Draft'}
                              </Badge>
                              <Badge variant={course.is_free ? "outline" : "default"}>
                                {course.is_free ? 'Free' : `$${course.price}`}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-600 line-clamp-3">
                            {course.description || 'No description available'}
                          </p>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <DollarSign className="h-4 w-4" />
                            <span>{course.is_free ? 'Free Course' : `$${course.price}`}</span>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/courses/${course.id}/content`)}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Content
                            </Button>

                            <Button
                              variant={course.is_published ? "destructive" : "default"}
                              size="sm"
                              onClick={() => togglePublishStatus(course.id, course.is_published)}
                            >
                              {course.is_published ? 'Unpublish' : 'Publish'}
                            </Button>
                          </div>

                          <div className="text-xs text-gray-500">
                            Created {new Date(course.created_at).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-course">
            <CourseEditor
              courseId={selectedCourse?.id || 'new'}
              onSave={handleBackToCourses}
            />
          </TabsContent>

          <TabsContent value="quizzes">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <QuizManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <AssignmentManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
