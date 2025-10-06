import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Save, 
  Trash2, 
  BookOpen, 
  Video, 
  FileText,
  Edit3
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  order_index: number;
  content?: Content[];
}

interface Content {
  id: string;
  title: string;
  content_type: 'text' | 'video' | 'pdf';
  content_data: any;
  order_index: number;
}

export const ContentManager: React.FC = () => {
  const { courseId } = useParams();
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentType, setNewContentType] = useState<'text' | 'video' | 'pdf'>('text');
  const [contentData, setContentData] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchSections();
    }
  }, [courseId]);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .select(`
          *,
          course_content (*)
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      setSections(data || []);
      if (data && data.length > 0) {
        setSelectedSection(data[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createSection = async () => {
    if (!newSectionTitle.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .insert([{
          title: newSectionTitle,
          course_id: courseId,
          order_index: sections.length
        }])
        .select()
        .single();

      if (error) throw error;
      
      setSections([...sections, data]);
      setNewSectionTitle('');
      toast({
        title: "Success",
        description: "Section created successfully!",
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

  const createContent = async () => {
    if (!newContentTitle.trim() || !selectedSection) return;

    setLoading(true);
    try {
      let content_data_obj = {};
      
      if (newContentType === 'text') {
        content_data_obj = { html: contentData };
      } else if (newContentType === 'video') {
        content_data_obj = { url: contentData };
      } else if (newContentType === 'pdf') {
        content_data_obj = { url: contentData };
      }

      const { data, error } = await supabase
        .from('course_content')
        .insert({
          title: newContentTitle,
          content_type: newContentType,
          content_data: content_data_obj,
          section_id: selectedSection.id,
          order_index: selectedSection.content?.length || 0
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchSections();
      setNewContentTitle('');
      setContentData('');
      toast({
        title: "Success",
        description: "Content created successfully!",
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

  const deleteSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('course_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      
      setSections(sections.filter(s => s.id !== sectionId));
      if (selectedSection?.id === sectionId) {
        setSelectedSection(sections[0] || null);
      }
      
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Content Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sections List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Section title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
              />
              <Button onClick={createSection} disabled={loading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSection?.id === section.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSection(section)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{section.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {section.content?.length || 0} items
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Management */}
        <div className="lg:col-span-2">
          {selectedSection ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  {selectedSection.title} - Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Content */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Add New Content</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Content Title</Label>
                      <Input
                        placeholder="Enter content title"
                        value={newContentTitle}
                        onChange={(e) => setNewContentTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Content Type</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={newContentType}
                        onChange={(e) => setNewContentType(e.target.value as any)}
                      >
                        <option value="text">Text/Lesson</option>
                        <option value="video">Video</option>
                        <option value="pdf">PDF Document</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>
                      {newContentType === 'text' && 'Lesson Content'}
                      {newContentType === 'video' && 'Video URL'}
                      {newContentType === 'pdf' && 'PDF URL'}
                    </Label>
                    {newContentType === 'text' ? (
                      <RichTextEditor
                        content={contentData}
                        onChange={setContentData}
                        placeholder="Write your lesson content here..."
                      />
                    ) : (
                      <Input
                        placeholder={
                          newContentType === 'video' 
                            ? 'Enter video URL' 
                            : 'Enter PDF URL'
                        }
                        value={contentData}
                        onChange={(e) => setContentData(e.target.value)}
                      />
                    )}
                  </div>

                  <Button onClick={createContent} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content
                  </Button>
                </div>

                {/* Existing Content */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Existing Content</h3>
                  {selectedSection.content && selectedSection.content.length > 0 ? (
                    selectedSection.content.map((content) => (
                      <div key={content.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{content.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {content.content_type === 'text' && <FileText className="h-4 w-4" />}
                              {content.content_type === 'video' && <Video className="h-4 w-4" />}
                              {content.content_type === 'pdf' && <FileText className="h-4 w-4" />}
                              <span className="capitalize">{content.content_type}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No content added yet. Create your first content item above.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Section Selected</h3>
                <p className="text-gray-600">
                  Create a section first, then select it to manage content.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};