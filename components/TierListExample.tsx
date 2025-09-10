import React from 'react';
import { TierBoard } from './TierBoard';

interface Project {
  id: string;
  name: string;
  stars: string;
  lastUpdated: string;
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="h-[60px] bg-gray-100 rounded-lg flex items-center px-3">
    <div className="w-10 h-10 bg-gray-300 rounded mr-3"></div>
    <div className="flex-1">
      <div className="text-sm font-semibold text-gray-800">{project.name}</div>
      <div className="text-xs text-gray-500 mt-0.5">⭐ {project.stars} • Updated {project.lastUpdated}</div>
    </div>
  </div>
);

export const TierListExample = () => {
  const handleViewAll = (tierId: string) => {
    console.log(`View all items for tier: ${tierId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TierBoard
        renderItem={(project: Project) => <ProjectCard project={project} />}
        onViewAll={handleViewAll}
      />
    </div>
  );
};