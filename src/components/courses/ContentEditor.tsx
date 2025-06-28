
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
import { Plus, Edit } from 'lucide-react';

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
    description: existingContent?.content_data?.description || ''
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
        description: contentData.description
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
          description: ''
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEdit ? "outline" : "default"} size="sm">
          {isEdit ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
          {isEdit ? '' : 'Add Content'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Content' : 'Add New Content'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="content-title">Title</Label>
            <Input
              id="content-title"
              value={contentData.title}
              onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
              placeholder="Enter content title"
            />
          </div>
          
          <div>
            <Label htmlFor="content-type">Content Type</Label>
            <Select
              value={contentData.content_type}
              onValueChange={(value) => setContentData({ ...contentData, content_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Content</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(contentData.content_type === 'video' || contentData.content_type === 'image' || contentData.content_type === 'pdf') && (
            <div>
              <Label htmlFor="content-url">URL</Label>
              <Input
                id="content-url"
                value={contentData.url}
                onChange={(e) => setContentData({ ...contentData, url: e.target.value })}
                placeholder="Enter content URL"
              />
            </div>
          )}

          {contentData.content_type === 'text' && (
            <div>
              <Label htmlFor="content-text">Text Content</Label>
              <Textarea
                id="content-text"
                value={contentData.text}
                onChange={(e) => setContentData({ ...contentData, text: e.target.value })}
                placeholder="Enter text content"
                rows={6}
              />
            </div>
          )}

          <div>
            <Label htmlFor="content-description">Description (Optional)</Label>
            <Textarea
              id="content-description"
              value={contentData.description}
              onChange={(e) => setContentData({ ...contentData, description: e.target.value })}
              placeholder="Enter content description"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add Content')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
