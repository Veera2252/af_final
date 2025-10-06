import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Menu, X, Star, Award, Users, TrendingUp, Shield, Zap, BookOpen, Target, CheckCircle, Play } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { CountdownTimer } from "@/components/home/CountdownTimer";
import CourseCarousel from "@/components/home/CourseCarousel";
import { ContactForm } from "@/components/home/ContactForm";
import Features from "@/components/home/Features";
import TestimonialsSection from "@/components/TestimonialsSection";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // If user is authenticated, redirect to dashboard
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (profile.role === 'staff') {
        navigate('/staff/dashboard');
      } else if (profile.role === 'student') {
        navigate('/student/dashboard');
      }
    }
  }, [user, profile, navigate]);

  const features = [
    {
      icon: Award,
      title: "Industry Experts",
      description: "Learn from professionals with 10+ years of real-world experience",
      color: "bg-gradient-to-r from-yellow-400 to-yellow-600"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join 50,000+ students in our active learning community",
      color: "bg-gradient-to-r from-green-400 to-green-600"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "95% of our graduates get promoted or land better jobs",
      color: "bg-gradient-to-r from-blue-400 to-blue-600"
    },
    {
      icon: Shield,
      title: "Lifetime Access",
      description: "Keep learning with lifetime access to all course materials",
      color: "bg-gradient-to-r from-purple-400 to-purple-600"
    },
    {
      icon: Zap,
      title: "Hands-on Projects",
      description: "Build real-world projects for your professional portfolio",
      color: "bg-gradient-to-r from-pink-400 to-pink-600"
    },
    {
      icon: BookOpen,
      title: "Flexible Learning",
      description: "Study at your own pace with 24/7 online access",
      color: "bg-gradient-to-r from-indigo-400 to-indigo-600"
    }
  ];

  const videos = [
    {
      id: 1,
      title: "Programming Fundamentals",
      src: "/Videos/alphavideo1.mp4",
      thumbnail: "/thumbnails/a1.jpg"
    },
    {
      id: 2,
      title: "Web Development Mastery", 
      src: "/Videos/alphavideo2.mp4",
      thumbnail: "/thumbnails/a2.jpg"
    },
    {
      id: 3,
      title: "Data Science Excellence",
      src: "/Videos/alphavideo3.mp4", 
      thumbnail: "/thumbnails/a3.jpg"
    }
  ];



  return (
    <div className="min-h-screen">
      {/* Countdown Timer */}
      <CountdownTimer />
      

      {/* Navigation Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">

                <img src="thumbnails/logo1.png" alt="Alpha Fly Logo" className="h-16 w-55" />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#courses" className="text-muted-foreground hover:text-foreground transition-colors">Courses</a>
              <a href="#why-choose" className="text-muted-foreground hover:text-foreground transition-colors">Why Choose Us</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              <a href="/admin-reset" className="text-red-600 hover:text-red-700 transition-colors text-sm">Admin Reset</a>
              <Button 
                variant="ghost" 
                className="text-primary font-semibold"
                onClick={() => navigate('/login')}
              >
                LOGIN
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:text-muted-foreground"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </nav>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col space-y-4">
                <a href="#courses" className="text-muted-foreground">Courses</a>
                <a href="#why-choose" className="text-muted-foreground">Why Choose Us</a>
                <a href="#contact" className="text-muted-foreground">Contact</a>
                <Button 
                  variant="ghost" 
                  className="text-primary font-semibold w-fit"
                  onClick={() => navigate('/login')}
                >
                  LOGIN
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-fit"
                  onClick={() => navigate('/login')}
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

<section className="relative bg-gradient-to-br from-[#0866FF] via-[#1E90FF] to-[#0A4D8C] text-white py-5 overflow-hidden">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-10">
    <div
      className="w-full h-full bg-repeat"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    ></div>
  </div>


  {/* Hero Section */}
  <div className="mt-10 container mx-auto px-2">
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-4">
        Next Generation Learning Space
      </h1>
      <p className="mb-2">
        Unlocking the Power of Minds
      </p>
      {/* <p className="text-white/80">
        Watch these sample lessons from our most popular courses
      </p> */}
    </div>

    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
      {videos.map((video) => (
        <Card
          key={video.id}
          className="bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden hover:bg-white/20 transition-all"
        >
          <CardContent className="p-0">
            <div className="relative">
              <video
                className="w-full h-[280px] object-cover"
                controls
                preload="metadata"
                poster={video.thumbnail}
              >
                <source src={video.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors flex items-center justify-center">
                <Play className="h-12 w-12 text-white opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                {video.title}
              </h4>
              <p className="text-white/80 text-sm">
                Experience our hands-on approach to learning with real-world
                projects.
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>

      {/* Why Choose Alpha Fly */}

      <div id="features">
        <Features />
      </div>

      {/* Course Carousel */}
      <div id="courses">
        <CourseCarousel />
      </div>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Contact Form */}
      <ContactForm />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-primary rounded text-primary-foreground px-3 py-1 font-bold text-xl">
                  AF
                </div>
                <span className="text-xl font-semibold text-foreground">Alpha Fly</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Transforming careers through quality education and practical skills development since 2013.
              </p>
            </div>

            {/* Courses */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Courses</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Full Stack Development</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Data Science & AI</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cloud Computing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Mobile Development</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Career Support</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>info@alphafly.com</li>
                <li>+1 (555) 123-4567</li>
                <li>Follow us on social media</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Alpha Fly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;