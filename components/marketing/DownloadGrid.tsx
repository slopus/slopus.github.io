import React from 'react';
import { Globe } from 'lucide-react';
import Terminal from '../Terminal';
import GooglePlayButton from '../GooglePlayButton';
import AppStoreButton from '../AppStoreButton';

const DownloadGrid = () => {
  return (
    <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 border border-slate-700/60 shadow-xl shadow-slate-900/20 backdrop-blur-sm">
      {/* Installation Command */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3 text-center" style={{textShadow: 'rgba(0, 0, 0, 0.8) 0px 1px 4px'}}>
          Quick Start
        </h3>
        <Terminal command="npm install happy-coder && happy" />
      </div>

      {/* Download Buttons */}
      <div className="space-y-3">
        <div className="text-center text-slate-300 text-sm mb-3" style={{textShadow: 'rgba(0, 0, 0, 0.8) 0px 1px 4px'}}>
          Or download the app:
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex justify-center items-center">
            <AppStoreButton href="https://apps.apple.com/app/happy-coder" />
          </div>
          
          <div className="flex justify-center items-center">
            <GooglePlayButton href="https://play.google.com/store/apps/details?id=com.happycoder" />
          </div>
        </div>
        
        <button className="w-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-green-500/30 hover:bg-green-500/10 rounded-xl p-4 flex flex-col items-center justify-center min-h-[80px] active:scale-95 transition-all duration-200 shadow-lg">
          <Globe className="w-6 h-6 text-green-400 mb-1" />
          <span className="text-white text-sm font-medium">Use Web App (No Install)</span>
        </button>
      </div>
    </div>
  );
};

export default DownloadGrid;
