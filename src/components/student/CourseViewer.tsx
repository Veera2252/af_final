import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';
import { 
  BookOpen, 
  Play, 
  FileText, 
  Download, 
  Clock,
  Award,
  CheckCircle,
  Circle,
  HelpCircle,
  ClipboardList
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type Course = Tables<'courses'>;
type CourseSection = Tables<'course_sections'>;
type CourseContent = Tables<'course_content'>;
type Quiz = Tables<'quizzes'>;
type Assignment = Tables<'assignments'>;

interface CourseData extends Course {
  sections: (CourseSection & {
    content: CourseContent[];
  })[];
  quizzes: Quiz[];
  assignments: Assignment[];
}

export const CourseViewer: React.FC = () => {
  const { id: courseId } = useParams();
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Fetch sections with content
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .select(`
          *,
          course_content (*)
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      // Fetch quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId);

      if (quizzesError) throw quizzesError;

      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId);

      if (assignmentsError) throw assignmentsError;

      // Map the data to match the expected interface
      const mappedSections = sectionsData?.map(section => ({
        ...section,
        content: section.course_content || []
      })) || [];

      setCourse({
        ...courseData,
        sections: mappedSections,
        quizzes: quizzesData || [],
        assignments: assignmentsData || []
      });

      // Expand first section by default
      if (mappedSections && mappedSections.length > 0) {
        setExpandedSections(new Set([mappedSections[0].id]));
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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Play className="h-4 w-4 text-red-500" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'text':
        return <BookOpen className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderContent = (content: CourseContent) => {
    if (!content.content) return null;

    const contentData = content.content as any;

    switch (content.content_type) {
      case 'text':
        const sanitizedHtml = DOMPurify.sanitize(contentData?.html || contentData?.text || '');
        return (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        );
      case 'video':
        return (
          <div className="aspect-video">
            <iframe
              src={contentData?.url || ''}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        );
      case 'pdf':
        return (
          <div className="text-center p-8">
            <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">PDF Document</p>
            <Button asChild>
              <a href={contentData?.url || '#'} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Open PDF
              </a>
            </Button>
          </div>
        );
      default:
        return <p>Unsupported content type</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Not Found</h3>
            <p className="text-gray-600">The requested course could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {course.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Progress value={0} className="flex-1" />
                <span className="text-sm text-gray-500">0%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course Sections */}
              {course.sections.map((section, index) => (
                <Collapsible
                  key={section.id}
                  open={expandedSections.has(section.id)}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {index + 1}. {section.title}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {section.content?.length || 0}
                        </Badge>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1">
                    {section.content?.map((content, contentIndex) => (
                      <Button
                        key={content.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedContent(content)}
                      >
                        <div className="flex items-center gap-2">
                          {getContentIcon(content.content_type)}
                          <span className="text-sm">{content.title}</span>
                        </div>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {/* Quizzes */}
              {course.quizzes.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Quizzes
                  </h4>
                  {course.quizzes.map((quiz) => (
                    <Button
                      key={quiz.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start mb-1"
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{quiz.title}</span>
                        {quiz.time_limit && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {quiz.time_limit}m
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {/* Assignments */}
              {course.assignments.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Assignments
                  </h4>
                  {course.assignments.map((assignment) => (
                    <Button
                      key={assignment.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start mb-1"
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{assignment.title}</span>
                        {assignment.due_date && (
                          <Badge variant="outline" className="text-xs">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Display */}
        <div className="lg:col-span-2">
          <Card>
            {selectedContent ? (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getContentIcon(selectedContent.content_type)}
                    {selectedContent.title}
                  </CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {selectedContent.content_type.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {renderContent(selectedContent)}
                </CardContent>
              </>
            ) : (
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to {course.title}</h3>
                <p className="text-gray-600 mb-6">Select a lesson from the navigation to get started.</p>
                {course.description && (
                  <div className="text-left max-w-2xl mx-auto">
                    <h4 className="font-medium mb-2">Course Description</h4>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
