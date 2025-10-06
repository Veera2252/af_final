import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';

interface InstagramCardProps {
  image: string;
  username: string;
  avatar: string;
  likes: number;
  caption: string;
  verified?: boolean;
}

export const InstagramCard: React.FC<InstagramCardProps> = ({
  image,
  username,
  avatar,
  likes,
  caption,
  verified = false
}) => {
  return (
    <Card className="w-full max-w-sm mx-auto bg-white dark:bg-gray-900 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={avatar} 
              alt={username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gradient-to-r from-pink-500 to-purple-500"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">{username}</span>
              {verified && (
                <Badge className="bg-blue-500 text-white text-xs px-1 py-0">✓</Badge>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">2h</span>
          </div>
        </div>
        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Image */}
      <div className="relative">
        <img 
          src={image} 
          alt="Post"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
            <button className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors">
              <Share className="w-6 h-6" />
            </button>
          </div>
          <button className="text-gray-700 dark:text-gray-300 hover:text-yellow-500 transition-colors">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Likes */}
        <div className="mb-2">
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            {likes.toLocaleString()} likes
          </span>
        </div>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-semibold text-gray-900 dark:text-white mr-2">{username}</span>
          <span className="text-gray-700 dark:text-gray-300">{caption}</span>
        </div>

        {/* View comments */}
        <button className="text-gray-500 dark:text-gray-400 text-sm mt-2 hover:text-gray-700 dark:hover:text-gray-200">
          View all 42 comments
        </button>
      </div>
    </Card>
  );
};