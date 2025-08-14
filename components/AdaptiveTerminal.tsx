import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface AdaptiveTerminalProps {
  command: string;
  className?: string;
}

const AdaptiveTerminal: React.FC<AdaptiveTerminalProps> = ({ command, className = "" }) => {
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

  return (
    <div className={`relative rounded-lg transition-all duration-200 p-4 shadow-lg
      bg-gray-50 border border-gray-300 border-gray-200 hover:border-blue-400 hover:bg-blue-50
      dark:bg-white/5 dark:backdrop-blur-sm dark:border-white/10 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10
      ${className}`}>
      <button 
        onClick={handleCopy}
        className={`float-right -mr-2 -mt-2 p-1.5 rounded-md transition-all duration-200 group
          hover:bg-gray-200 dark:hover:bg-white/10 ${
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
            className="transition-colors text-gray-500 group-hover:text-blue-600 dark:text-white/50 dark:group-hover:text-blue-400"
          />
        )}
      </button>
      <div className="flex items-center text-left">
        <span className="font-mono text-sm mr-2 select-none self-start text-green-600 dark:text-green-400 
          [text-shadow:none] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
          $
        </span>
        <code className="font-mono text-sm tracking-wide text-gray-800 dark:text-[#f5e6d3]
          [text-shadow:none] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
          {command}
        </code>
      </div>
    </div>
  );
};

export default AdaptiveTerminal;
