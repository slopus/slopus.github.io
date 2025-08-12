import React from 'react';
import { Check } from 'lucide-react';

const Features = () => {
  const features = [
    "Connect to Claude Code on any internet-connected machine",
    "Works with cloud servers (AWS, Azure, Digital Ocean)",
    "Multiple concurrent sessions across different machines",
    "100% Free & Open Source (MIT License)"
  ];

  return (
    <div className="border border-gray-200 rounded-2xl p-5 shadow-sm" style={{backgroundColor: '#f5f5f9'}}>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 text-left">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
