import { useEffect } from "react";

const TestimonialsSection = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section id="testimonials" className="py-20 bg-gray-800/30 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What Our <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Students Say</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Don't just take our word for it - hear from our successful students who have transformed their careers.
          </p>
        </div>
        {/* Elfsight Google Reviews | AlphaFly */}
        <div className="flex justify-center mt-10">
          <div className="elfsight-app-a7b120ec-7306-4e76-8c57-4a04e5e999eb" data-elfsight-app-lazy></div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
