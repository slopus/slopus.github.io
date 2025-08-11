import React from 'react';
import RequirementBanner from './RequirementBanner';
import Header from './Header';
import ConnectionVisual from './ConnectionVisual';
import SetupSteps from './SetupSteps';
import DownloadGrid from './DownloadGrid';
import Features from './Features';
import ExampleSetups from './ExampleSetups';
import GithubLink from './GithubLink';
import Footer from './Footer';

// Main App Component - Compose all components together
export default function MobileLandingPage() {
  return (
    <div className="min-h-screen bg-black px-5 py-6">
      <div className="max-w-md mx-auto">
        <RequirementBanner />
        <Header />
        <ConnectionVisual />
        <SetupSteps />
        <DownloadGrid />
        <Features />
        <ExampleSetups />
        <GithubLink />
        <Footer />
      </div>
    </div>
  );
}
