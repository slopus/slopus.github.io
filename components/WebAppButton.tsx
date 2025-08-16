import React from 'react';
import { ExternalLink } from 'lucide-react';

interface WebAppButtonProps {
  href: string;
  className?: string;
}

export default function LaunchWebAppButton({ href, className = '' }: WebAppButtonProps) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`inline-flex items-center justify-center text-white rounded-xl hover:opacity-90 transition-opacity font-medium w-[170px] h-[50px] sm:w-[203px] sm:h-[60px] overflow-hidden ${className}`}
      style={{ backgroundColor: '#000', boxShadow: '0 0 0 1px #a2a2a1' }}
    >
      <ExternalLink 
        className="mr-2" 
        size={20}
      />
      <span style={{ fontSize: '14.25px' }}>Launch Web App</span>
    </a>
  );
}
