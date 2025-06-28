
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
import { ContentEditor } from './ContentEditor';
import { Plus, Save, Trash2, Edit, FileText, Video, Image, BookOpen } from 'lucide-react';

type Course = Tables<'courses'>;
type CourseSection = Tables<'course_sections'>;
type CourseContent = Tables<'course_content'>;

export const CourseEditor: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [contents, setContents] = useState<Record<string, CourseContent[]>>({});
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: 0
  });

  useEffect(() => {
    if (courseId && courseId !== 'new') {
      fetchCourse();
      fetchSections();
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
        price: data.price
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchSections = async () => {
    if (!courseId || courseId === 'new') return;

    try {
      const { data, error } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      setSections(data || []);

      // Fetch content for each section
      const contentPromises = data?.map(async (section) => {
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
            created_by: profile.id
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
            price: courseData.price
          })
          .eq('id', courseId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Course updated successfully!",
        });
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

  const handleAddSection = async () => {
    if (!courseId || courseId === 'new') {
      toast({
        title: "Error",
        description: "Please save the course first before adding sections.",
        variant: "destructive",
      });
      return;
    }

    const newSectionTitle = prompt('Enter section title:');
    if (!newSectionTitle) return;

    try {
      const { data, error } = await supabase
        .from('course_sections')
        .insert([{
          course_id: courseId,
          title: newSectionTitle,
          order_index: sections.length
        }])
        .select()
        .single();

      if (error) throw error;
      
      setSections([...sections, data]);
      setContents({ ...contents, [data.id]: [] });
      toast({
        title: "Success",
        description: "Section added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section and all its content?')) return;

    try {
      const { error } = await supabase
        .from('course_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      
      setSections(sections.filter(s => s.id !== sectionId));
      const newContents = { ...contents };
      delete newContents[sectionId];
      setContents(newContents);
      
      toast({
        title: "Success",
        description: "Section deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async (contentId: string, sectionId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('course_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      
      const updatedContent = contents[sectionId].filter(c => c.id !== contentId);
      setContents({ ...contents, [sectionId]: updatedContent });
      
      toast({
        title: "Success",
        description: "Content deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePublishCourse = async () => {
    if (!courseId || courseId === 'new') return;

    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: true })
        .eq('id', courseId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Course published successfully!",
      });
      
      fetchCourse();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':  
        return <Image className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {courseId === 'new' ? 'Create New Course' : 'Edit Course'}
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleSaveCourse} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Course
          </Button>
          {course && !course.is_published && (
            <Button onClick={handlePublishCourse} variant="outline">
              Publish Course
            </Button>
          )}
          {courseId !== 'new' && (
            <>
              <Button 
                onClick={() => navigate(`/admin/courses/${courseId}/quizzes`)} 
                variant="outline"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Quizzes
              </Button>
              <Button 
                onClick={() => navigate(`/admin/courses/${courseId}/assignments`)} 
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Manage Assignments
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="content">Content & Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={courseData.price}
                  onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Course Sections & Content</CardTitle>
                <Button onClick={handleAddSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No sections yet. Add a section to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {sections.map((section, index) => (
                    <Card key={section.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-lg">
                            {index + 1}. {section.title}
                          </h3>
                          <div className="flex gap-2">
                            <ContentEditor
                              sectionId={section.id}
                              onContentAdded={() => fetchSections()}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSection(section.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {contents[section.id]?.length === 0 ? (
                          <p className="text-gray-500 text-sm">No content added yet</p>
                        ) : (
                          <div className="space-y-2">
                            {contents[section.id]?.map((content, contentIndex) => (
                              <div
                                key={content.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  {getContentIcon(content.content_type)}
                                  <div>
                                    <p className="font-medium text-sm">{content.title}</p>
                                    <p className="text-xs text-gray-500 capitalize">
                                      {content.content_type}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <ContentEditor
                                    sectionId={section.id}
                                    onContentAdded={() => fetchSections()}
                                    existingContent={content}
                                    isEdit={true}
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteContent(content.id, section.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
