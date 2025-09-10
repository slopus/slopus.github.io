import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tier } from '../types/tier';

interface TierListStore {
  tiers: Tier[];
  addTier: (tier: Tier) => void;
  updateTier: (tierId: string, updates: Partial<Tier>) => void;
  removeTier: (tierId: string) => void;
  getTier: (tierId: string) => Tier | undefined;
}

export const useTierListStore = create<TierListStore>()(
  persist(
    (set, get) => ({
      tiers: [],
      
      addTier: (tier: Tier) => {
        set((state) => ({
          tiers: [...state.tiers, tier]
        }));
      },
      
      updateTier: (tierId: string, updates: Partial<Tier>) => {
        set((state) => ({
          tiers: state.tiers.map(tier => 
            tier.id === tierId 
              ? { ...tier, ...updates }
              : tier
          )
        }));
      },
      
      removeTier: (tierId: string) => {
        set((state) => ({
          tiers: state.tiers.filter(tier => tier.id !== tierId)
        }));
      },
      
      getTier: (tierId: string) => {
        return get().tiers.find(tier => tier.id === tierId);
      }
    }),
    {
      name: 'tier-list-storage'
    }
  )
);