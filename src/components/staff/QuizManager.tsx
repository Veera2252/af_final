
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Award,
  Clock,
  Users,
  HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Quiz = Tables<'quizzes'>;
type QuizQuestion = Tables<'quiz_questions'>;
type QuizAttempt = Tables<'quiz_attempts'>;

interface QuizManagerProps {
  courseId?: string;
}

export const QuizManager: React.FC<QuizManagerProps> = ({ courseId }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Record<string, QuizQuestion[]>>({});
  const [attempts, setAttempts] = useState<Record<string, QuizAttempt[]>>({});
  const [loading, setLoading] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    time_limit: 30,
    max_attempts: 1
  });
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'multiple_choice' as 'multiple_choice' | 'true_false' | 'essay',
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

      // Fetch questions and attempts for each quiz
      const questionPromises = quizzesData?.map(async (quiz) => {
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quiz.id)
          .order('order_index');

        if (questionsError) throw questionsError;
        return { quizId: quiz.id, questions: questionsData || [] };
      }) || [];

      const attemptPromises = quizzesData?.map(async (quiz) => {
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('quiz_id', quiz.id)
          .order('started_at', { ascending: false });

        if (attemptsError) throw attemptsError;
        return { quizId: quiz.id, attempts: attemptsData || [] };
      }) || [];

      const questionResults = await Promise.all(questionPromises);
      const attemptResults = await Promise.all(attemptPromises);

      const questionMap: Record<string, QuizQuestion[]> = {};
      const attemptMap: Record<string, QuizAttempt[]> = {};

      questionResults.forEach(({ quizId, questions }) => {
        questionMap[quizId] = questions;
      });

      attemptResults.forEach(({ quizId, attempts }) => {
        attemptMap[quizId] = attempts;
      });

      setQuestions(questionMap);
      setAttempts(attemptMap);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.title.trim() || !courseId) return;

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
      setAttempts({ ...attempts, [data.id]: [] });
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

  const handleAddQuestion = async () => {
    if (!questionForm.question_text.trim() || !selectedQuizId) return;

    setLoading(true);
    try {
      const currentQuestions = questions[selectedQuizId] || [];
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert([{
          quiz_id: selectedQuizId,
          question_text: questionForm.question_text,
          question_type: questionForm.question_type,
          options: questionForm.question_type === 'multiple_choice' ? questionForm.options.filter(opt => opt.trim()) : null,
          correct_answer: questionForm.correct_answer,
          points: questionForm.points,
          order_index: currentQuestions.length
        }])
        .select()
        .single();

      if (error) throw error;
      
      setQuestions({
        ...questions,
        [selectedQuizId]: [...currentQuestions, data]
      });
      
      setQuestionForm({
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 1
      });
      setShowAddQuestion(false);
      
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
      const newAttempts = { ...attempts };
      delete newQuestions[quizId];
      delete newAttempts[quizId];
      setQuestions(newQuestions);
      setAttempts(newAttempts);
      
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
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
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Yet</h3>
            <p className="text-gray-600 mb-6">Create your first quiz to assess student knowledge.</p>
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="text-gray-600 mt-2">{quiz.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{quiz.time_limit} minutes</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <HelpCircle className="h-4 w-4" />
                        <span>{questions[quiz.id]?.length || 0} questions</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{attempts[quiz.id]?.length || 0} attempts</span>
                      </div>
                      <Badge variant="outline">
                        Max {quiz.max_attempts} attempts
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-800 hover:bg-green-50"
                      onClick={() => {
                        setSelectedQuizId(quiz.id);
                        setShowAddQuestion(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </Button>
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
                    {questions[quiz.id].slice(0, 3).map((question, index) => (
                      <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Q{index + 1}: {question.question_text}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {question.question_type.replace('_', ' ')} • {question.points} points
                          </p>
                        </div>
                      </div>
                    ))}
                    {questions[quiz.id].length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{questions[quiz.id].length - 3} more questions
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Question Dialog */}
      <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Question to Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="questionText">Question Text</Label>
              <Textarea
                id="questionText"
                value={questionForm.question_text}
                onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                placeholder="Enter your question"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questionType">Question Type</Label>
                <select
                  id="questionType"
                  className="w-full p-2 border rounded-md"
                  value={questionForm.question_type}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value as any })}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="essay">Essay</option>
                </select>
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

            {questionForm.question_type === 'multiple_choice' && (
              <div>
                <Label>Answer Options</Label>
                <div className="space-y-2">
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
              </div>
            )}

            <div>
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              {questionForm.question_type === 'multiple_choice' ? (
                <select
                  id="correctAnswer"
                  className="w-full p-2 border rounded-md"
                  value={questionForm.correct_answer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                >
                  <option value="">Select correct answer</option>
                  {questionForm.options.filter(opt => opt.trim()).map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              ) : questionForm.question_type === 'true_false' ? (
                <select
                  id="correctAnswer"
                  className="w-full p-2 border rounded-md"
                  value={questionForm.correct_answer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                >
                  <option value="">Select answer</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <Textarea
                  id="correctAnswer"
                  value={questionForm.correct_answer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                  placeholder="Sample answer or grading criteria"
                />
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddQuestion(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddQuestion} disabled={loading}>
                Add Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
