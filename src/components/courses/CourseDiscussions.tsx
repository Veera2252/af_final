import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Plus, Trash2, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface CourseDiscussion {
  id: string;
  course_id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface CourseDiscussionsProps {
  courseId?: string;
  isInstructor?: boolean;
}

export const CourseDiscussions = ({ courseId, isInstructor = false }: CourseDiscussionsProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<CourseDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchDiscussions();
    }
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('course_discussions')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch discussions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      toast({
        title: "Error", 
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('course_discussions')
        .insert({
          course_id: courseId,
          user_id: user?.id,
          title: newDiscussion.title,
          content: newDiscussion.content,
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Discussion started successfully",
      });
      
      setNewDiscussion({ title: '', content: '' });
      setDialogOpen(false);
      fetchDiscussions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start discussion",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDiscussion = async (discussionId: string, userId: string) => {
    // Only allow deletion by the author or instructor
    if (user?.id !== userId && !isInstructor) {
      toast({
        title: "Error",
        description: "You can only delete your own discussions",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('course_discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Discussion deleted successfully",
      });
      
      fetchDiscussions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete discussion",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div className="p-6">Loading discussions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Course Discussions</h3>
        {user && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Start Discussion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Discussion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    placeholder="Enter discussion title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    placeholder="What would you like to discuss?"
                    rows={4}
                  />
                </div>
                <Button onClick={handleAddDiscussion} className="w-full">
                  Start Discussion
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {discussions.map((discussion) => (
          <Card key={discussion.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {discussion.profiles?.full_name 
                        ? getInitials(discussion.profiles.full_name)
                        : <User className="h-4 w-4" />
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{discussion.title}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{discussion.profiles?.full_name || 'Anonymous'}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {(user?.id === discussion.user_id || isInstructor) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDiscussion(discussion.id, discussion.user_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {discussion.content}
              </p>
            </CardContent>
          </Card>
        ))}
        {discussions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">No discussions yet</h4>
              <p className="text-muted-foreground mb-4">
                Be the first to start a discussion about this course
              </p>
              {user && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Discussion
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};