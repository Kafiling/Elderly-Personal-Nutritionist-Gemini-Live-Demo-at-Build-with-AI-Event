import React, { useState, useEffect } from 'react';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  delay?: number; // Optional delay for staggered animations
}

const Section: React.FC<SectionProps> = ({ title, children, className = '', titleClassName = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <section 
      className={`bg-white p-6 sm:p-8 rounded-2xl shadow-xl transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} ${className}`}
      style={{ transitionDelay: `${delay}ms`}} // Apply initial delay if needed for staggered effect
    >
      {title && (
        <h2 className={`text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200 ${titleClassName}`}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};

export default Section;