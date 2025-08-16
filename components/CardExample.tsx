import React from 'react';
import Card from './Card';

// Example usage of the Card component
const CardExample: React.FC = () => {
  // Example rocket icon (same as in your provided HTML)
  const RocketIcon = (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="lucide lucide-rocket" 
      aria-hidden="true"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
    </svg>
  );

  // Example book icon
  const BookIcon = (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="lucide lucide-book" 
      aria-hidden="true"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
    </svg>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Card with link */}
      <Card
        icon={RocketIcon}
        title="Quick Start"
        description="Create your first task"
        href="/docs/getting-started/quick-start"
      />
      
      {/* Card without link */}
      <Card
        icon={BookIcon}
        title="Documentation"
        description="Learn how to use all features"
      />
      
      {/* Card with custom className */}
      <Card
        icon={RocketIcon}
        title="Advanced Usage"
        description="Explore advanced configuration options"
        href="/docs/advanced"
        className="border-blue-200"
      />
    </div>
  );
};

export default CardExample;
