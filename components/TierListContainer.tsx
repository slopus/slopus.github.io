import React, { useEffect } from 'react';
import { TierList } from './TierList';
import { useLazyTierItems } from '../hooks/useLazyTierItems';
import { Tier } from '../types/tier';

interface TierListContainerProps<T> {
  tier: Tier;
  onTierChange: (tier: Tier) => void;
  renderItem: (item: T) => React.ReactNode;
  onViewAll?: () => void;
}

export function TierListContainer<T>({
  tier,
  onTierChange,
  renderItem,
  onViewAll
}: TierListContainerProps<T>) {
  const { items, loading, hasMore, fetchMore, refresh } = useLazyTierItems<T>({
    tierId: tier.id,
    initialPageSize: 20
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDensityChange = (density: number) => {
    onTierChange({
      ...tier,
      density
    });
  };

  return (
    <TierList
      tier={tier}
      items={items}
      hasMore={hasMore}
      loading={loading}
      onFetchMore={fetchMore}
      onDensityChange={handleDensityChange}
      renderItem={renderItem}
      onViewAll={onViewAll}
      totalItems={items.length}
    />
  );
}