import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, BookOpen, ArrowLeft, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserProgressData {
  id: string;
  content_id: string;
  completed: boolean;
  progress: number;
  created_at: string;
  updated_at: string;
  content: {
    title: string;
    type: string;
  };
}

export const UserProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState<UserProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          content:course_content(title, type)
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProgressData(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch progress data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (contentId: string, progress: number, completed: boolean = false) => {
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user?.id,
          content_id: contentId,
          progress,
          completed,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast({
        title: "Progress Updated",
        description: "Your progress has been saved",
      });
      
      fetchUserProgress();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const overallProgress = progressData.length > 0 
    ? Math.round(progressData.reduce((acc, item) => acc + item.progress, 0) / progressData.length)
    : 0;

  const completedCount = progressData.filter(item => item.completed).length;

  if (loading) {
    return <div className="p-6">Loading your progress...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learning Progress</h1>
          <p className="text-gray-600">Track your progress through course content</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/certificates')}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Award className="h-4 w-4 mr-2" />
            View My Certificates
          </Button>
          <Button
            onClick={() => navigate('/student/dashboard')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              out of {progressData.length} items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.length - completedCount}</div>
            <p className="text-xs text-muted-foreground">
              items remaining
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Progress Details</CardTitle>
          <CardDescription>Detailed progress through course content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.content?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Type: {item.content?.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={item.completed ? "default" : "secondary"}>
                    {item.progress}%
                  </Badge>
                  <Progress value={item.progress} className="w-24" />
                </div>
              </div>
            ))}
            {progressData.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No progress data available. Start learning to see your progress here!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};