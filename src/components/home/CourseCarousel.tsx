import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star, Clock, Users, BookOpen, Play } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  price: number;
  originalPrice?: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js and more in this comprehensive course.',
    image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500',
    instructor: 'Dr. Angela Yu',
    rating: 4.9,
    students: 45678,
    duration: '65 hours',
    price: 2999,
    originalPrice: 4999,
    level: 'Beginner',
    category: 'Web Development'
  },
  {
    id: '2',
    title: 'Python for Data Science',
    description: 'Master Python programming and data analysis with pandas, numpy, and matplotlib.',
    image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=500',
    instructor: 'Jose Portilla',
    rating: 4.8,
    students: 32145,
    duration: '42 hours',
    price: 2499,
    originalPrice: 3999,
    level: 'Intermediate',
    category: 'Data Science'
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass',
    description: 'Learn design thinking, prototyping, and create stunning user interfaces.',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500',
    instructor: 'Daniel Schifano',
    rating: 4.7,
    students: 28934,
    duration: '38 hours',
    price: 1999,
    originalPrice: 3499,
    level: 'Beginner',
    category: 'Design'
  },
  {
    id: '4',
    title: 'Machine Learning A-Z',
    description: 'Complete hands-on machine learning tutorial with Python and R.',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=500',
    instructor: 'Kirill Eremenko',
    rating: 4.9,
    students: 67890,
    duration: '44 hours',
    price: 3499,
    originalPrice: 5999,
    level: 'Advanced',
    category: 'AI & ML'
  },
  {
    id: '5',
    title: 'Digital Marketing Complete Course',
    description: 'Master SEO, social media marketing, Google Ads, and content marketing.',
    image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500',
    instructor: 'Neil Patel',
    rating: 4.6,
    students: 23456,
    duration: '32 hours',
    price: 1799,
    originalPrice: 2999,
    level: 'Beginner',
    category: 'Marketing'
  }
];

export const CourseCarousel: React.FC = () => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {courses.map((course) => (
            <CarouselItem key={course.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="h-full bg-white dark:bg-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                    <Badge className="bg-blue-600 text-white">
                      {course.category}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30">
                      <Play className="h-5 w-5 mr-2" />
                      Preview
                    </Button>
                  </div>
                  {course.originalPrice && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-red-500 text-white">
                        {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-white line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {course.description}
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      by {course.instructor}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(course.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {course.rating}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ({course.students.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{course.price}
                      </span>
                      {course.originalPrice && (
                        <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                          ₹{course.originalPrice}
                        </span>
                      )}
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Enroll Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};