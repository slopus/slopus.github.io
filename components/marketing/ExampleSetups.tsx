import React from 'react';

const ExampleSetups = () => {
  const examples = [
    { icon: "💻", text: "Personal laptop → Control from couch" },
    { icon: "☁️", text: "AWS EC2 instance → Manage from anywhere" },
    { icon: "🏢", text: "Office workstation → Access from home" },
    { icon: "🚀", text: "GitHub Codespaces → Mobile development" }
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/30 rounded-2xl p-5 mb-6">
      <h3 className="text-white font-semibold text-base mb-3">Example Setups</h3>
      <div className="space-y-3">
        {examples.map((example, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-lg">{example.icon}</span>
            <span className="text-gray-300 text-sm">{example.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExampleSetups;
