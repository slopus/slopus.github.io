export interface Tier {
  id: string;  // UUID
  title: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
  density: number;
}

export interface PaginatedItems<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount?: number;
}

export interface TierItem {
  id: string;
  tierId: string;
  itemId: string;
  addedAt: Date;
}