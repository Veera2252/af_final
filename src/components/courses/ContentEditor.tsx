import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { 
  Plus, 
  Edit, 
  Video, 
  Image, 
  FileText, 
  File, 
  Upload,
  Link,
  Save
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContentEditorProps {
  sectionId: string;
  onContentAdded: () => void;
  existingContent?: any;
  isEdit?: boolean;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  sectionId,
  onContentAdded,
  existingContent,
  isEdit = false
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contentData, setContentData] = useState({
    title: existingContent?.title || '',
    content_type: existingContent?.content_type || 'text',
    url: existingContent?.content_data?.url || '',
    text: existingContent?.content_data?.text || '',
    description: existingContent?.content_data?.description || '',
    embed_code: existingContent?.content_data?.embed_code || '',
    file_size: existingContent?.content_data?.file_size || '',
    duration: existingContent?.content_data?.duration || ''
  });

  const handleSave = async () => {
    if (!contentData.title) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const content_data = {
        url: contentData.url,
        text: contentData.text,
        description: contentData.description,
        embed_code: contentData.embed_code,
        file_size: contentData.file_size,
        duration: contentData.duration
      };

      if (isEdit && existingContent) {
        const { error } = await supabase
          .from('course_content')
          .update({
            title: contentData.title,
            content_type: contentData.content_type,
            content_data
          })
          .eq('id', existingContent.id);

        if (error) throw error;
      } else {
        // Get the next order index
        const { data: existingContentData } = await supabase
          .from('course_content')
          .select('order_index')
          .eq('section_id', sectionId)
          .order('order_index', { ascending: false })
          .limit(1);

        const nextOrderIndex = existingContentData && existingContentData.length > 0 
          ? existingContentData[0].order_index + 1 
          : 0;

        const { error } = await supabase
          .from('course_content')
          .insert([{
            section_id: sectionId,
            title: contentData.title,
            content_type: contentData.content_type,
            content_data,
            order_index: nextOrderIndex
          }]);

        if (error) throw error;
      }

      setOpen(false);
      onContentAdded();
      
      if (!isEdit) {
        setContentData({
          title: '',
          content_type: 'text',
          url: '',
          text: '',
          description: '',
          embed_code: '',
          file_size: '',
          duration: ''
        });
      }

      toast({
        title: "Success",
        description: `Content ${isEdit ? 'updated' : 'added'} successfully!`,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload to a storage service
      const url = URL.createObjectURL(file);
      setContentData({ 
        ...contentData, 
        url, 
        file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });
      toast({
        title: "Info",
        description: "File uploaded (demo mode - implement file storage)",
      });
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <File className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={isEdit ? "ghost" : "default"} 
          size="sm"
          className={isEdit ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"}
        >
          {isEdit ? (
            <Edit className="h-4 w-4" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getContentTypeIcon(contentData.content_type)}
            {isEdit ? 'Edit Content' : 'Add New Content'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content-title">Content Title *</Label>
                <Input
                  id="content-title"
                  value={contentData.title}
                  onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
                  placeholder="Enter a descriptive title"
                />
              </div>
              
              <div>
                <Label htmlFor="content-type">Content Type *</Label>
                <Select
                  value={contentData.content_type}
                  onValueChange={(value) => setContentData({ ...contentData, content_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Text Content
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video
                      </div>
                    </SelectItem>
                    <SelectItem value="image">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Image
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

              <div>
                <Label htmlFor="content-description">Description (Optional)</Label>
                <Textarea
                  id="content-description"
                  value={contentData.description}
                  onChange={(e) => setContentData({ ...contentData, description: e.target.value })}
                  placeholder="Brief description of this content"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content-Specific Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getContentTypeIcon(contentData.content_type)}
                {contentData.content_type.charAt(0).toUpperCase() + contentData.content_type.slice(1)} Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Text Content */}
              {contentData.content_type === 'text' && (
                <div>
                  <Label>Rich Text Content</Label>
                  <RichTextEditor
                    content={contentData.text}
                    onChange={(content) => setContentData({ ...contentData, text: content })}
                    placeholder="Write your lesson content here..."
                  />
                </div>
              )}

              {/* Video Content */}
              {contentData.content_type === 'video' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="video-url">Video URL</Label>
                    <Input
                      id="video-url"
                      value={contentData.url}
                      onChange={(e) => setContentData({ ...contentData, url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=... or upload file"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">OR</p>
                    <Label htmlFor="video-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Upload Video File</p>
                        <p className="text-xs text-gray-500">MP4, WebM, or MOV (max 500MB)</p>
                      </div>
                    </Label>
                    <Input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <Label htmlFor="video-duration">Duration (Optional)</Label>
                    <Input
                      id="video-duration"
                      value={contentData.duration}
                      onChange={(e) => setContentData({ ...contentData, duration: e.target.value })}
                      placeholder="e.g., 15:30"
                    />
                  </div>

                  <div>
                    <Label htmlFor="embed-code">Embed Code (Optional)</Label>
                    <Textarea
                      id="embed-code"
                      value={contentData.embed_code}
                      onChange={(e) => setContentData({ ...contentData, embed_code: e.target.value })}
                      placeholder="Paste embed code from YouTube, Vimeo, etc."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Image Content */}
              {contentData.content_type === 'image' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      value={contentData.url}
                      onChange={(e) => setContentData({ ...contentData, url: e.target.value })}
                      placeholder="https://example.com/image.jpg or upload file"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">OR</p>
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Upload Image File</p>
                        <p className="text-xs text-gray-500">JPG, PNG, or WebP (max 10MB)</p>
                      </div>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {contentData.url && (
                    <div>
                      <Label>Preview</Label>
                      <img 
                        src={contentData.url} 
                        alt="Preview" 
                        className="max-w-full h-48 object-cover rounded-lg border mt-2"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* PDF Content */}
              {contentData.content_type === 'pdf' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pdf-url">PDF URL</Label>
                    <Input
                      id="pdf-url"
                      value={contentData.url}
                      onChange={(e) => setContentData({ ...contentData, url: e.target.value })}
                      placeholder="https://example.com/document.pdf or upload file"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">OR</p>
                    <Label htmlFor="pdf-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Upload PDF File</p>
                        <p className="text-xs text-gray-500">PDF format (max 50MB)</p>
                      </div>
                    </Label>
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {contentData.file_size && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        File Size: {contentData.file_size}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (isEdit ? 'Update Content' : 'Add Content')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};