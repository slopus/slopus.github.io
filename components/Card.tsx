import React from 'react';

interface CardProps {
  /** The icon to display in the card (React element) */
  icon: React.ReactNode;
  /** The title text for the card */
  title: string;
  /** The description text for the card */
  description: string;
  /** Optional href to make the card clickable */
  href?: string;
  /** Optional className for additional styling */
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  icon, 
  title, 
  description, 
  href, 
  className = "" 
}) => {
  const cardClasses = `
    block rounded-lg border bg-fd-card p-4 text-fd-card-foreground 
    shadow-md transition-colors @max-lg:col-span-full 
    hover:bg-fd-accent/80
    dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100
    dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] dark:hover:bg-gray-700/80
    dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]
    ${className}
  `.trim();

  const content = (
    <>
      <div className="not-prose mb-2 w-fit rounded-md border bg-fd-muted p-1.5 text-fd-muted-foreground [&_svg]:size-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
        {icon}
      </div>
      <h3 className="not-prose mb-1 text-sm font-medium dark:text-gray-100">
        {title}
      </h3>
      <div className="text-sm text-fd-muted-foreground prose-no-margin dark:text-gray-300">
        <p>{description}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a 
        data-card="true" 
        className={cardClasses} 
        href={href}
      >
        {content}
      </a>
    );
  }

  return (
    <div 
      data-card="true" 
      className={cardClasses}
    >
      {content}
    </div>
  );
};

export default Card;
