// hooks/useAgents.ts
import { useEffect } from 'react'
import { useStore } from '../lib/store'

// hooks/useMetadata.ts
export function useDb<T>(key: 'agents' | 'wengines') {
  const data = useStore((s) => s.db[key]);
  const isLoading = useStore((s) => s.loadingStates[key]);
  const fetchDb = useStore((s) => s.fetchDb);

  useEffect(() => {
    fetchDb(key);
  }, [key, fetchDb]);

  return {
    data: data as Record<string, T> | null, // Cast to the specific type you're expecting
    isLoading,
    list: (data ? Object.values(data) : []) as T[],
  };
}