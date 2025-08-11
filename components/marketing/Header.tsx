import React from 'react';
import { Terminal } from 'lucide-react';

const Header = () => {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-5 flex items-center justify-center">
        <Terminal className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-3">
        Claude Code Remote
      </h1>
      <p className="text-gray-400 text-sm px-4">
        Control Claude Code on any internet-connected computer
      </p>
    </div>
  );
};

export default Header;
