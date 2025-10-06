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

  const handleEditCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setShowCreateCourse(true);
      setActiveTab('create-course');
    }
  };

  const handleBackToCourses = () => {
    setShowCreateCourse(false);
    setSelectedCourse(null);
    setActiveTab('courses');
    fetchCourses();
  };

  const handlePreviewCourse = (courseId: string) => {
    // Open course preview in a new tab
    window.open(`/courses/${courseId}`, '_blank');
  };

  const handleManageQuizzes = (courseId: string) => {
    // Set the selected course and switch to quizzes tab
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setActiveTab('quizzes');
    }
  };

  const handleManageAssignments = (courseId: string) => {
    // Set the selected course and switch to assignments tab
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setActiveTab('assignments');
    }
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

          <TabsContent value="courses" className="space-y-6">
            {/* Recent Courses Section */}
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    Recent Courses
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No courses created yet.</p>
                    <Button 
                      onClick={handleCreateNewCourse}
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      Create Your First Course
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course: any) => (
                      <div key={course.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{course.title}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              course.is_published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {course.is_published ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-sm text-gray-600">₹{course.price}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => handleEditCourse(course.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => handlePreviewCourse(course.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => handleManageQuizzes(course.id)}
                          >
                            Quiz
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-orange-200 text-orange-700 hover:bg-orange-50"
                            onClick={() => handleManageAssignments(course.id)}
                          >
                            Assignment
                          </Button>
                        </div>
                      </div>
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
                <div>
                  {selectedCourse ? (
                    <QuizManager courseId={selectedCourse.id} />
                  ) : (
                    <div className="text-center py-8">
                      <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Please select a course to manage quizzes.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div>
                  {selectedCourse ? (
                    <AssignmentManager />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Please select a course to manage assignments.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};