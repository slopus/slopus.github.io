import React from 'react';

const TextBasedFeatures = () => {
  const features = [
    {
      title: "Zero workflow distribution",
      description: "Keep using your favorite tools, editors, and development environments exactly as before. Happy integrates with your existing setup without requiring any changes to how you work."
    },
    {
      title: "Multiple Active Sessions", 
      description: "Run several Claude Code instances simultaneously across different projects. Switch between frontend, backend, and DevOps tasks without losing context or momentum."
    },
    {
      title: "Full console parity",
      description: "Access all Claude Code features on your phone. From plan mode to custom agents, if it works in the terminal, it works in Happy."
    },
    {
      title: "Open source and Free",
      description: "Well organized codebase makes it easy to contribute. Friendly community."
    },
    {
      title: "Secure", 
      description: "Happy uses End to End Encryption. No one can read your messages or code."
    },
    {
      title: "Smart Push Notifications",
      description: "Get alerted when your input is needed, Get alerted when your input is needed, when code is ready to review, or when something went wrong."
    },
    {
      title: "Real-Time Voice Execution",
      description: "Speak commands and watch them execute instantly. Not just transcription - true voice-to-action that lets you code, debug, and manage projects while completely hands-free."
    }
  ];

  return (
    <>
      <h3 className="font-mono font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Why Happy?</h3>
      <div className="font-mono text-sm space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="text-gray-800 dark:text-gray-200">
            <div className="font-semibold mb-1">{feature.title}</div>
            <div className="flex">
              <span className="mr-1 text-gray-500 dark:text-gray-400">└─</span>
              <div className="leading-relaxed">{feature.description}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TextBasedFeatures;
