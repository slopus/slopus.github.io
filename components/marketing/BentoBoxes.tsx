import React from 'react'
import ConnectionVisual from './ConnectionVisual'
import MobileSetup from './MobileSetup'
import DownloadGrid from './DownloadGrid'
import Features from './Features'
import ExampleSetups from './ExampleSetups'

/**
 * Responsive bento-style layout for the marketing sections.
 * - Below 640px: single column in this exact order
 *   ConnectionVisual → MobileSetup → DownloadGrid → Features → ExampleSetups
 * - At ≥640px: two columns flowing by column (left column fills first),
 *   so ConnectionVisual sits above MobileSetup in the left column,
 *   and DownloadGrid sits above Features in the right column.
 */
const BentoBoxes: React.FC = () => {
  return (
    <div className="columns-1 sm:columns-2 gap-x-4 sm:gap-x-6">
      <div className="break-inside-avoid mb-4 sm:mb-6">
        <ConnectionVisual />
      </div>
      <div className="break-inside-avoid mb-4 sm:mb-6">
        <MobileSetup />
      </div>
      <div className="break-inside-avoid mb-4 sm:mb-6">
        <DownloadGrid />
      </div>
      <div className="break-inside-avoid mb-4 sm:mb-6">
        <Features />
      </div>
      <div className="break-inside-avoid mb-4 sm:mb-6">
        <ExampleSetups />
      </div>
    </div>
  )
}

export default BentoBoxes


