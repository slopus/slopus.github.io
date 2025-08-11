import React from 'react';
import { Smartphone, Monitor, ArrowRight } from 'lucide-react';

const ConnectionVisual = () => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="text-center text-gray-500 text-xs uppercase tracking-wider mb-5">
        Connect to Claude Code Anywhere
      </div>
      <div className="flex items-center justify-around gap-4">
        <div className="text-center flex-1">
          <div className="w-16 h-16 bg-black border-2 border-indigo-500 rounded-xl mx-auto mb-2 flex items-center justify-center">
            <Monitor className="w-7 h-7 text-indigo-400" />
          </div>
          <div className="text-gray-300 text-xs font-medium">Any Computer</div>
          <div className="text-indigo-400 text-xs mt-1">Laptop • VPS • Cloud</div>
        </div>
        
        <div className="text-green-400 text-2xl animate-pulse">
          <ArrowRight className="w-6 h-6" />
        </div>
        
        <div className="text-center flex-1">
          <div className="w-16 h-16 bg-black border-2 border-indigo-500 rounded-xl mx-auto mb-2 flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-indigo-400" />
          </div>
          <div className="text-gray-300 text-xs font-medium">Your Phone</div>
          <div className="text-indigo-400 text-xs mt-1">Full Control</div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionVisual;
