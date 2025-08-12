import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface TerminalProps {
  command: string;
  className?: string;
  variant?: 'dark' | 'light';
}

const Terminal: React.FC<TerminalProps> = ({ command, className = "", variant = 'light' }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setIsClicked(true);
      setIsCopied(true);
      
      // Reset the clicked state after animation
      setTimeout(() => setIsClicked(false), 150);
      
      // Reset the copied state after 1 second
      setTimeout(() => setIsCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isLight = variant === 'light';
  
  const containerClasses = isLight 
    ? 'bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
    : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-blue-500/30 hover:bg-blue-500/10';
    
  const copyButtonClasses = isLight
    ? 'hover:bg-gray-200'
    : 'hover:bg-white/10';
    
  const copyIconClasses = isLight
    ? 'text-gray-500 group-hover:text-blue-600'
    : 'text-white/50 group-hover:text-blue-400';
    
  const dollarSignClasses = isLight
    ? 'text-green-600'
    : 'text-green-400';
    
  const commandTextClasses = isLight
    ? 'text-gray-800'
    : 'text-[#f5e6d3]';
    
  const textShadow = isLight
    ? 'none'
    : 'rgba(0, 0, 0, 0.8) 0px 1px 4px';

  return (
    <div className={`relative rounded-lg transition-all duration-200 p-4 shadow-lg ${containerClasses} ${className}`}>
      <button 
        onClick={handleCopy}
        className={`float-right -mr-2 -mt-2 p-1.5 rounded-md transition-all duration-200 group ${copyButtonClasses} ${
          isClicked ? 'scale-95' : 'scale-100'
        }`}
        style={{
          shapeOutside: 'inset(0 0 0 0)',
          marginLeft: '8px',
          marginBottom: '4px'
        }}
      >
        {isCopied ? (
          <Check 
            size={16} 
            className="text-green-600 transition-colors" 
          />
        ) : (
          <Copy 
            size={16} 
            className={`transition-colors ${copyIconClasses}`}
          />
        )}
      </button>
      <div className="flex items-center text-left">
        <span className={`font-mono text-sm mr-2 select-none self-start ${dollarSignClasses}`} style={{textShadow}}>$</span>
        <code className={`font-mono text-sm tracking-wide ${commandTextClasses}`} style={{textShadow}}>
          {command}
        </code>
      </div>
    </div>
  );
};

export default Terminal;
