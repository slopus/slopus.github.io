import { useState, useCallback } from 'react';
import { PaginatedItems } from '../types/tier';

interface UseLazyTierItemsOptions {
  tierId: string;
  initialPageSize?: number;
}

interface UseLazyTierItemsReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  error: Error | null;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useLazyTierItems<T>({
  tierId,
  initialPageSize = 20
}: UseLazyTierItemsOptions): UseLazyTierItemsReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = useCallback(async (cursor?: string, replace = false) => {
    setLoading(true);
    setError(null);

    try {
      // Replace this with your actual API call
      const response = await fetch(`/api/tiers/${tierId}/items?${new URLSearchParams({
        ...(cursor && { cursor }),
        limit: initialPageSize.toString()
      })}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }

      const data: PaginatedItems<T> = await response.json();
      
      if (replace) {
        setItems(data.items);
      } else {
        setItems(prev => [...prev, ...data.items]);
      }
      
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [tierId, initialPageSize]);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchItems(nextCursor);
  }, [fetchItems, loading, hasMore, nextCursor]);

  const refresh = useCallback(async () => {
    setItems([]);
    setNextCursor(undefined);
    setHasMore(true);
    await fetchItems(undefined, true);
  }, [fetchItems]);

  return {
    items,
    loading,
    hasMore,
    error,
    fetchMore,
    refresh
  };
}