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
      className={`group px-2 py-2 sm:px-4 sm:py-4 border border-border rounded-lg font-semibold transition-all hover:border-primary hover:text-primary hover:bg-primary/5 flex items-center gap-3 ${className}`}
    >
      <ExternalLink 
        className="text-lg group-hover:text-emerald-500 transition-colors" 
        size={16}
      />
      <span>Launch Web App</span>
    </a>
  );
}
