
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Star, Users } from "lucide-react";
import { CoursePreview } from '@/components/courses/CoursePreview';

interface Course {
  id: string;
  name: string;
  title?: string;
  description?: string;
  price: number;
  is_free: boolean;
  is_published: boolean;
  thumbnail_url?: string;
}


const PAGE_SIZE_OPTIONS = [4, 8, 12, 20];

const getImageUrl = (path: string) => {
  if (!path) return "/thumbnails/bg.png";

  if (path.startsWith('http') && !path.includes('blob:')) return path;

  // Handle blob URLs by mapping to available thumbnails
  if (path.includes('blob:')) {
    // Map blob URLs to available thumbnail files
    const availableThumbnails = [
      '/thumbnails/a5.jpg',
      '/thumbnails/a7.png',
      '/thumbnails/a8.jpg',
      '/thumbnails/a9.jpg',
      '/thumbnails/a10.jpg',
      '/thumbnails/a11.jpg',
      '/thumbnails/python.png',
      '/thumbnails/excel.png',
      '/thumbnails/ui ux.jpg',
      '/thumbnails/ai ds.jpg'
    ];

    // Use a simple hash to consistently map blob URLs to thumbnails
    const hash = path.split('/').pop() || '';
    const index = hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % availableThumbnails.length;
    return availableThumbnails[index];
  }

  // Handle different path formats
  let cleanPath = path;
  if (path.startsWith('/')) {
    cleanPath = path.substring(1); // Remove leading slash
  }

  try {
    // Use the correct bucket name (thumbnails)
    const { data } = supabase.storage.from("thumbnails").getPublicUrl(cleanPath);
    return data?.publicUrl || "/thumbnails/bg.png";
  } catch (error) {
    console.error('Error generating image URL:', error);
    return "/thumbnails/bg.png";
  }
};

const CourseGrid: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseThumbnails, setCourseThumbnails] = useState<{ [id: string]: string }>({});
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true);
      if (error) throw error;
      setCourses(data || []);

      // Fetch public URLs for thumbnails if needed
      const thumbnails: { [id: string]: string } = {};
      if (data) {
        for (const course of data) {
          thumbnails[course.id] = getImageUrl(course.thumbnail_url || "");
        }
      }
      setCourseThumbnails(thumbnails);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  const handlePreviewClick = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const handleClosePreview = () => {
    setSelectedCourse(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(courses.length / pageSize);
  const paginatedCourses = courses.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  // Carousel logic: show a window of cards horizontally
  const visibleCourses = paginatedCourses.slice(carouselIndex, carouselIndex + 4);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  if (courses.length === 0) {
    return (
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Courses</h2>
            <p className="text-xl text-muted-foreground">No courses available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Our Courses</h2>
          <p className="text-gray-600">Browse the list of courses below, or use the search bar or dropdown lists to discover more.</p>
        </div>

        {/* Filters */}
        {/* <div className="flex flex-wrap gap-4 mb-8">
          <select className="border rounded px-4 py-2" value={pageSize} onChange={handlePageSizeChange}>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{`Show ${size} courses`}</option>
            ))}
          </select>
        </div> */}

        {/* Carousel Courses Row */}
        <div className="relative flex items-center">
          <button
            className="absolute left-0 z-10 bg-white border rounded-full shadow p-2 -ml-4 disabled:opacity-50"
            onClick={() => setCarouselIndex(Math.max(carouselIndex - 1, 0))}
            disabled={carouselIndex === 0}
            aria-label="Scroll Left"
          >
            &lt;
          </button>
          <div className="flex overflow-x-auto gap-8 w-full px-8">
            {visibleCourses.map((course) => (
              <Card
                key={course.id}
                className="min-w-[250px] max-w-[300px] border shadow-sm hover:shadow-md transition rounded-lg overflow-hidden flex-shrink-0"
              >
                {/* Image */}
                <img
                  src={courseThumbnails[course.id] || "/thumbnails/bg.png"}
                  alt={course.title || course.name}
                  className="w-full h-48 object-cover"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== "/thumbnails/bg.png") {
                      target.src = "/thumbnails/bg.png";
                    }
                  }}
                />

                <CardContent className="p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-lg mb-2">
                    {course.title || course.name}
                  </h3>

                  {/* Rating + Students */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.8</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>120+ students</span>
                    </div>
                  </div>

                  {/* Price */}
                  <p className="text-green-600 font-bold mb-4">
                    {course.is_free ? "Free" : `$${course.price}`}
                  </p>

                  {/* Preview Button */}
                  <Button
                    className="w-full bg-[#0866FF]/90 hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handlePreviewClick(course.id)}
                  >
                    Preview Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <button
            className="absolute right-0 z-10 bg-white border rounded-full shadow p-2 -mr-4 disabled:opacity-50"
            onClick={() => setCarouselIndex(Math.min(carouselIndex + 1, Math.max(paginatedCourses.length - 4, 0)))}
            disabled={carouselIndex >= Math.max(paginatedCourses.length - 4, 0)}
            aria-label="Scroll Right"
          >
            &gt;
          </button>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => { setCurrentPage(currentPage - 1); setCarouselIndex(0); }}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-[#0866FF]/90 text-white' : ''}`}
              onClick={() => { setCurrentPage(i + 1); setCarouselIndex(0); }}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded"
            onClick={() => { setCurrentPage(currentPage + 1); setCarouselIndex(0); }}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedCourse && (
        <CoursePreview
          courseId={selectedCourse}
          onClose={handleClosePreview}
        />
      )}
    </section>
  );
};

export default CourseGrid;
