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
import { Plus, FileText, Calendar } from 'lucide-react';

type Assignment = Tables<'assignments'>;
type AssignmentSubmission = Tables<'assignment_submissions'>;

interface AssignmentManagerProps {
  courseId?: string;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({ courseId: propCourseId }) => {
  const { courseId: paramCourseId } = useParams();
  const courseId = propCourseId || paramCourseId;
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
    max_points: 100
  });

  useEffect(() => {
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at');

      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          profiles:student_id(full_name, email)
        `)
        .eq('assignment_id', assignmentId);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateAssignment = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) throw userError || new Error("User not found");

      const { data: insertedAssignments, error: insertError } = await supabase
        .from('assignments')
        .insert([
          {
            ...newAssignment,
            course_id: courseId,
            instructor_id: user.id,
            due_date: newAssignment.due_date
              ? new Date(newAssignment.due_date).toISOString()
              : null
          }
        ])
        .select();

      if (insertError) throw insertError;

      if (insertedAssignments && insertedAssignments.length > 0) {
        setAssignments([...assignments, insertedAssignments[0]]);
      }
      setNewAssignment({ title: '', description: '', due_date: '', max_points: 100 });

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

  const handleGradeSubmission = async (submissionId: string, points: number) => {
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          points_earned: points,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Refresh submissions
      if (selectedAssignment) {
        fetchSubmissions(selectedAssignment.id);
      }

      toast({
        title: "Success",
        description: "Assignment graded successfully!",
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
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Assignment Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Assignment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="assignment-title">Assignment Title</Label>
              <Input
                id="assignment-title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                placeholder="Enter assignment title"
              />
            </div>
            <div>
              <Label htmlFor="assignment-description">Description</Label>
              <Textarea
                id="assignment-description"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                placeholder="Enter assignment description"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={newAssignment.due_date}
                onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="max-points">Max Points</Label>
              <Input
                id="max-points"
                type="number"
                value={newAssignment.max_points}
                onChange={(e) => setNewAssignment({ ...newAssignment, max_points: parseInt(e.target.value) })}
              />
            </div>
            <Button onClick={handleCreateAssignment} disabled={loading} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </CardContent>
        </Card>

        {/* Assignment List */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          {assignment.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                        {assignment.due_date && (
                          <p className="text-sm text-gray-500 mt-2 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-sm font-medium mt-1">
                          Max Points: {assignment.max_points}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          fetchSubmissions(assignment.id);
                        }}
                      >
                        View Submissions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions View */}
      {selectedAssignment && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Submissions for "{selectedAssignment.title}"</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {(submission as any).profiles?.full_name || 'Unknown Student'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {(submission as any).profiles?.email}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted: {new Date(submission.submitted_at!).toLocaleString()}
                          </p>
                          {submission.submission_text && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Submission:</p>
                              <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                                {submission.submission_text}
                              </p>
                            </div>
                          )}
                          {submission.file_url && (
                            <div className="mt-2">
                              <a
                                href={submission.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View Submitted File
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {submission.points_earned !== null ? (
                            <span className="text-sm font-medium text-green-600">
                              Graded: {submission.points_earned}/{selectedAssignment.max_points}
                            </span>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                placeholder="Points"
                                className="w-20"
                                max={selectedAssignment.max_points}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const points = parseInt((e.target as HTMLInputElement).value);
                                    handleGradeSubmission(submission.id, points);
                                  }
                                }}
                              />
                              <span className="text-sm text-gray-500">
                                /{selectedAssignment.max_points}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
