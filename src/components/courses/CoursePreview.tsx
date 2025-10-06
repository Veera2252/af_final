import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Star, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CoursePreviewProps {
  courseId: string;
  onClose: () => void;
}

interface Course {
  id: string;
  name: string;
  title?: string;
  description?: string;
  price: number;
  is_free: boolean;
  thumbnail_url?: string;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({ courseId, onClose }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Error",
        description: "Failed to load course preview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-3/4 flex flex-col">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-3/4 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Course Preview</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center">
            <p className="text-gray-500">Course not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-3/4 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Course Preview</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={course.thumbnail_url || "/thumbnails/a1.jpg"}
                alt={course.title || course.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">4.8 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Students enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Duration: 8 weeks</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">{course.title || course.name}</h3>
              <p className="text-gray-600 mb-4">
                {course.description || "Comprehensive course designed to help you master new skills"}
              </p>
              <div className="mb-4">
                {course.is_free ? (
                  <span className="text-3xl font-bold text-green-600">Free</span>
                ) : (
                  <span className="text-3xl font-bold text-primary">${course.price}</span>
                )}
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold">What you'll learn:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Hands-on projects and real-world applications</li>
                  <li>• Industry best practices and modern techniques</li>
                  <li>• Certificate upon completion</li>
                  <li>• Lifetime access to course materials</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
