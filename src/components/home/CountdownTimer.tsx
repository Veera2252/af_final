import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set target date to 2 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const offers = [
    { text: "50% OFF Full Stack Course", color: "from-red-500 to-red-600" },
    { text: "Free Certification", color: "from-green-500 to-green-600" },
    { text: "Lifetime Access", color: "from-blue-500 to-blue-600" },
    { text: "1-on-1 Mentorship", color: "from-purple-500 to-purple-600" },
    { text: "Job Guarantee", color: "from-orange-500 to-orange-600" },
    { text: "Money Back Guarantee", color: "from-pink-500 to-pink-600" }
  ];

  return (
<div className="bg-blue-800 container-fluid mx-auto px-20 py-2">
  <div className="flex items-center justify-between h-16">

    {/* Column 1 - Google Rating */}
    <div className="flex flex-col items-center justify-center text-center gap-2">
      <h3 className="text-lg font-bold text-white">Google Rating </h3>
      <div className="flex items-center gap-1">
        <span className="text-yellow-400 text-xl">★★★★★</span>
        <span className="text-white font-semibold">5/5</span>
      </div>
    </div>

    {/* Column 2 - Countdown Timer */}
    <div className="flex items-center justify-center gap-2 text-md text-white font-medium">
      <Clock className="h-4 w-4" />
      <span>Enroll within</span>
      <div className="flex items-center gap-2">
        <span className="bg-[#FC6A03]/90 text-primary-foreground px-2 py-1 rounded font-bold">
          {timeLeft.days}d
        </span>
        <span className="bg-[#FC6A03]/90 text-primary-foreground px-2 py-1 rounded font-bold">
          {timeLeft.hours}h
        </span>
        <span className="bg-[#FC6A03]/90 text-primary-foreground px-2 py-1 rounded font-bold">
          {timeLeft.minutes}m
        </span>
        <span className="bg-[#FC6A03]/90 text-primary-foreground px-2 py-1 rounded font-bold">
          {timeLeft.seconds}s
        </span>
      </div>
      <span>to claim </span>
      <span className="bg-black text-primary-foreground px-2 py-1 rounded font-bold">
        50% OFF! 🎯
      </span>
    </div>

    {/* Column 3 - Special Offers */}
    <div className="w-full lg:w-[40%] flex flex-col items-center justify-end gap-3">

      <div className="w-full max-w-[800px] overflow-hidden">
        <div className="flex items-center gap-3 whitespace-nowrap will-change-transform animate-marquee-left">
          {[...offers, ...offers].map((offer, index) => (
            <span
              key={index}
              className={`inline-block bg-gradient-to-r ${offer.color} text-white px-4 py-2 rounded-full font-bold text-[12px]`}
            >
              {offer.text}
            </span>
          ))}
        </div>
      </div>
    </div>

  </div>
</div>

  );
};
