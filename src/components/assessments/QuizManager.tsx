import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save } from 'lucide-react';

type Quiz = Tables<'quizzes'>;
type QuizQuestion = Tables<'quiz_questions'>;

export const QuizManager: React.FC = () => {
  const { courseId } = useParams();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    time_limit: 60,
    max_attempts: 1
  });

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'mcq' as 'mcq' | 'true_false' | 'fill_blank',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1
  });

  useEffect(() => {
    if (courseId) {
      fetchQuizzes();
    }
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at');

      if (error) throw error;
      setQuizzes(data || []);
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
      setQuestions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateQuiz = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([{
          ...newQuiz,
          course_id: courseId
        }])
        .select()
        .single();

      if (error) throw error;

      setQuizzes([...quizzes, data]);
      setNewQuiz({ title: '', description: '', time_limit: 60, max_attempts: 1 });
      
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
    if (!selectedQuiz) return;

    setLoading(true);
    try {
      const questionData = {
        quiz_id: selectedQuiz.id,
        question_text: newQuestion.question_text,
        question_type: newQuestion.question_type,
        correct_answer: newQuestion.correct_answer,
        points: newQuestion.points,
        order_index: questions.length,
        options: newQuestion.question_type === 'mcq' ? newQuestion.options.filter(opt => opt.trim()) : null
      };

      const { data, error } = await supabase
        .from('quiz_questions')
        .insert([questionData])
        .select()
        .single();

      if (error) throw error;

      setQuestions([...questions, data]);
      setNewQuestion({
        question_text: '',
        question_type: 'mcq',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 1
      });

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

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(questions.filter(q => q.id !== questionId));
      
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
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Quiz Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Quiz Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quiz-title">Quiz Title</Label>
              <Input
                id="quiz-title"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                placeholder="Enter quiz title"
              />
            </div>
            <div>
              <Label htmlFor="quiz-description">Description</Label>
              <Textarea
                id="quiz-description"
                value={newQuiz.description}
                onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                placeholder="Enter quiz description"
              />
            </div>
            <div>
              <Label htmlFor="time-limit">Time Limit (minutes)</Label>
              <Input
                id="time-limit"
                type="number"
                value={newQuiz.time_limit}
                onChange={(e) => setNewQuiz({ ...newQuiz, time_limit: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="max-attempts">Max Attempts</Label>
              <Input
                id="max-attempts"
                type="number"
                value={newQuiz.max_attempts}
                onChange={(e) => setNewQuiz({ ...newQuiz, max_attempts: parseInt(e.target.value) })}
              />
            </div>
            <Button onClick={handleCreateQuiz} disabled={loading} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Quiz List */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <Button
                  key={quiz.id}
                  variant={selectedQuiz?.id === quiz.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    fetchQuestions(quiz.id);
                  }}
                >
                  {quiz.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Management */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedQuiz ? `Questions for "${selectedQuiz.title}"` : 'Select a Quiz'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedQuiz && (
              <div className="space-y-6">
                {/* Add Question Form */}
                <div className="space-y-4 border-b pb-4">
                  <div>
                    <Label htmlFor="question-text">Question</Label>
                    <Textarea
                      id="question-text"
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                      placeholder="Enter question text"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="question-type">Question Type</Label>
                    <Select
                      value={newQuestion.question_type}
                      onValueChange={(value: 'mcq' | 'true_false' | 'fill_blank') => 
                        setNewQuestion({ ...newQuestion, question_type: value })
                      }
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

                  {newQuestion.question_type === 'mcq' && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {newQuestion.options.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="correct-answer">Correct Answer</Label>
                    <Input
                      id="correct-answer"
                      value={newQuestion.correct_answer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                      placeholder="Enter correct answer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                    />
                  </div>

                  <Button onClick={handleAddQuestion} disabled={loading} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {/* Existing Questions */}
                <div className="space-y-4">
                  <h4 className="font-medium">Existing Questions</h4>
                  {questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">Q{index + 1}: {question.question_text}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Type: {question.question_type} | Points: {question.points}
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                              Answer: {question.correct_answer}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
