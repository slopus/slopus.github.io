import React from 'react';
import { Globe } from 'lucide-react';

const DownloadGrid = () => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <button className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 flex flex-col items-center justify-center min-h-[80px] active:scale-95 transition-transform">
        <span className="text-2xl mb-1">🍎</span>
        <span className="text-white text-sm font-medium">App Store</span>
      </button>
      
      <button className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 flex flex-col items-center justify-center min-h-[80px] active:scale-95 transition-transform">
        <span className="text-2xl mb-1">🤖</span>
        <span className="text-white text-sm font-medium">Google Play</span>
      </button>
      
      <button className="col-span-2 bg-gray-900 border-2 border-green-500 rounded-xl p-4 flex flex-col items-center justify-center min-h-[80px] active:scale-95 transition-transform">
        <Globe className="w-6 h-6 text-green-400 mb-1" />
        <span className="text-white text-sm font-medium">Use Web App (No Install)</span>
      </button>
    </div>
  );
};

export default DownloadGrid;
