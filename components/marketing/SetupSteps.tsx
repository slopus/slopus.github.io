import React from 'react';

const SetupSteps = () => {
  const steps = [
    {
      number: "1",
      content: (
        <>
          Install Claude Code on ANY computer:
          <br />
          <code className="bg-black px-2 py-1 rounded text-green-400 text-xs font-mono">
            npm install -g claude-code
          </code>
        </>
      )
    },
    {
      number: "2",
      content: (
        <>
          Start a session: <code className="bg-black px-2 py-1 rounded text-green-400 text-xs font-mono">happy-cli</code>
          <br />
          <span className="text-gray-500 text-xs italic">
            Works on: MacBook, AWS EC2, Digital Ocean, Replit, GitHub Codespaces...
          </span>
        </>
      )
    },
    {
      number: "3",
      content: "Connect from your phone anywhere with internet"
    }
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
      <h3 className="text-white font-semibold text-base mb-4">Works With Any Setup</h3>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.number} className="flex items-start gap-3">
            <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {step.number}
            </span>
            <span className="text-gray-300 text-sm leading-relaxed">{step.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetupSteps;
