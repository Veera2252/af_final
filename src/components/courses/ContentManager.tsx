import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ContentEditor } from './ContentEditor';
import { 
  Plus, 
  Trash2, 
  Edit, 
  FileText, 
  Video, 
  Image, 
  File,
  GripVertical,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type CourseSection = Tables<'course_sections'>;
type CourseContent = Tables<'course_content'>;

interface ContentManagerProps {
  courseId: string;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ courseId }) => {
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [contents, setContents] = useState<Record<string, CourseContent[]>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSections();
  }, [courseId]);

  const fetchSections = async () => {
    try {
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

      // Expand first section by default
      if (sectionsData && sectionsData.length > 0) {
        setExpandedSections(new Set([sectionsData[0].id]));
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddSection = async () => {
    const newSectionTitle = prompt('Enter section title:');
    if (!newSectionTitle) return;

    setLoading(true);
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
      setExpandedSections(prev => new Set([...prev, data.id]));
      
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
    } finally {
      setLoading(false);
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

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'image':  
        return <Image className="h-4 w-4 text-green-500" />;
      case 'pdf':
        return <File className="h-4 w-4 text-blue-500" />;
      case 'text':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getContentTypeBadge = (contentType: string) => {
    const variants = {
      video: 'destructive',
      image: 'default',
      pdf: 'secondary',
      text: 'outline'
    } as const;
    
    return variants[contentType as keyof typeof variants] || 'outline';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Course Content & Structure
            </CardTitle>
            <Button onClick={handleAddSection} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Sections */}
      {sections.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sections Yet</h3>
            <p className="text-gray-600 mb-6">Start organizing your course by adding sections.</p>
            <Button onClick={handleAddSection} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={section.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Collapsible 
                open={expandedSections.has(section.id)} 
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {expandedSections.has(section.id) ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {index + 1}. {section.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {contents[section.id]?.length || 0} content items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ContentEditor
                          sectionId={section.id}
                          onContentAdded={() => fetchSections()}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(section.id);
                          }}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {contents[section.id]?.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">No content added yet</p>
                        <ContentEditor
                          sectionId={section.id}
                          onContentAdded={() => fetchSections()}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contents[section.id]?.map((content, contentIndex) => (
                          <div
                            key={content.id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-500 min-w-[2rem]">
                                  {contentIndex + 1}.
                                </span>
                              </div>
                              {getContentIcon(content.content_type)}
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{content.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={getContentTypeBadge(content.content_type)} className="text-xs">
                                    {content.content_type.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    Added {new Date(content.created_at!).toLocaleDateString()}
                                  </span>
                                </div>
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
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteContent(content.id, section.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};