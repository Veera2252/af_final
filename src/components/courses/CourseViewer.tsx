import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import DOMPurify from 'dompurify';
import '@/styles/course-viewer.css';

// Types

type Course = Tables<'courses'>;
type CourseSection = Tables<'course_sections'>;
type CourseContent = Tables<'course_content'>;

export const CourseViewer: React.FC = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [contents, setContents] = useState<Record<string, CourseContent[]>>({});
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

      const contentMap: Record<string, CourseContent[]> = {};
      for (const section of sectionsData || []) {
        const { data: contentData, error: contentError } = await supabase
          .from('course_content')
          .select('*')
          .eq('section_id', section.id)
          .order('order_index');

        if (contentError) throw contentError;
        contentMap[section.id] = contentData || [];
      }

      setContents(contentMap);

      if (sectionsData.length && contentMap[sectionsData[0].id]?.length) {
        setCurrentSectionIndex(0);
        setCurrentContentIndex(0);
        setSelectedContent(contentMap[sectionsData[0].id][0]);

        const totalLessons = Object.values(contentMap).reduce((acc, c) => acc + c.length, 0);
        setProgress(Math.round((1 / totalLessons) * 100));
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    let secIndex = currentSectionIndex;
    let contIndex = currentContentIndex - 1;

    if (contIndex < 0) {
      secIndex = secIndex - 1;
      if (secIndex < 0) return;
      const prevSection = sections[secIndex];
      contIndex = contents[prevSection.id]?.length - 1;
    }

    const sectionId = sections[secIndex].id;
    const content = contents[sectionId]?.[contIndex];
    if (content) {
      setCurrentSectionIndex(secIndex);
      setCurrentContentIndex(contIndex);
      setSelectedContent(content);

      const totalLessons = Object.values(contents).reduce((acc, items) => acc + items.length, 0);
      const completed = sections
        .slice(0, secIndex)
        .reduce((acc, sec) => acc + (contents[sec.id]?.length || 0), 0) + contIndex + 1;

      setProgress(Math.round((completed / totalLessons) * 100));
    }
  };

  const goToNext = () => {
    let secIndex = currentSectionIndex;
    let contIndex = currentContentIndex + 1;

    const currentSection = sections[secIndex];
    if (contIndex >= contents[currentSection.id]?.length) {
      secIndex = secIndex + 1;
      if (secIndex >= sections.length) return;
      contIndex = 0;
    }

    const sectionId = sections[secIndex].id;
    const content = contents[sectionId]?.[contIndex];
    if (content) {
      setCurrentSectionIndex(secIndex);
      setCurrentContentIndex(contIndex);
      setSelectedContent(content);

      const totalLessons = Object.values(contents).reduce((acc, items) => acc + items.length, 0);
      const completed = sections
        .slice(0, secIndex)
        .reduce((acc, sec) => acc + (contents[sec.id]?.length || 0), 0) + contIndex + 1;

      setProgress(Math.round((completed / totalLessons) * 100));
    }
  };

  const renderContent = () => {
    if (!selectedContent) return <p>Select a lesson to start learning.</p>;

    const data = selectedContent.content as any;
    switch (selectedContent.content_type) {
      case 'video':
        return (
          <div className="video-wrapper">
            <video controls src={data.url} className="video-player" />
          </div>
        );
      case 'text':
        const sanitizedHtml = DOMPurify.sanitize(data.html || data.text || '');
        return (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        );
      case 'image':
        return (
          <div className="image-wrapper">
            <img src={data.url} alt={selectedContent.title} className="rounded-lg" />
          </div>
        );
      default:
        return <p>Unsupported content type</p>;
    }
  };

  return (
    <div className="course-player-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="course-title">{course?.title}</div>
        <Progress value={progress} />
        <span className="progress-label">{progress}% completed</span>
        <Button
          variant="outline"
          className="mt-2 w-full"
          onClick={() => {
            if (profile?.role === 'admin') navigate('/admin/dashboard');
            else if (profile?.role === 'staff') navigate('/staff/dashboard');
            else navigate('/student/dashboard');
          }}
        >
          Go to Dashboard
        </Button>
        <div className="sections mt-4">
          {sections.map((section) => (
            <div key={section.id} className="section">
              <h4>{section.title}</h4>
              {contents[section.id]?.map((content) => (
                <button
                  key={content.id}
                  onClick={() => {
                    const secIndex = sections.findIndex((s) => s.id === section.id);
                    const contIndex = contents[section.id].findIndex((c) => c.id === content.id);
                    setCurrentSectionIndex(secIndex);
                    setCurrentContentIndex(contIndex);
                    setSelectedContent(content);

                    const totalLessons = Object.values(contents).reduce((acc, items) => acc + items.length, 0);
                    const completed = sections
                      .slice(0, secIndex)
                      .reduce((acc, sec) => acc + (contents[sec.id]?.length || 0), 0) + contIndex + 1;

                    setProgress(Math.round((completed / totalLessons) * 100));
                  }}
                  className={`lesson-btn ${selectedContent?.id === content.id ? 'active' : ''}`}
                >
                  {content.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="course-info">{selectedContent?.title}</div>
          <div className="actions">
            <Button variant="outline" onClick={goToPrevious}>
              Previous
            </Button>
            <Button className="complete-btn" onClick={goToNext}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete and Continue
            </Button>
          </div>
        </header>
        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};