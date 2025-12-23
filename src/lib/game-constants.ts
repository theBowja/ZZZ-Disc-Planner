export const RANK_LABELS: Record<number, string> = {
  2: 'B',
  3: 'A',
  4: 'S',
};

export const TYPE_LABELS: Record<number, string> = {
  1: 'Attack',
  2: 'Stun',
  3: 'Anomaly',
  4: 'Support',
  5: 'Defense',
  6: 'Rupture'
};

export const ELEMENT_LABELS: Record<number, string> = {
  200: 'Physical',
  201: 'Fire',
  202: 'Ice',
  203: 'Electric',
  205: 'Ether',
};

// Unified helper functions
export const getRankLabel = (id: number) => RANK_LABELS[id] ?? `Rank ${id}`;
export const getTypeLabel = (id: number) => TYPE_LABELS[id] ?? `Type ${id}`;
export const getElementLabel = (id: number) => ELEMENT_LABELS[id] ?? `Element ${id}`;