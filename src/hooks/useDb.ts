// hooks/useAgents.ts
import { useEffect } from 'react'
import { useStore } from '../lib/store'

// hooks/useMetadata.ts
export function useDb<T>(key: 'agents' | 'wengines', enabled: boolean = true) {
  const data = useStore((s) => s.db[key]);
  const isLoading = useStore((s) => s.loadingStates[key]);
  const fetchDb = useStore((s) => s.fetchDb);

  useEffect(() => {
    if (enabled) {
      fetchDb(key);
    }
  }, [key, fetchDb, enabled]);

  return {
    data: data as Record<string, T> | null,
    dataList: (data ? Object.values(data) : []) as T[],
    isLoading,
  };
}