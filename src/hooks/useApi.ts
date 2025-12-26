import { useEffect, useMemo, useState } from "react";

const BASE_URL = 'https://api.hakush.in/zzz/data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const cache: Record<string, { data: any; timestamp: number }> = {};

export type ApiResource = 'weapons' | 'characters' | 'weapon' | 'character';

export type AgentApiResponse = {
}

export type AgentListApiResponse = {
  [key: string]: {}
}

export type WEngineApiResponse = {
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

export function useApi(resource: 'character', id: string | null | undefined): { data: AgentApiResponse | undefined, isLoading: boolean, error: any };
export function useApi(resource: 'characters'): { data: AgentListApiResponse | undefined, isLoading: boolean, error: any };
export function useApi(resource: 'weapon', id: string | null | undefined): { data: WEngineApiResponse | undefined, isLoading: boolean, error: any };
export function useApi(resource: 'weapons'): { data: WEngineListApiResponse | undefined, isLoading: boolean, error: any };

export default function useApi(resource: ApiResource, id: string | null | undefined = undefined) {
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  const url = useMemo(() => {
    switch (resource) {
      case 'character':
        if (!id) return null;
        return `${BASE_URL}/en/character/${id}.json`;
      case 'characters':
        return `${BASE_URL}/en/character.json`;
      case 'weapon':
        if (!id) return null;
        return `${BASE_URL}/en/weapon/${id}.json`;
      case 'weapons':
        return `${BASE_URL}/en/weapon.json`;
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
