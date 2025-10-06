import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent Successfully! 🎉",
        description: "Thank you for your inquiry. Our team will get back to you within 24 hours.",
      });
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        course: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 relative overflow-hidden bg-white">
      {/* Parallax Background */}
      <div className="absolute inset-0 ">
        <div className="absolute inset-0  bg-grid-16 pointer-events-none" />
        {/* Floating elements for parallax effect */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Contact Us
            </span>
          </div>
          <h2 className="text-4xl md:text-3xl font-bold text-foreground mb-6">
            Ready to Start Your <span className="bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">Learning Journey?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Connect with our expert team today and discover how Alpha Fly can transform your career through cutting-edge education and hands-on experience
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <Card className="relative backdrop-blur-xl bg-card/60 border border-border/50 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-lg" />
            <CardHeader className="relative">
              <CardTitle className="text-3xl text-card-foreground font-bold mb-2">Send us a Message</CardTitle>
              <p className="text-muted-foreground">We'll get back to you within 24 hours</p>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-card-foreground font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-background/50 backdrop-blur-sm border border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all h-12"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-card-foreground font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-background/50 backdrop-blur-sm border border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all h-12"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-card-foreground font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-background/50 backdrop-blur-sm border border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all h-12"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="course" className="text-card-foreground font-medium">Course of Interest</Label>
                    <Input
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      placeholder="e.g., Full Stack Development"
                      className="bg-background/50 backdrop-blur-sm border border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all h-12"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="message" className="text-card-foreground font-medium">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="bg-background/50 backdrop-blur-sm border border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all resize-none"
                    placeholder="Tell us about your learning goals and any questions you have..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#0866FF]/90 hover:bg-primary/90 text-primary-foreground py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {[
              {
                icon: MapPin,
                title: "Visit Our Campus",
                content: [" K S Complex, Old Bus Stand, Subban Chetty Street, ", "Suppan Ragavan Colony,", "NRT Nagar, Theni, Tamil Nadu 625531"],
                gradient: "from-primary/20 to-primary/10"
              },
              {
                icon: Phone,
                title: "Call Us",
                content: ["+91 8015 8016 89"],
                gradient: "from-secondary/20 to-secondary/10"
              },
              {
                icon: Mail,
                title: "Email Us",
                content: ["alphafly.edu@gmail.com"],
                gradient: "from-accent/20 to-accent/10"
              },
              // {
              //   icon: Clock,
              //   title: "Office Hours",
              //   content: ["Monday - Friday: 9:00 AM - 6:00 PM", "Saturday: 10:00 AM - 4:00 PM", "Sunday: Closed"],
              //   gradient: "from-primary/20 to-secondary/10"
              // }
            ].map((item, index) => (
              <Card key={index} className="group relative backdrop-blur-xl bg-card/60 border border-border/50 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-105">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="p-8 relative">
                  <div className="flex items-start gap-6">
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                      <item.icon className="h-8 w-8 text-primary group-hover:text-secondary transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-card-foreground mb-3 text-xl group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="space-y-1">
                        {item.content.map((line, lineIndex) => (
                          <p key={lineIndex} className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};