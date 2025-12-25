import { useEffect, useState } from "react";

const BASE_URL = 'https://api.hakush.in/zzz/data';

export type ApiEntity = 'weapons' | 'characters' | 'weapon' | 'character';

export default function useApi<T>(entity: ApiEntity, id: string | null | undefined = undefined) {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  let url: string | null = null;
  if (entity === 'weapons' || entity === 'characters') {
    const singleEntity = entity.slice(0, -1);
    url = `${BASE_URL}/${singleEntity}.json`;
  } else if (id) {
    url = `${BASE_URL}/en/${entity}/${id}.json`;
  }

  useEffect(() => {
    async function getData() {
      if (!url) {
        setData(undefined);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(undefined);
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e);
        console.error("Failed to fetch API data", e);
      } finally {
        setIsLoading(false);
      }
    }
    getData();
  }, [url]);

  return { data, isLoading, error };
}
