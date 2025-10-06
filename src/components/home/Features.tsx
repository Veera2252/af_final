import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, TrendingUp, Shield, Zap, BookOpen } from 'lucide-react';

const Features = () => {
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

  return (
    <section id="why-choose" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose <span className="bg-gradient-to-r from-orange-700 to-orange-600 bg-clip-text text-transparent">Alpha Fly</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of successful graduates who have transformed their careers with our proven methodology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;