
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Edit, 
  HelpCircle,
  Clock,
  Award,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Quiz = Tables<'quizzes'>;
type QuizQuestion = Tables<'quiz_questions'>;

interface QuizManagerProps {
  courseId?: string;
}

export const QuizManager: React.FC<QuizManagerProps> = ({ courseId: propCourseId }) => {
  const { courseId: paramCourseId } = useParams();
  const courseId = propCourseId || paramCourseId;
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Record<string, QuizQuestion[]>>({});
  const [loading, setLoading] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    time_limit: 30,
    max_attempts: 1
  });
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'mcq' as 'mcq' | 'true_false' | 'fill_blank',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1
  });
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchQuizzes();
    }
  }, [courseId]);

  const fetchQuizzes = async () => {
    if (!courseId) return;

    try {
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (quizzesError) throw quizzesError;
      setQuizzes(quizzesData || []);

      // Fetch questions for each quiz
      const questionPromises = quizzesData?.map(async (quiz) => {
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quiz.id)
          .order('order_index');

        if (questionsError) throw questionsError;
        return { quizId: quiz.id, questions: questionsData || [] };
      }) || [];

      const questionResults = await Promise.all(questionPromises);
      const questionMap: Record<string, QuizQuestion[]> = {};
      questionResults.forEach(({ quizId, questions }) => {
        questionMap[quizId] = questions;
      });
      setQuestions(questionMap);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
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
      
      setQuizzes([data, ...quizzes]);
      setQuestions({ ...questions, [data.id]: [] });
      setQuizForm({
        title: '',
        description: '',
        time_limit: 30,
        max_attempts: 1
      });
      setShowCreateQuiz(false);
      
      toast({
        title: "Success",
        description: "Quiz created successfully!",
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

  const handleAddQuestion = async (quizId: string) => {
    if (!questionForm.question_text.trim()) return;

    setLoading(true);
    try {
      let options_data = null;
      if (questionForm.question_type === 'mcq') {
        options_data = questionForm.options.filter(opt => opt.trim());
      } else if (questionForm.question_type === 'true_false') {
        options_data = ['True', 'False'];
      }

      const { data, error } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quizId,
          question_text: questionForm.question_text,
          question_type: questionForm.question_type,
          options: options_data,
          correct_answer: questionForm.correct_answer,
          points: questionForm.points,
          order_index: questions[quizId]?.length || 0
        })
        .select()
        .single();

      if (error) throw error;
      
      const updatedQuestions = [...(questions[quizId] || []), data];
      setQuestions({ ...questions, [quizId]: updatedQuestions });
      
      setQuestionForm({
        question_text: '',
        question_type: 'mcq',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 1
      });
      setShowAddQuestion(null);
      
      toast({
        title: "Success",
        description: "Question added successfully!",
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

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz and all its questions?')) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
      
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      const newQuestions = { ...questions };
      delete newQuestions[quizId];
      setQuestions(newQuestions);
      
      toast({
        title: "Success",
        description: "Quiz deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string, quizId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      
      const updatedQuestions = questions[quizId].filter(q => q.id !== questionId);
      setQuestions({ ...questions, [quizId]: updatedQuestions });
      
      toast({
        title: "Success",
        description: "Question deleted successfully!",
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
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Quiz Management
            </CardTitle>
            <Dialog open={showCreateQuiz} onOpenChange={setShowCreateQuiz}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
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
                      Create Quiz
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-12 text-center">
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Yet</h3>
            <p className="text-gray-600 mb-6">Create your first quiz to assess student learning.</p>
            <Button onClick={() => setShowCreateQuiz(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="text-gray-600 mt-1">{quiz.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{quiz.time_limit} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Award className="h-4 w-4" />
                        <span>{quiz.max_attempts} attempts</span>
                      </div>
                      <Badge variant="outline">
                        {questions[quiz.id]?.length || 0} questions
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={showAddQuestion === quiz.id} onOpenChange={(open) => setShowAddQuestion(open ? quiz.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add Question to {quiz.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="questionText">Question</Label>
                            <Textarea
                              id="questionText"
                              value={questionForm.question_text}
                              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                              placeholder="Enter your question"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Question Type</Label>
                              <Select value={questionForm.question_type} onValueChange={(value: any) => setQuestionForm({ ...questionForm, question_type: value })}>
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
                              <Label htmlFor="points">Points</Label>
                              <Input
                                id="points"
                                type="number"
                                value={questionForm.points}
                                onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                          </div>
                          
                          {questionForm.question_type === 'mcq' && (
                            <div className="space-y-2">
                              <Label>Answer Options</Label>
                              {questionForm.options.map((option, index) => (
                                <Input
                                  key={index}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...questionForm.options];
                                    newOptions[index] = e.target.value;
                                    setQuestionForm({ ...questionForm, options: newOptions });
                                  }}
                                  placeholder={`Option ${index + 1}`}
                                />
                              ))}
                            </div>
                          )}
                          
                          <div>
                            <Label htmlFor="correctAnswer">Correct Answer</Label>
                            {questionForm.question_type === 'true_false' ? (
                              <Select value={questionForm.correct_answer} onValueChange={(value) => setQuestionForm({ ...questionForm, correct_answer: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select correct answer" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="True">True</SelectItem>
                                  <SelectItem value="False">False</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id="correctAnswer"
                                value={questionForm.correct_answer}
                                onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                                placeholder="Enter correct answer"
                              />
                            )}
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowAddQuestion(null)}>
                              Cancel
                            </Button>
                            <Button onClick={() => handleAddQuestion(quiz.id)} disabled={loading}>
                              Add Question
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {questions[quiz.id] && questions[quiz.id].length > 0 && (
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Questions:</h4>
                    {questions[quiz.id].map((question, index) => (
                      <div key={question.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {index + 1}. {question.question_text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {question.question_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {question.points} point{question.points !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id, quiz.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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
