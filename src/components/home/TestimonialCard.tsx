import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  image: string;
  rating: number;
  testimonial: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  company,
  image,
  rating,
  testimonial
}) => {
  return (
    <Card className="h-full bg-white dark:bg-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
      <CardContent className="p-8 space-y-6">
        {/* Quote Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Quote className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Rating */}
        <div className="flex justify-center items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Testimonial */}
        <blockquote className="text-center text-gray-700 dark:text-gray-300 leading-relaxed italic">
          "{testimonial}"
        </blockquote>

        {/* Author */}
        <div className="flex flex-col items-center space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Avatar className="w-16 h-16 ring-4 ring-gray-100 dark:ring-gray-800">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg">
              {name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{company}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};