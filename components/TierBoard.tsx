import React, { useState } from 'react';
import { TierListContainer } from './TierListContainer';
import { useTierListStore } from '../stores/tierListStore';
import { Tier } from '../types/tier';
import { Plus, X, Edit2, Check, X as XIcon } from 'lucide-react';

interface TierBoardProps<T> {
  renderItem: (item: T) => React.ReactNode;
  onViewAll?: (tierId: string) => void;
}

const colorOptions: Tier['color'][] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

export function TierBoard<T>({ renderItem, onViewAll }: TierBoardProps<T>) {
  const { tiers, addTier, updateTier, removeTier } = useTierListStore();
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editColor, setEditColor] = useState<Tier['color']>('red');

  const handleAddTier = () => {
    const newTier: Tier = {
      id: crypto.randomUUID(),
      title: 'New Tier',
      color: 'red',
      density: 2
    };
    addTier(newTier);
    startEditing(newTier);
  };

  const startEditing = (tier: Tier) => {
    setEditingTier(tier.id);
    setEditTitle(tier.title);
    setEditColor(tier.color);
  };

  const saveEdit = () => {
    if (editingTier) {
      updateTier(editingTier, {
        title: editTitle,
        color: editColor
      });
      setEditingTier(null);
    }
  };

  const cancelEdit = () => {
    setEditingTier(null);
    setEditTitle('');
    setEditColor('red');
  };

  const handleTierChange = (tier: Tier) => {
    updateTier(tier.id, tier);
  };

  const handleRemoveTier = (tierId: string) => {
    if (confirm('Are you sure you want to remove this tier?')) {
      removeTier(tierId);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tier Board</h1>
        <button
          onClick={handleAddTier}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Tier
        </button>
      </div>

      {/* Tiers */}
      {tiers.map((tier) => (
        <div key={tier.id} className="relative">
          {/* Tier Controls */}
          <div className="flex items-center gap-2 mb-2">
            {editingTier === tier.id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                  autoFocus
                />
                <select
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value as Tier['color'])}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={saveEdit}
                  className="p-1 text-green-600 hover:text-green-700"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <XIcon size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-gray-700">
                  {tier.title}
                </span>
                <button
                  onClick={() => startEditing(tier)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleRemoveTier(tier.id)}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>

          {/* Tier List */}
          <TierListContainer
            tier={tier}
            onTierChange={handleTierChange}
            renderItem={renderItem}
            onViewAll={onViewAll ? () => onViewAll(tier.id) : undefined}
          />
        </div>
      ))}

      {/* Empty State */}
      {tiers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">No tiers yet</h3>
            <p className="text-gray-400 mb-4">Create your first tier to get started</p>
            <button
              onClick={handleAddTier}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Tier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}