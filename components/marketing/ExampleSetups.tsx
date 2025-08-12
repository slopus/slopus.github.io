import React from 'react';

const ExampleSetups = () => {
  const examples = [
    { icon: "💻", text: "Personal laptop → Control from couch" },
    { icon: "☁️", text: "AWS EC2 instance → Manage from anywhere" },
    { icon: "🏢", text: "Office workstation → Access from home" },
    { icon: "🚀", text: "GitHub Codespaces → Mobile development" }
  ];

  return (
    <div className="border border-gray-200 rounded-2xl p-5 shadow-sm" style={{backgroundColor: '#f5f5f9'}}>
      <h3 className="text-gray-900 font-semibold text-base mb-3">Example Setups</h3>
      <div className="space-y-3">
        {examples.map((example, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-lg">{example.icon}</span>
            <span className="text-gray-700 text-sm">{example.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExampleSetups;
