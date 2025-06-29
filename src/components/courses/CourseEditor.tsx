import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { ContentManager } from './ContentManager';
import { AssignmentManager } from '@/components/assessments/AssignmentManager';
import { QuizManager } from '@/components/assessments/QuizManager';
import { 
  Save, 
  Eye, 
  Upload, 
  BookOpen, 
  FileText, 
  Award, 
  Settings,
  ArrowLeft,
  Globe,
  Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

type Course = Tables<'courses'>;

export const CourseEditor: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: 0,
    thumbnail_url: '',
    is_published: false
  });

  useEffect(() => {
    if (courseId && courseId !== 'new') {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    if (!courseId || courseId === 'new') return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
      setCourseData({
        title: data.title,
        description: data.description || '',
        price: data.price,
        thumbnail_url: data.thumbnail_url || '',
        is_published: data.is_published || false
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveCourse = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      if (courseId === 'new') {
        const { data, error } = await supabase
          .from('courses')
          .insert([{
            title: courseData.title,
            description: courseData.description,
            price: courseData.price,
            thumbnail_url: courseData.thumbnail_url,
            created_by: profile.id,
            is_published: courseData.is_published
          }])
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Course created successfully!",
        });
        
        navigate(`/admin/courses/${data.id}`);
      } else {
        const { error } = await supabase
          .from('courses')
          .update({
            title: courseData.title,
            description: courseData.description,
            price: courseData.price,
            thumbnail_url: courseData.thumbnail_url,
            is_published: courseData.is_published
          })
          .eq('id', courseId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Course updated successfully!",
        });
        
        fetchCourse();
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

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload to a storage service
      // For now, we'll use a placeholder URL
      const url = URL.createObjectURL(file);
      setCourseData({ ...courseData, thumbnail_url: url });
      toast({
        title: "Info",
        description: "Thumbnail uploaded (demo mode - implement file storage)",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/courses')}
              className="hover:bg-white/50 text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {courseId === 'new' ? 'Create New Course' : 'Edit Course'}
              </h1>
              {course && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={course.is_published ? "default" : "secondary"}>
                    {course.is_published ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Published
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Draft
                      </>
                    )}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Created {new Date(course.created_at!).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveCourse} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Course'}
            </Button>
            {courseId !== 'new' && (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/course/${courseId}/preview`)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2" disabled={courseId === 'new'}>
              <FileText className="h-4 w-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2" disabled={courseId === 'new'}>
              <Award className="h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Course Details */}
          <TabsContent value="details">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BookOpen className="h-5 w-5" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium text-gray-900">Course Title *</Label>
                      <Input
                        id="title"
                        value={courseData.title}
                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                        placeholder="Enter an engaging course title"
                        className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price" className="text-sm font-medium text-gray-900">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={courseData.price}
                        onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="thumbnail" className="text-sm font-medium text-gray-900">Course Thumbnail</Label>
                      <div className="mt-1 space-y-2">
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-white border-gray-300"
                        />
                        {courseData.thumbnail_url && (
                          <img 
                            src={courseData.thumbnail_url} 
                            alt="Course thumbnail" 
                            className="w-32 h-20 object-cover rounded-lg border"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-900">Course Description</Label>
                    <RichTextEditor
                      content={courseData.description}
                      onChange={(content) => setCourseData({ ...courseData, description: content })}
                      placeholder="Describe what students will learn in this course..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Content */}
          <TabsContent value="content">
            {courseId === 'new' ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Course First</h3>
                  <p className="text-gray-600 mb-6">Please save the course details before adding content.</p>
                  <Button onClick={handleSaveCourse} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ContentManager courseId={courseId!} />
            )}
          </TabsContent>

          {/* Assignments */}
          <TabsContent value="assignments">
            {courseId === 'new' ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Course First</h3>
                  <p className="text-gray-600">Please save the course before adding assignments.</p>
                </CardContent>
              </Card>
            ) : (
              <AssignmentManager />
            )}
          </TabsContent>

          {/* Quizzes */}
          <TabsContent value="quizzes">
            {courseId === 'new' ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Course First</h3>
                  <p className="text-gray-600">Please save the course before adding quizzes.</p>
                </CardContent>
              </Card>
            ) : (
              <QuizManager />
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Settings className="h-5 w-5" />
                  Course Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Publish Course</h3>
                    <p className="text-sm text-gray-600">Make this course visible to students</p>
                  </div>
                  <Switch
                    checked={courseData.is_published}
                    onCheckedChange={(checked) => setCourseData({ ...courseData, is_published: checked })}
                  />
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-medium text-amber-800 mb-2">Publishing Guidelines</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Ensure course has a clear title and description</li>
                    <li>• Add at least one section with content</li>
                    <li>• Set appropriate pricing</li>
                    <li>• Upload a course thumbnail</li>
                    <li>• Review all content for accuracy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};