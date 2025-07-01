
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { 
  Plus, 
  Trash2, 
  Edit, 
  ClipboardList,
  Calendar,
  Award,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Assignment = Tables<'assignments'>;
type AssignmentSubmission = Tables<'assignment_submissions'>;

interface AssignmentManagerProps {
  courseId?: string;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({ courseId: propCourseId }) => {
  const { courseId: paramCourseId } = useParams();
  const courseId = propCourseId || paramCourseId;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission[]>>({});
  const [loading, setLoading] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    max_points: 100,
    due_date: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const fetchAssignments = async () => {
    if (!courseId) return;

    try {
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

      // Fetch submissions for each assignment
      const submissionPromises = assignmentsData?.map(async (assignment) => {
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('assignment_id', assignment.id)
          .order('submitted_at', { ascending: false });

        if (submissionsError) throw submissionsError;
        return { assignmentId: assignment.id, submissions: submissionsData || [] };
      }) || [];

      const submissionResults = await Promise.all(submissionPromises);
      const submissionMap: Record<string, AssignmentSubmission[]> = {};
      submissionResults.forEach(({ assignmentId, submissions }) => {
        submissionMap[assignmentId] = submissions;
      });
      setSubmissions(submissionMap);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
          max_points: assignmentForm.max_points,
          due_date: assignmentForm.due_date ? new Date(assignmentForm.due_date).toISOString() : null
        }])
        .select()
        .single();

      if (error) throw error;
      
      setAssignments([data, ...assignments]);
      setSubmissions({ ...submissions, [data.id]: [] });
      setAssignmentForm({
        title: '',
        description: '',
        max_points: 100,
        due_date: ''
      });
      setShowCreateAssignment(false);
      
      toast({
        title: "Success",
        description: "Assignment created successfully!",
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

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment and all its submissions?')) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      
      setAssignments(assignments.filter(a => a.id !== assignmentId));
      const newSubmissions = { ...submissions };
      delete newSubmissions[assignmentId];
      setSubmissions(newSubmissions);
      
      toast({
        title: "Success",
        description: "Assignment deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDateString: string) => {
    return new Date(dueDateString) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Assignment Management
            </CardTitle>
            <Dialog open={showCreateAssignment} onOpenChange={setShowCreateAssignment}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
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
                    <Label htmlFor="assignmentDescription">Description & Instructions</Label>
                    <RichTextEditor
                      content={assignmentForm.description}
                      onChange={(content) => setAssignmentForm({ ...assignmentForm, description: content })}
                      placeholder="Enter detailed assignment instructions..."
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxPoints">Max Points</Label>
                      <Input
                        id="maxPoints"
                        type="number"
                        value={assignmentForm.max_points}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, max_points: parseInt(e.target.value) || 100 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="datetime-local"
                        value={assignmentForm.due_date}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowCreateAssignment(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAssignment} disabled={loading}>
                      Create Assignment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
            <p className="text-gray-600 mb-6">Create your first assignment to give students practical work.</p>
            <Button onClick={() => setShowCreateAssignment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{assignment.title}</h3>
                    {assignment.description && (
                      <div 
                        className="text-gray-600 mt-2 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: assignment.description }}
                      />
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Award className="h-4 w-4" />
                        <span>{assignment.max_points} points</span>
                      </div>
                      {assignment.due_date && (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span className={isOverdue(assignment.due_date) ? 'text-red-600 font-medium' : 'text-gray-500'}>
                            Due: {formatDate(assignment.due_date)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{submissions[assignment.id]?.length || 0} submissions</span>
                      </div>
                      {assignment.due_date && isOverdue(assignment.due_date) && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {submissions[assignment.id] && submissions[assignment.id].length > 0 && (
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Recent Submissions:</h4>
                    {submissions[assignment.id].slice(0, 3).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Student ID: {submission.student_id}</p>
                          <p className="text-xs text-gray-500">
                            Submitted: {submission.submitted_at ? formatDate(submission.submitted_at) : 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {submission.points_earned !== null && (
                            <Badge variant="outline">
                              {submission.points_earned}/{assignment.max_points}
                            </Badge>
                          )}
                          {submission.graded_at ? (
                            <Badge variant="default">Graded</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {submissions[assignment.id].length > 3 && (
                      <Button variant="outline" size="sm" className="w-full">
                        View All {submissions[assignment.id].length} Submissions
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
