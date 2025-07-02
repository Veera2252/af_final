
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  HelpCircle,
  Save,
  X
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  course_id?: string;
  time_limit?: number;
  max_attempts?: number;
  created_at: string;
}

interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'fill_blank';
  options?: string[] | null;
  correct_answer: string;
  points: number;
  order_index: number;
}

interface Course {
  id: string;
  title: string;
}

interface QuizManagerProps {
  courseId?: string;
}

export const QuizManager: React.FC<QuizManagerProps> = ({ courseId }) => {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    course_id: courseId || '',
    time_limit: 30,
    max_attempts: 1
  });

  useEffect(() => {
    fetchQuizzes();
    if (!courseId) {
      fetchCourses();
    }
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      let query = supabase.from('quizzes').select('*');
      
      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
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

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchQuestions = async (quizId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (error) throw error;
      
      // Transform the data to match our Question interface
      const transformedQuestions: Question[] = (data || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : null
      }));
      
      setQuestions(transformedQuestions);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateQuiz = async () => {
    try {
      const quizData = courseId ? 
        { ...newQuiz, course_id: courseId } : 
        newQuiz;

      const { data, error } = await supabase
        .from('quizzes')
        .insert([quizData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz created successfully!",
      });

      setIsCreateDialogOpen(false);
      setNewQuiz({
        title: '',
        description: '',
        course_id: courseId || '',
        time_limit: 30,
        max_attempts: 1
      });
      fetchQuizzes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveQuestions = async () => {
    if (!selectedQuiz) return;

    try {
      // Convert question_type to match database and handle options properly
      const questionsToSave = questions.map((q, index) => ({
        quiz_id: selectedQuiz.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || [],
        correct_answer: q.correct_answer,
        points: q.points,
        order_index: index
      }));

      // Delete existing questions
      await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', selectedQuiz.id);

      // Insert new questions
      const { error } = await supabase
        .from('quiz_questions')
        .insert(questionsToSave);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Questions saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      quiz_id: selectedQuiz?.id || '',
      question_text: '',
      question_type: 'mcq',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      order_index: questions.length
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quiz Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                />
              </div>
              {!courseId && (
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select value={newQuiz.course_id} onValueChange={(value) => setNewQuiz({ ...newQuiz, course_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    value={newQuiz.time_limit}
                    onChange={(e) => setNewQuiz({ ...newQuiz, time_limit: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_attempts">Max Attempts</Label>
                  <Input
                    id="max_attempts"
                    type="number"
                    value={newQuiz.max_attempts}
                    onChange={(e) => setNewQuiz({ ...newQuiz, max_attempts: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateQuiz} className="w-full">
                Create Quiz
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedQuiz ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{selectedQuiz.title}</h2>
              <p className="text-gray-600">{selectedQuiz.description}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveQuestions}>
                <Save className="h-4 w-4 mr-2" />
                Save Questions
              </Button>
              <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
                Back to Quizzes
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button onClick={addQuestion} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.question_text}
                      onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Question Type</Label>
                      <Select
                        value={question.question_type}
                        onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  {question.question_type === 'mcq' && (
                    <div>
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => (
                          <Input
                            key={optionIndex}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(question.options || [])];
                              newOptions[optionIndex] = e.target.value;
                              updateQuestion(index, 'options', newOptions);
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Correct Answer</Label>
                    <Input
                      value={question.correct_answer}
                      onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{quiz.title}</span>
                  <Badge variant="outline">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Quiz
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 line-clamp-2">
                  {quiz.description || 'No description available'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {quiz.time_limit && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.time_limit} min</span>
                    </div>
                  )}
                  <span>Max {quiz.max_attempts} attempts</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      fetchQuestions(quiz.id);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Manage Questions
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  Created {new Date(quiz.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {quizzes.length === 0 && !selectedQuiz && (
        <Card>
          <CardContent className="p-12 text-center">
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Found</h3>
            <p className="text-gray-600 mb-4">
              Create your first quiz to get started with assessments.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Quiz
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
