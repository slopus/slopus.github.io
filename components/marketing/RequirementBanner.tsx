import React from 'react';
import { Globe } from 'lucide-react';

const RequirementBanner = () => {
  return (
    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-xl p-3 mb-6 flex items-start gap-3">
      <Globe className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div>
        <div className="font-semibold text-sm">Works with ANY computer running Claude Code</div>
        <div className="text-sm opacity-90">Local machine, cloud server, or remote workstation</div>
      </div>
    </div>
  );
};

export default RequirementBanner;
