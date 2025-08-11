import React from 'react';
import { Github } from 'lucide-react';

const GithubLink = () => {
  return (
    <div className="text-center py-5 border-t border-gray-800 mb-6">
      <a href="#" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors text-sm">
        <Github className="w-4 h-4" />
        View source on GitHub
      </a>
    </div>
  );
};

export default GithubLink;
