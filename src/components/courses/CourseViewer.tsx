
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { PlayCircle, FileText, Image, Video } from 'lucide-react';

type Course = Tables<'courses'>;
type CourseSection = Tables<'course_sections'>;
type CourseContent = Tables<'course_content'>;

export const CourseViewer: React.FC = () => {
  const { courseId } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [contents, setContents] = useState<Record<string, CourseContent[]>>({});
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

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
    if (!selectedContent) return <div>Select content to view</div>;

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
        return <div>Unsupported content type</div>;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-center py-8">Course not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Course Content Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <Progress value={progress} className="w-full" />
              <span className="text-sm text-gray-500">{progress}% Complete</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <h4 className="font-medium text-sm">{section.title}</h4>
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
          <Card>
            <CardHeader>
              <CardTitle>{selectedContent?.title || 'Course Content'}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
