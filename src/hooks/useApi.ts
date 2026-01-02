import { useEffect, useMemo, useState } from "react";

const BASE_URL = 'https://api.hakush.in/zzz/data';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const cache: Record<string, { data: any; timestamp: number }> = {};

export type ApiResource = 'weapons' | 'characters' | 'weapon' | 'character';

export type AgentApiResponse = {
}

export type AgentListApiResponse = {
  [key: string]: {}
}

export type WEngineApiResponse = {
  BaseProperty: {
    Value: number;
  };
  RandProperty: {
    Name: string;
    Value: number;
  };
  Talents: {
    [K in '1' | '2' | '3' | '4' | '5']: {
      Name: string;
      Desc: string;
    };
  };
};

export type WEngineListApiResponse = {
  [key: string]: {
    icon: string
    rank: number
    type: number
    EN: string
    desc: string
    KO: string
    CHS: string
    JA: string
  }
}

export type RelicListApiResponse = {
  [key: string]: {
    icon: string
    EN: {
      name: string
      desc2: string
      desc4: string
    }
  }
}

type ResourceMap = {
  'character': AgentApiResponse;
  'characters': AgentListApiResponse;
  'weapon': WEngineApiResponse;
  'weapons': WEngineListApiResponse;
  'relics': RelicListApiResponse;
};

export default function useApi<K extends keyof ResourceMap>(
  resource: K, 
  id?: string | null
): { data: ResourceMap[K] | undefined, isLoading: boolean, error: any } {
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const url = useMemo(() => {
    switch (resource) {
      case 'character':
        if (!id) return null;
        return `${BASE_URL}/en/character/${id}.json`;
      case 'characters':
        return `${BASE_URL}/character.json`;
      case 'weapon':
        if (!id) return null;
        return `${BASE_URL}/en/weapon/${id}.json`;
      case 'weapons':
        return `${BASE_URL}/weapon.json`;
      case 'relics':
        return `${BASE_URL}/equipment.json`;
      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  }, [resource, id]);

  useEffect(() => {
    // Guard Clause: If URL is null, reset states and exit
    if (!url) {
      setData(undefined);
      setIsLoading(false);
      setError(undefined);
      return;
    }

    const controller = new AbortController();

    async function getData(url: string) {
      const now = Date.now();
      const cachedItem = cache[url];

      // Determine if the cache is still "fresh"
      const isFresh = cachedItem && (now - cachedItem.timestamp) < CACHE_DURATION;

      if (cachedItem) {
        setData(cachedItem.data);
        setIsLoading(false);
        if (isFresh) return;
      }

      setIsLoading(true);
      setError(undefined);
      try { 
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        cache[url] = { data: json, timestamp: Date.now() };
        setData(json);
      } catch (e: any) {
        if (e && e.name !== "AbortError") {
          setError(e);
          console.error("Failed to fetch API data", e);
        }
      } finally {
        setIsLoading(false);
      }
    }

    getData(url);
    return () => controller.abort(); // cleanup
  }, [url]);

  return { data, isLoading, error };
}
