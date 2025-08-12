import React from 'react';
import { Smartphone, Monitor, ArrowRight } from 'lucide-react';

const ConnectionVisual = () => {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 shadow-sm" style={{backgroundColor: '#f5f5f9'}}>
      <div className="text-center text-gray-600 text-xs uppercase tracking-wider mb-5 font-semibold">
        Connect to Claude Code Anywhere
      </div>
      <div className="flex items-center justify-around gap-4">
        <div className="text-center flex-1">
          <div className="w-16 h-16 bg-gray-50 border-2 border-indigo-500 rounded-xl mx-auto mb-2 flex items-center justify-center">
            <Monitor className="w-7 h-7 text-indigo-600" />
          </div>
          <div className="text-gray-700 text-xs font-medium">Any Computer</div>
          <div className="text-indigo-600 text-xs mt-1">Laptop • VPS • Cloud</div>
        </div>
        
        <div className="text-green-500 text-2xl animate-pulse">
          <ArrowRight className="w-6 h-6" />
        </div>
        
        <div className="text-center flex-1">
          <div className="w-16 h-16 bg-gray-50 border-2 border-indigo-500 rounded-xl mx-auto mb-2 flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-indigo-600" />
          </div>
          <div className="text-gray-700 text-xs font-semibold">Your Phone</div>
          <div className="text-indigo-600 text-xs mt-1 font-medium">Full Control</div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionVisual;
