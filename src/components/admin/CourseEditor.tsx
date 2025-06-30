
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

export const CourseEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: 0,
    is_free: false,
    is_published: false
  });

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCourseTypeChange = (value: string) => {
    const isFree = value === 'free';
    setCourse({ 
      ...course, 
      is_free: isFree,
      price: isFree ? 0 : course.price
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const courseData = {
        ...course,
        price: course.is_free ? 0 : course.price
      };

      if (id) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('courses')
          .insert([{ ...courseData, created_by: profile?.id }]);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Course ${id ? 'updated' : 'created'} successfully!`,
      });
      navigate('/admin/courses');
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
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Course' : 'Create New Course'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={course.description}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Course Type</Label>
            <RadioGroup 
              value={course.is_free ? 'free' : 'paid'} 
              onValueChange={handleCourseTypeChange}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="free" />
                <Label htmlFor="free">Free Course</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid">Paid Course</Label>
              </div>
            </RadioGroup>
          </div>

          {!course.is_free && (
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={course.price}
                onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) })}
              />
            </div>
          )}
          
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Course'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
