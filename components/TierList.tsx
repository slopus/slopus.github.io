import React, { useState } from 'react';
import { Tier } from '../types/tier';

interface TierListProps<T> {
  tier: Tier;
  items: T[];
  hasMore: boolean;
  loading?: boolean;
  onFetchMore: () => void;
  onDensityChange: (density: number) => void;
  renderItem: (item: T) => React.ReactNode;
  onViewAll?: () => void;
  totalItems?: number;
}

export const TierList = <T,>({
  tier,
  items,
  hasMore,
  loading = false,
  onFetchMore,
  onDensityChange,
  renderItem,
  onViewAll,
  totalItems
}: TierListProps<T>) => {
  const [activeDot, setActiveDot] = useState(0);
  const densityOptions = [2, 5, 10];
  const itemsToShow = items.slice(0, tier.density);

  const colorClasses = {
    red: {
      border: 'border-red-400',
      bg: 'bg-red-50',
      text: 'text-red-400',
      button: 'bg-white text-red-400 border border-red-400'
    },
    orange: {
      border: 'border-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-500',
      button: 'bg-white text-orange-500 border border-orange-500'
    },
    yellow: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-500',
      button: 'bg-white text-yellow-500 border border-yellow-500'
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-500',
      button: 'bg-white text-green-500 border border-green-500'
    },
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-500',
      button: 'bg-white text-blue-500 border border-blue-500'
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-500',
      button: 'bg-white text-purple-500 border border-purple-500'
    }
  };

  const colors = colorClasses[tier.color];
  const totalPages = Math.ceil(items.length / tier.density);
  const showCarouselDots = totalPages > 1;

  return (
    <div className={`border-2 ${colors.border} rounded-lg overflow-hidden`}>
      {/* Tier Header */}
      <div className={`px-2 py-2 ${colors.bg} flex justify-between items-center`}>
        <span className={`text-xl font-bold ${colors.text}`}>{tier.title}</span>
        {onViewAll && (totalItems || hasMore) && (
          <button 
            onClick={onViewAll}
            className={`px-3 py-1 text-xs ${colors.button} rounded`}
          >
            {totalItems ? `all ${totalItems}` : `${items.length} more`} →
          </button>
        )}
      </div>
      
      {/* Content Area */}
      <div className="bg-white p-3 relative overflow-hidden">
        <div className="flex flex-col gap-2">
          {itemsToShow.map((item, index) => (
            <div key={index} className="grid-cell">
              {renderItem(item)}
            </div>
          ))}
          
          {/* Load more button */}
          {hasMore && (
            <button 
              onClick={onFetchMore}
              disabled={loading}
              className="h-[60px] bg-gray-50 rounded-lg flex items-center justify-center px-3 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            >
              <div className="text-sm text-gray-500">
                {loading ? 'Loading...' : 'Load more items'}
              </div>
            </button>
          )}
        </div>
        
        {/* Peek hint for more content */}
        {hasMore && (
          <div className="absolute -right-5 top-3 w-10 h-32 bg-gray-100 rounded-l-lg opacity-50"></div>
        )}
      </div>
      
      {/* Carousel Dots */}
      {showCarouselDots && (
        <div className="flex items-center justify-center gap-1.5 py-2.5 bg-white">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setActiveDot(index)}
              className={`transition-all duration-200 ${
                activeDot === index
                  ? `w-5 h-1.5 ${colors.text.replace('text-', 'bg-')} rounded-sm`
                  : 'w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400'
              }`}
              aria-label={`Page ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Density Selector */}
      <div className="flex gap-2 items-center px-2 py-2 bg-gray-50 text-xs border-t border-gray-200">
        <span className="text-gray-600">Rows:</span>
        {densityOptions.map((density) => (
          <button 
            key={density}
            onClick={() => onDensityChange(density)}
            className={`px-2 py-1 rounded ${
              tier.density === density 
                ? 'bg-gray-800 text-white border border-gray-800' 
                : 'bg-white border border-gray-300'
            }`}
          >
            {density}
          </button>
        ))}
      </div>
    </div>
  );
};