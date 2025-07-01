
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  Folder,
  Upload,
  BookOpen,
  HelpCircle,
  ClipboardList,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type CourseSection = Tables<'course_sections'>;
type CourseContent = Tables<'course_content'>;

interface ContentManagerProps {
  courseId: string;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ courseId }) => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [contents, setContents] = useState<Record<string, CourseContent[]>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddContent, setShowAddContent] = useState<string | null>(null);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'text' as 'text' | 'video' | 'pdf',
    textContent: '',
    fileUrl: '',
    videoUrl: ''
  });
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    time_limit: 30,
    max_attempts: 1
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    due_date: '',
    max_points: 100
  });
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchSections();
    }
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
    if (!newSectionTitle.trim()) return;

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
      setNewSectionTitle('');
      setShowAddSection(false);
      
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

  const handleAddContent = async (sectionId: string) => {
    if (!contentForm.title.trim()) return;

    setLoading(true);
    try {
      let content_data_obj = {};
      
      if (contentForm.type === 'text') {
        content_data_obj = { html: contentForm.textContent };
      } else if (contentForm.type === 'video') {
        content_data_obj = { url: contentForm.videoUrl };
      } else if (contentForm.type === 'pdf') {
        content_data_obj = { url: contentForm.fileUrl };
      }

      const { data, error } = await supabase
        .from('course_content')
        .insert({
          title: contentForm.title,
          content_type: contentForm.type,
          content_data: content_data_obj,
          section_id: sectionId,
          order_index: contents[sectionId]?.length || 0
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchSections();
      setContentForm({
        title: '',
        type: 'text',
        textContent: '',
        fileUrl: '',
        videoUrl: ''
      });
      setShowAddContent(null);
      
      toast({
        title: "Success",
        description: "Content added successfully!",
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload to a storage service
      const url = URL.createObjectURL(file);
      setContentForm({ ...contentForm, fileUrl: url });
      toast({
        title: "File Selected",
        description: `${file.name} selected (demo mode - implement file storage)`,
      });
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.title.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([{
          course_id: courseId,
          title: quizForm.title,
          description: quizForm.description,
          time_limit: quizForm.time_limit,
          max_attempts: quizForm.max_attempts
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Quiz created successfully!",
      });

      setQuizForm({
        title: '',
        description: '',
        time_limit: 30,
        max_attempts: 1
      });
      setShowCreateQuiz(false);
      
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

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([{
          course_id: courseId,
          title: assignmentForm.title,
          description: assignmentForm.description,
          due_date: assignmentForm.due_date || null,
          max_points: assignmentForm.max_points
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Assignment created successfully!",
      });

      setAssignmentForm({
        title: '',
        description: '',
        due_date: '',
        max_points: 100
      });
      setShowCreateAssignment(false);
      
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

  const handleBackToCourses = () => {
    navigate('/admin/courses');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBackToCourses}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Course Content & Structure
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Section</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sectionTitle">Section Title</Label>
                      <Input
                        id="sectionTitle"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="Enter section title"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowAddSection(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddSection} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Section
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showCreateQuiz} onOpenChange={setShowCreateQuiz}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Create Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Quiz</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="quizTitle">Quiz Title</Label>
                      <Input
                        id="quizTitle"
                        value={quizForm.title}
                        onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                        placeholder="Enter quiz title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quizDescription">Description</Label>
                      <Textarea
                        id="quizDescription"
                        value={quizForm.description}
                        onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                        placeholder="Enter quiz description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                        <Input
                          id="timeLimit"
                          type="number"
                          value={quizForm.time_limit}
                          onChange={(e) => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) || 30 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxAttempts">Max Attempts</Label>
                        <Input
                          id="maxAttempts"
                          type="number"
                          value={quizForm.max_attempts}
                          onChange={(e) => setQuizForm({ ...quizForm, max_attempts: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowCreateQuiz(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateQuiz} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Create Quiz
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showCreateAssignment} onOpenChange={setShowCreateAssignment}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="assignmentTitle">Assignment Title</Label>
                      <Input
                        id="assignmentTitle"
                        value={assignmentForm.title}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                        placeholder="Enter assignment title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="assignmentDescription">Description</Label>
                      <RichTextEditor
                        content={assignmentForm.description}
                        onChange={(content) => setAssignmentForm({ ...assignmentForm, description: content })}
                        placeholder="Enter assignment description"
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="datetime-local"
                          value={assignmentForm.due_date}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxPoints">Max Points</Label>
                        <Input
                          id="maxPoints"
                          type="number"
                          value={assignmentForm.max_points}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, max_points: parseInt(e.target.value) || 100 })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowCreateAssignment(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateAssignment} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Create Assignment
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
            <Button onClick={() => setShowAddSection(true)}>
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
                        <Dialog open={showAddContent === section.id} onOpenChange={(open) => setShowAddContent(open ? section.id : null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add Content to {section.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="contentTitle">Content Title</Label>
                                  <Input
                                    id="contentTitle"
                                    value={contentForm.title}
                                    onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                                    placeholder="Enter content title"
                                  />
                                </div>
                                <div>
                                  <Label>Content Type</Label>
                                  <Select value={contentForm.type} onValueChange={(value: any) => setContentForm({ ...contentForm, type: value })}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4" />
                                          Text/Lesson
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="video">
                                        <div className="flex items-center gap-2">
                                          <Video className="h-4 w-4" />
                                          Video
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="pdf">
                                        <div className="flex items-center gap-2">
                                          <File className="h-4 w-4" />
                                          PDF Document
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Content Input based on type */}
                              {contentForm.type === 'text' && (
                                <div>
                                  <Label>Lesson Content</Label>
                                  <RichTextEditor
                                    content={contentForm.textContent}
                                    onChange={(content) => setContentForm({ ...contentForm, textContent: content })}
                                    placeholder="Write your lesson content here..."
                                    className="mt-2"
                                  />
                                </div>
                              )}

                              {contentForm.type === 'video' && (
                                <div>
                                  <Label htmlFor="videoUrl">Video URL</Label>
                                  <Input
                                    id="videoUrl"
                                    value={contentForm.videoUrl}
                                    onChange={(e) => setContentForm({ ...contentForm, videoUrl: e.target.value })}
                                    placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                  />
                                </div>
                              )}

                              {contentForm.type === 'pdf' && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="fileUpload">Upload PDF File</Label>
                                    <Input
                                      id="fileUpload"
                                      type="file"
                                      accept=".pdf"
                                      onChange={handleFileUpload}
                                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="fileUrl">Or enter PDF URL</Label>
                                    <Input
                                      id="fileUrl"
                                      value={contentForm.fileUrl}
                                      onChange={(e) => setContentForm({ ...contentForm, fileUrl: e.target.value })}
                                      placeholder="Enter PDF URL"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowAddContent(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={() => handleAddContent(section.id)} disabled={loading}>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Content
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
                        <Button onClick={() => setShowAddContent(section.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Content
                        </Button>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
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
