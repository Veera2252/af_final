
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { InstagramCard } from '@/components/home/InstagramCard';
import { CourseCarousel } from '@/components/home/CourseCarousel';
import { TestimonialCard } from '@/components/home/TestimonialCard';
import { ContactForm } from '@/components/home/ContactForm';
import { CourseChatbot } from '@/components/home/CourseChatbot';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Star,
  Play,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Globe,
  Shield,
  Zap,
  Target,
  Lightbulb,
  Rocket,
  Heart,
  Code,
  Palette,
  BarChart3,
  Smartphone,
  Camera,
  Headphones,
  LogIn
} from 'lucide-react';

export const NewHomePage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Auto-redirect authenticated users to their appropriate dashboard
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

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' },
  ];

  const instagramPosts = [
    {
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=500',
      username: 'alphaflyedu',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      likes: 1234,
      caption: 'New Web Development course launching soon! 🚀 #coding #webdev',
      verified: true
    },
    {
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=500',
      username: 'alphaflyedu',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      likes: 892,
      caption: 'Students working on their final projects! Amazing progress 💪 #students #learning',
      verified: true
    },
    {
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=500',
      username: 'alphaflyedu',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      likes: 2156,
      caption: 'AI & Machine Learning workshop was incredible! 🤖 #AI #MachineLearning',
      verified: true
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Full Stack Developer',
      company: 'TCS',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 5,
      testimonial: 'AlphaFly transformed my career completely. The instructors are world-class and the curriculum is industry-relevant. I landed my dream job within 3 months of completing the course!'
    },
    {
      name: 'Rajesh Kumar',
      role: 'Data Scientist',
      company: 'Infosys',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 5,
      testimonial: 'The Python for Data Science course exceeded my expectations. The hands-on projects and real-world applications made learning enjoyable and practical. Highly recommended!'
    },
    {
      name: 'Anita Patel',
      role: 'UI/UX Designer',
      company: 'Wipro',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 5,
      testimonial: 'Amazing learning experience! The design course helped me transition from a different field to UI/UX design. The portfolio projects were incredibly valuable for job interviews.'
    }
  ];

  const features = [
    {
      icon: Globe,
      title: 'Global Recognition',
      description: 'Industry-recognized certificates accepted worldwide'
    },
    {
      icon: Shield,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of experience'
    },
    {
      icon: Zap,
      title: 'Hands-on Learning',
      description: 'Practical projects and real-world applications'
    },
    {
      icon: Target,
      title: 'Career Support',
      description: '100% job placement assistance and career guidance'
    }
  ];

  const stats = [
    { number: '15+', label: 'Years Experience' },
    { number: '10K+', label: 'Students Trained' },
    { number: '95%', label: 'Success Rate' },
    { number: '500+', label: 'Companies Hiring' }
  ];

  if (user && profile) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AlphaFly
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Computer Education</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <Button
                onClick={() => setShowLoginModal(true)}
                className="hidden md:inline-flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      activeSection === item.id
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium">
                  🚀 15+ Years of Excellence in Education
                </Badge>
                
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Transform Your
                  </span>
                  <br />
                  <span className="text-gray-900 dark:text-white">
                    Career with
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AlphaFly
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Master cutting-edge technologies with industry experts. Join thousands of successful graduates who transformed their careers with our comprehensive courses.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => scrollToSection('courses')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Explore Courses
                </Button>
                <Button
                  size="lg"
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Login to Dashboard
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Instagram Cards */}
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Follow Our Journey
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Stay updated with our latest courses and student success stories
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                {instagramPosts.slice(0, 2).map((post, index) => (
                  <InstagramCard key={index} {...post} />
                ))}
              </div>
              
              {/* Third card on larger screens */}
              <div className="hidden xl:block">
                <InstagramCard {...instagramPosts[2]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose AlphaFly?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We provide world-class education with a focus on practical skills and career advancement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium mb-4">
              🎓 Popular Courses
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Master In-Demand Skills
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose from our comprehensive range of courses designed by industry experts
            </p>
          </div>

          <CourseCarousel />

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => scrollToSection('contact')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
            >
              View All Courses
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 text-sm font-medium mb-4">
              💬 Student Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Hear from our successful graduates who transformed their careers with AlphaFly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>

          {/* Additional Stats */}
          <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Join Thousands of Successful Graduates
              </h3>
              <p className="text-blue-100 text-lg">
                Our students work at top companies worldwide
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold">95%</div>
                <div className="text-blue-100">Job Placement Rate</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">₹8.5L</div>
                <div className="text-blue-100">Average Salary</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">500+</div>
                <div className="text-blue-100">Hiring Partners</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">4.9/5</div>
                <div className="text-blue-100">Student Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-medium mb-4">
              📞 Get In Touch
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Contact us today for a free consultation and take the first step towards your dream career
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AlphaFly
                  </span>
                  <div className="text-xs text-gray-400">Computer Education</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transforming careers through quality education and practical skills development since 2008.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Icons */}
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <span className="text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </div>
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                  <span className="text-xs font-bold">t</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Courses */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Popular Courses</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Web Development</li>
                <li className="hover:text-white transition-colors cursor-pointer">Data Science</li>
                <li className="hover:text-white transition-colors cursor-pointer">UI/UX Design</li>
                <li className="hover:text-white transition-colors cursor-pointer">Machine Learning</li>
                <li className="hover:text-white transition-colors cursor-pointer">Digital Marketing</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-gray-400">
                <p className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">📍</span>
                  <span>No 10, K S Complex, Old Bus Stand, Theni, Tamil Nadu 625531</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="text-green-400">📞</span>
                  <span>080158 01689</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="text-red-400">✉️</span>
                  <span>info@alphaflyeducation.com</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AlphaFly Computer Education. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Login to Your Account</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowLoginModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </Button>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      )}

      {/* Course Chatbot */}
      <CourseChatbot />
    </div>
  );
};
