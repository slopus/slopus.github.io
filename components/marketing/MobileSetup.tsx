import React from 'react';

export default function MobileSetup() {
  return (
    <div className="rounded-2xl p-5 shadow-sm border border-gray-200 text-left" style={{backgroundColor: '#f5f5f9'}}>
      {/* Title */}
      <h2 className="text-lg font-bold text-slate-900 mb-4 text-center">
        Setup in 60 seconds
      </h2>
      
      {/* Step 1 */}
      <div className="flex items-center mb-3">
        <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-2.5 flex-shrink-0">
          1
        </div>
        <div className="flex-1">
          <code className="bg-slate-900 text-yellow-400 px-2.5 py-1.5 rounded-md text-xs font-mono inline-block">
            npm install -g happy-coder
          </code>
        </div>
      </div>
      
      {/* Step 2 */}
      <div className="flex items-center mb-3">
        <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-2.5 flex-shrink-0">
          2
        </div>
        <div className="flex-1">
          <code className="bg-slate-900 text-yellow-400 px-2.5 py-1.5 rounded-md text-xs font-mono inline-block">
            happy connect
          </code>
        </div>
      </div>
      
      {/* Step 3 - Pair Your Device */}
      <div className="flex items-start mb-4">
        <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-2.5 flex-shrink-0 mt-0.5">
          3
        </div>
        <div className="flex-1">
          <div className="text-sm text-black font-semibold mb-2">
            Pair Your Device
          </div>
          <div className="bg-slate-800 rounded-lg p-3.5 border border-slate-700">
            <div className="text-slate-400 text-xs leading-relaxed">
              <span className="text-blue-400 font-semibold">Mobile:</span> Scan QR code
              <br />
              <span className="text-blue-400 font-semibold">Web:</span> Paste connection token
            </div>
          </div>
        </div>
      </div>
      
      {/* Connected Status */}
      <div className="text-center text-xs leading-relaxed text-slate-500">
        <span className="text-blue-500 font-semibold">Connected!</span> Claude Code starts automatically.
        <br />
        Real-time sync enabled. Code from anywhere.
      </div>
    </div>

  );
}
