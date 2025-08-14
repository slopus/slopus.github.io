import React from 'react';

const TextBasedHowItWorks = () => {
  const parts = [
    {
      title: "CLI Program (happy)",
      description: "This runs on your computer. It starts Claude Code and watches what it does. Then it encrypts this information and sends it to a server."
    },
    {
      title: "Mobile App",
      description: "This runs on your phone. It gets the encrypted data from the server and shows you what Claude Code is doing. All the display code lives here."
    },
    {
      title: "Relay Server",
      description: "This connects your computer and phone. It passes encrypted messages between them. The server can't read your data. it just moves encrypted blobs around."
    }
  ];

  return (
    <>
      <h3 className="font-mono font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">How does it work?</h3>
      <div className="font-mono text-sm space-y-4">
        <div className="leading-relaxed text-gray-800 dark:text-gray-200">
          Start Happy CLI and you'll have a regular Claude Code session. But you can continue that same session from a mobile app{' '}
          (<a href="/download" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 underline">Download</a>){' '}
          or web app (<a href="https://app.happy.engineering/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 underline">https://app.happy.engineering/</a>)
        </div>
        
        <div className="text-gray-800 dark:text-gray-200">
          Happy has three parts that work together:
        </div>
        
        <div className="space-y-3">
          {parts.map((part, index) => (
            <div key={index} className="text-gray-800 dark:text-gray-200">
              <div className="font-semibold mb-1">{part.title}</div>
              <div className="flex">
                <span className="mr-1 text-gray-500 dark:text-gray-400">└─</span>
                <div className="leading-relaxed">{part.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TextBasedHowItWorks;
