
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Phone,
  Mail,
  BookOpen,
  CheckCircle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface InquiryForm {
  name: string;
  email: string;
  phone: string;
  course_interest: string;
  message: string;
}

export const CourseChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! 👋 I\'m here to help you with course inquiries. What would you like to know about our courses?',
      timestamp: new Date()
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InquiryForm>({
    name: '',
    email: '',
    phone: '',
    course_interest: '',
    message: ''
  });
  const { toast } = useToast();

  const predefinedResponses = {
    'courses': 'We offer various courses including:\n• Web Development (Frontend & Backend)\n• Data Science & Machine Learning\n• UI/UX Design\n• Digital Marketing\n• Mobile App Development\n• Cloud Computing\n\nWould you like more details about any specific course?',
    'web development': 'Our Web Development course covers:\n• HTML, CSS, JavaScript\n• React.js & Node.js\n• Database Management\n• API Development\n• Deployment & DevOps\n\nDuration: 6 months\nMode: Online & Offline\nCertification: Industry recognized\n\nWould you like to get more information or speak with our counselor?',
    'data science': 'Our Data Science course includes:\n• Python Programming\n• Statistics & Mathematics\n• Machine Learning\n• Data Visualization\n• Big Data Analytics\n\nDuration: 8 months\nMode: Online & Offline\nPlacement Support: 100%\n\nInterested in enrolling or need more details?',
    'ui/ux': 'Our UI/UX Design course covers:\n• Design Principles\n• Figma & Adobe XD\n• User Research\n• Prototyping\n• Portfolio Development\n\nDuration: 4 months\nMode: Online\nIncludes: Live Projects\n\nWant to know about admission process?',
    'fees': 'Our course fees vary based on the program:\n• Web Development: ₹45,000\n• Data Science: ₹65,000\n• UI/UX Design: ₹35,000\n• Digital Marketing: ₹25,000\n\nWe offer:\n• EMI options available\n• Early bird discounts\n• Scholarship programs\n\nWould you like to discuss payment options?',
    'placement': 'We have excellent placement support:\n• 95% placement rate\n• Average salary: ₹8.5 LPA\n• 500+ hiring partners\n• Dedicated placement team\n• Interview preparation\n• Resume building support\n\nWant to connect with our placement team?',
    'contact': 'You can reach us at:\n📍 No 10, K S Complex, Old Bus Stand, Theni, Tamil Nadu\n📞 080158 01689\n✉️ info@alphaflyeducation.com\n\nWould you like to schedule a counseling session?'
  };

  const addMessage = (content: string, type: 'bot' | 'user') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserMessage = (userInput: string) => {
    addMessage(userInput, 'user');
    
    const input = userInput.toLowerCase();
    let botResponse = '';

    // Find matching response
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (input.includes(key)) {
        botResponse = response;
        break;
      }
    }

    if (!botResponse) {
      botResponse = 'Thank you for your inquiry! I\'d be happy to help you with more specific information. You can ask me about:\n\n• Available Courses\n• Fees & Payment Options\n• Placement Support\n• Contact Information\n\nOr would you like to fill out an inquiry form to get personalized assistance from our counselors?';
    }

    setTimeout(() => {
      addMessage(botResponse, 'bot');
      
      // Suggest form if user seems interested
      if (input.includes('enroll') || input.includes('admission') || input.includes('counselor') || input.includes('more information')) {
        setTimeout(() => {
          addMessage('Would you like to fill out a quick inquiry form? Our counselors will get back to you within 24 hours with detailed information! 📝', 'bot');
        }, 1000);
      }
    }, 1000);
  };

  const handleQuickReply = (message: string) => {
    handleUserMessage(message);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('course_inquiries')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          course_interest: formData.course_interest,
          message: formData.message
        }]);

      if (error) throw error;

      toast({
        title: "Inquiry Submitted Successfully!",
        description: "Our counselors will contact you within 24 hours.",
      });

      addMessage(`Thank you ${formData.name}! Your inquiry has been submitted successfully. Our counselors will contact you at ${formData.email} within 24 hours. 🎉`, 'bot');
      
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        course_interest: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickReplies = [
    'Available Courses',
    'Web Development',
    'Data Science',
    'Fees & Payment',
    'Placement Support',
    'Contact Information'
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-[#FC6A15] to-[#FC6A03] hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-96 h-[600px] shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Course Assistant</CardTitle>
                <p className="text-sm text-blue-100">Ask me about our courses!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-black/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-[calc(100%-80px)] flex flex-col">
          {!showForm ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'bot' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {message.type === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'bot'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      }`}>
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Replies */}
              <div className="p-4 border-t">
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickReplies.map((reply, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer text-xs hover:bg-white hover:text-black transition-colors duration-200"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Get Personalized Assistance
                </Button>
              </div>
            </>
          ) : (
            /* Inquiry Form */
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Inquiry Form</h3>
                <p className="text-sm text-gray-600">Fill out this form and our counselors will contact you soon!</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <BookOpen className="h-4 w-4 inline mr-1" />
                    Course Interest
                  </label>
                  <Input
                    type="text"
                    value={formData.course_interest}
                    onChange={(e) => setFormData(prev => ({ ...prev, course_interest: e.target.value }))}
                    placeholder="e.g., Web Development, Data Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <Textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us about your learning goals and any specific questions..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Back to Chat
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Inquiry
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
